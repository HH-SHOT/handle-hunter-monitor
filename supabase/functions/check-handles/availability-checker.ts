import { PlatformConfig } from './platform-config.ts';
import { sendProxiedRequest } from './http-client.ts';
import { analyzeContent } from './content-analyzer.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

// Track request counts per platform to implement rate limiting
const requestCounts: Record<string, number> = {};
const MAX_REQUESTS_PER_PLATFORM = 50; // Maximum requests per platform
const RESET_INTERVAL = 1000 * 60 * 15; // Reset counts every 15 minutes

// Rate limiter to prevent abusing the service
function checkRateLimit(platform: string): boolean {
  // Initialize count if not exists
  if (!requestCounts[platform]) {
    requestCounts[platform] = 0;
  }
  
  // Check if limit exceeded
  if (requestCounts[platform] >= MAX_REQUESTS_PER_PLATFORM) {
    console.log(`⚠️ Rate limit reached for platform ${platform}: ${requestCounts[platform]} requests`);
    return false;
  }
  
  // Increment count
  requestCounts[platform]++;
  console.log(`Rate limit status for ${platform}: ${requestCounts[platform]}/${MAX_REQUESTS_PER_PLATFORM}`);
  return true;
}

// Reset rate limits periodically
setInterval(() => {
  console.log("Resetting rate limits");
  for (const platform in requestCounts) {
    requestCounts[platform] = 0;
  }
}, RESET_INTERVAL);

// Function to get cached token or fetch a new one
async function getTwitchAccessToken(supabaseClient: ReturnType<typeof createClient>): Promise<string> {
  console.log('Getting Twitch access token');
  
  try {
    // Try to get cached token
    const { data: tokenData, error } = await supabaseClient
      .from('api_tokens')
      .select('*')
      .eq('id', 'twitch')
      .single();

    const now = new Date();

    // If we have a valid token that hasn't expired, return it
    if (tokenData && new Date(tokenData.expires_at) > now) {
      console.log('Using cached Twitch token');
      return tokenData.access_token;
    }

    // Otherwise, get a new token
    console.log('Fetching new Twitch token');
    const clientId = Deno.env.get("TWITCH_CLIENT_ID");
    const clientSecret = Deno.env.get("TWITCH_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      throw new Error("Twitch API authentication not configured");
    }

    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    });

    if (!response.ok) {
      throw new Error("Failed to get Twitch access token");
    }

    const { access_token, expires_in } = await response.json();
    
    // Calculate expiration time (subtract 5 minutes for safety margin)
    const expiresAt = new Date(now.getTime() + (expires_in - 300) * 1000);

    // Store the new token
    const { error: upsertError } = await supabaseClient
      .from('api_tokens')
      .upsert({
        id: 'twitch',
        access_token,
        expires_at: expiresAt.toISOString(),
      });

    if (upsertError) {
      console.error('Error storing token:', upsertError);
    }

    return access_token;
  } catch (error) {
    console.error('Error in getTwitchAccessToken:', error);
    throw error;
  }
}

// Check Twitter handle directly using the API
async function checkTwitterHandleWithAPI(handle: string): Promise<boolean> {
  console.log(`Checking Twitter handle ${handle} using Twitter API`);
  try {
    // Twitter API requires bearer token for authentication
    const bearerToken = Deno.env.get("TWITTER_BEARER_TOKEN");
    if (!bearerToken) {
      console.error("Missing TWITTER_BEARER_TOKEN environment variable");
      throw new Error("Twitter API authentication not configured");
    }

    const apiUrl = `https://api.twitter.com/2/users/by/username/${handle}`;
    console.log(`Making request to Twitter API: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Twitter API response status: ${response.status}`);
    
    if (response.status === 404) {
      console.log(`✅ Twitter API indicates ${handle} is available (404 Not Found)`);
      return true; // Handle is available
    }
    
    if (response.status === 200) {
      console.log(`❌ Twitter API indicates ${handle} is taken (200 OK)`);
      return false; // Handle is taken
    }
    
    // Handle rate limiting and other status codes
    if (response.status === 429) {
      console.error(`⚠️ Twitter API rate limit exceeded`);
      throw new Error("Twitter API rate limit exceeded");
    }
    
    // Log other status codes for debugging
    console.warn(`⚠️ Twitter API returned unexpected status code: ${response.status}`);
    
    // Get response body for more information
    const responseBody = await response.json();
    console.log(`Twitter API response body:`, responseBody);
    
    // Default to unavailable for safety
    return false;
  } catch (error) {
    console.error(`Error checking Twitter handle with API:`, error);
    throw error;
  }
}

// Update the Twitch API check function to use cached token
async function checkTwitchHandleWithAPI(handle: string, supabaseClient: ReturnType<typeof createClient>): Promise<boolean> {
  console.log(`Checking Twitch handle ${handle} using Twitch API`);
  try {
    const clientId = Deno.env.get("TWITCH_CLIENT_ID");
    if (!clientId) {
      throw new Error("Twitch client ID not configured");
    }

    const accessToken = await getTwitchAccessToken(supabaseClient);

    // Check user exists
    const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=${handle}`, {
      headers: {
        "Client-ID": clientId,
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      if (userResponse.status === 401) {
        // Token might be invalid despite our caching, retry once with a fresh token
        console.log('Token rejected, fetching fresh token');
        const freshToken = await getTwitchAccessToken(supabaseClient);
        const retryResponse = await fetch(`https://api.twitch.tv/helix/users?login=${handle}`, {
          headers: {
            "Client-ID": clientId,
            "Authorization": `Bearer ${freshToken}`,
          },
        });
        if (!retryResponse.ok) {
          throw new Error(`Twitch API error: ${retryResponse.status}`);
        }
        const retryData = await retryResponse.json();
        return !retryData.data || retryData.data.length === 0;
      }
      throw new Error(`Twitch API error: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    return !userData.data || userData.data.length === 0;
  } catch (error) {
    console.error(`Error checking Twitch handle with API:`, error);
    throw error;
  }
}

// Initial HEAD request to check availability (faster)
export async function checkHandleWithHeadRequest(url: string): Promise<boolean | null> {
  try {
    console.log(`Sending HEAD request to ${url}`);
    const response = await sendProxiedRequest(url, 'HEAD');
    
    console.log(`HEAD request to ${url} returned status: ${response.status}`);
    
    if (response.status === 404) {
      console.log(`✅ HEAD request to ${url} returned 404 - handle likely available`);
      return true;
    } else if (response.status === 200) {
      console.log(`❌ HEAD request to ${url} returned 200 - handle likely taken`);
      return false;
    } else {
      console.log(`⚠️ HEAD request to ${url} returned ${response.status} - proceeding to content check`);
      return null;
    }
  } catch (error) {
    console.error(`Error during HEAD request to ${url}:`, error);
    return null; // Proceed to content check
  }
}

// Detailed content analysis for more accurate results
export async function checkHandleWithContentAnalysis(url: string, platformConfig: PlatformConfig): Promise<boolean> {
  try {
    console.log(`Performing content analysis for ${url}`);
    
    const response = await sendProxiedRequest(url, 'GET');
    console.log(`GET request to ${url} returned status: ${response.status}`);
    
    // If we get a 404 status, the handle is likely available
    if (response.status === 404) {
      console.log(`✅ GET request to ${url} returned 404 - handle likely available`);
      return true;
    }
    
    // If we get a non-200 status that isn't 404, we need to be careful
    if (!response.ok && response.status !== 404) {
      console.log(`⚠️ Response not OK (${response.status}) for ${url} - might be a server issue rather than availability`);
      
      // For certain status codes, we can make determinations
      if (response.status === 429) {
        console.error(`⚠️ Rate limited (429) for ${url} - platform is blocking our requests`);
        return false; // Conservative approach: assume unavailable
      }
      
      if (response.status >= 500) {
        console.error(`⚠️ Server error (${response.status}) for ${url} - cannot determine availability reliably`);
        return false; // Conservative approach: assume unavailable
      }
    }
    
    const html = await response.text();
    console.log(`Got HTML content for ${url} (length: ${html.length})`);
    
    // Print some sample of the HTML content to debug
    console.log(`HTML sample (first 300 chars): ${html.substring(0, 300).replace(/\n/g, ' ')}`);
    
    // Check for HTTP redirects or canonical URLs that might indicate a handle change
    if (response.redirected) {
      console.log(`⚠️ Request was redirected from ${url} to ${response.url} - this may affect analysis`);
      
      // If redirected to homepage, the handle likely doesn't exist
      const urlParts = url.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      
      if (!response.url.includes(lastPart)) {
        console.log(`✅ Redirected to a page that doesn't include the handle - likely available`);
        return true;
      }
    }
    
    return analyzeContent(html, url, platformConfig);
  } catch (error) {
    console.error(`Error during content analysis for ${url}:`, error);
    // In case of connection errors or timeouts, we'll default to unavailable to avoid false positives
    return false;
  }
}

// Main function to check handle availability
export async function checkHandleAvailability(handle: string, platform: string, platformConfig: PlatformConfig): Promise<'available' | 'unavailable'> {
  // Clean the handle - remove @ if present
  const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle;
  console.log(`Checking handle availability for "${cleanHandle}" on platform ${platform}`);

  // Check rate limits
  if (!checkRateLimit(platform)) {
    console.log(`⚠️ Rate limit exceeded for ${platform} - returning unavailable as a fallback`);
    return 'unavailable';
  }

  try {
    // Initialize Supabase client for token management
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing required environment variables");
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Use Twitch API if configured
    if (platform === 'twitch' && platformConfig.useApi) {
      try {
        const isAvailable = await checkTwitchHandleWithAPI(cleanHandle, supabaseClient);
        return isAvailable ? 'available' : 'unavailable';
      } catch (error) {
        console.error(`Error using Twitch API, falling back to content analysis:`, error);
        // Fall back to regular content analysis if API fails
      }
    }
    
    // Construct the URL correctly based on platform configuration
    let url = '';
    if (platformConfig.requiresAtSymbol) {
      url = platformConfig.url + (cleanHandle.startsWith('@') ? cleanHandle : `@${cleanHandle}`);
    } else {
      url = platformConfig.url + cleanHandle;
    }
    
    console.log(`Constructed URL for checking: ${url}`);

    // First try with HEAD request (but skip for Instagram, Twitter/X as they're less reliable)
    let headResult = null;
    if (platform !== 'instagram' && platform !== 'twitter') {
      headResult = await checkHandleWithHeadRequest(url);
      
      if (headResult === true) {
        console.log(`✅ HEAD request indicates ${handle} on ${platform} is available`);
        return 'available';
      } else if (headResult === false) {
        console.log(`❌ HEAD request indicates ${handle} on ${platform} is unavailable`);
        return 'unavailable';
      }
    } else {
      console.log(`Skipping HEAD request for ${platform} handle ${handle}, proceeding directly to content analysis`);
    }
    
    // If HEAD request was inconclusive or skipped, perform content analysis
    console.log(`${headResult === null ? 'HEAD request was inconclusive' : 'HEAD request skipped'} for ${handle}, performing content analysis`);
    const contentResult = await checkHandleWithContentAnalysis(url, platformConfig);
    
    // Log the final determination and return result
    if (contentResult) {
      console.log(`✅ Final determination for ${handle} on ${platform}: available`);
      return 'available';
    } else {
      console.log(`❌ Final determination for ${handle} on ${platform}: unavailable`);
      return 'unavailable';
    }
    
  } catch (err) {
    console.error(`Error checking ${platform} handle ${handle}:`, err);
    // If there's an error in the overall process, default to unavailable
    return 'unavailable';
  }
}
