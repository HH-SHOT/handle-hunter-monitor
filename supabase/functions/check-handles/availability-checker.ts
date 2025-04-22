
import { PlatformConfig } from './platform-config.ts';
import { sendProxiedRequest } from './http-client.ts';
import { analyzeContent } from './content-analyzer.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";
import { requestQueue } from './queue-manager.ts';
import { getTwitchAccessToken } from './database-operations.ts';
import { initLogger } from './logger.ts';

// Initialize the logger
let logger = null;

function getLogger(supabaseClient: ReturnType<typeof createClient>) {
  if (!logger) {
    logger = initLogger(supabaseClient);
  }
  return logger;
}

// Process handle checks in batch
export async function processBatchedHandleChecks(
  supabaseClient: ReturnType<typeof createClient>,
  handles: any[],
  batchSize = 5
): Promise<Record<string, 'available' | 'unavailable'>> {
  const logger = getLogger(supabaseClient);
  const results: Record<string, 'available' | 'unavailable'> = {};
  
  // Add handles to queue
  for (const handle of handles) {
    requestQueue.enqueue({
      id: handle.id,
      platform: handle.platform,
      name: handle.name,
      priority: handle.status === 'monitoring' ? 2 : 1 // Prioritize monitoring handles
    });
  }
  
  // Process queue in batches
  while (true) {
    const tasks = requestQueue.dequeue(batchSize);
    if (tasks.length === 0) break;
    
    const checkPromises = tasks.map(async (task) => {
      try {
        const platformConfig = PLATFORMS[task.platform];
        if (!platformConfig) {
          logger.warn(`Unsupported platform: ${task.platform}`, {
            handleId: task.id,
            platform: task.platform
          });
          requestQueue.complete(task.id);
          results[task.id] = 'unavailable'; // Default for unsupported platforms
          return;
        }
        
        const status = await checkHandleAvailability(
          task.name,
          task.platform,
          platformConfig,
          supabaseClient
        );
        
        results[task.id] = status;
        requestQueue.complete(task.id);
      } catch (error) {
        logger.error(`Error checking handle ${task.name} on ${task.platform}:`, {
          handleId: task.id,
          error
        });
        
        // Retry logic is handled by the queue
        requestQueue.retry(task, false);
      }
    });
    
    // Wait for all checks in this batch to complete
    await Promise.all(checkPromises);
  }
  
  return results;
}

// Check Twitter handle directly using the API
async function checkTwitterHandleWithAPI(
  handle: string,
  supabaseClient: ReturnType<typeof createClient>
): Promise<boolean> {
  const logger = getLogger(supabaseClient);
  logger.info(`Checking Twitter handle ${handle} using Twitter API`);
  
  try {
    // Twitter API requires bearer token for authentication
    const bearerToken = Deno.env.get("TWITTER_BEARER_TOKEN");
    if (!bearerToken) {
      logger.error("Missing TWITTER_BEARER_TOKEN environment variable");
      throw new Error("Twitter API authentication not configured");
    }

    const apiUrl = `https://api.twitter.com/2/users/by/username/${handle}`;
    logger.info(`Making request to Twitter API: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    logger.info(`Twitter API response status: ${response.status}`, {
      platform: 'twitter',
      handleName: handle,
      status: response.status
    });
    
    if (response.status === 404) {
      logger.info(`Twitter API indicates ${handle} is available (404 Not Found)`, {
        platform: 'twitter',
        handleName: handle
      });
      return true; // Handle is available
    }
    
    if (response.status === 200) {
      logger.info(`Twitter API indicates ${handle} is taken (200 OK)`, {
        platform: 'twitter',
        handleName: handle
      });
      return false; // Handle is taken
    }
    
    // Handle rate limiting and other status codes
    if (response.status === 429) {
      logger.warn(`Twitter API rate limit exceeded`, {
        platform: 'twitter',
        handleName: handle
      });
      
      // Update queue rate limits
      const resetTime = response.headers.get('x-rate-limit-reset');
      if (resetTime) {
        const resetTimeMs = parseInt(resetTime) * 1000 - Date.now();
        requestQueue.setRateLimit('twitter', 0, resetTimeMs);
        logger.info(`Setting Twitter rate limit reset time: ${new Date(parseInt(resetTime) * 1000).toISOString()}`);
      }
      
      throw new Error("Twitter API rate limit exceeded");
    }
    
    // Log other status codes for debugging
    logger.warn(`Twitter API returned unexpected status code: ${response.status}`, {
      platform: 'twitter',
      handleName: handle
    });
    
    // Get response body for more information
    const responseBody = await response.json();
    logger.info(`Twitter API response body:`, {
      platform: 'twitter',
      handleName: handle,
      response: responseBody
    });
    
    // Default to unavailable for safety
    return false;
  } catch (error) {
    logger.error(`Error checking Twitter handle with API:`, {
      platform: 'twitter',
      handleName: handle,
      error
    });
    throw error;
  }
}

// Update the Twitch API check function to use cached token
async function checkTwitchHandleWithAPI(
  handle: string,
  supabaseClient: ReturnType<typeof createClient>
): Promise<boolean> {
  const logger = getLogger(supabaseClient);
  logger.info(`Checking Twitch handle ${handle} using Twitch API`);
  
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
        logger.warn('Token rejected, fetching fresh token', {
          platform: 'twitch',
          handleName: handle,
          status: userResponse.status
        });
        
        const freshToken = await getTwitchAccessToken(supabaseClient);
        const retryResponse = await fetch(`https://api.twitch.tv/helix/users?login=${handle}`, {
          headers: {
            "Client-ID": clientId,
            "Authorization": `Bearer ${freshToken}`,
          },
        });
        
        if (!retryResponse.ok) {
          logger.error(`Twitch API error on retry: ${retryResponse.status}`, {
            platform: 'twitch',
            handleName: handle,
            status: retryResponse.status
          });
          throw new Error(`Twitch API error: ${retryResponse.status}`);
        }
        
        const retryData = await retryResponse.json();
        logger.info(`Twitch API retry response for ${handle}:`, {
          platform: 'twitch',
          handleName: handle,
          data: retryData
        });
        
        return !retryData.data || retryData.data.length === 0;
      }
      
      if (userResponse.status === 429) {
        // Handle rate limiting
        logger.warn(`Twitch API rate limit exceeded`, {
          platform: 'twitch',
          handleName: handle
        });
        
        // Update queue rate limits - default to 5 minute reset if not specified
        const resetAfter = userResponse.headers.get('Ratelimit-Reset') || '300';
        requestQueue.setRateLimit('twitch', 0, parseInt(resetAfter) * 1000);
        
        throw new Error(`Twitch API rate limited: ${userResponse.status}`);
      }
      
      logger.error(`Twitch API error: ${userResponse.status}`, {
        platform: 'twitch',
        handleName: handle,
        status: userResponse.status
      });
      
      throw new Error(`Twitch API error: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    logger.info(`Twitch API response for ${handle}:`, {
      platform: 'twitch',
      handleName: handle,
      data: userData
    });
    
    return !userData.data || userData.data.length === 0;
  } catch (error) {
    logger.error(`Error checking Twitch handle with API:`, {
      platform: 'twitch',
      handleName: handle,
      error
    });
    throw error;
  }
}

// Initial HEAD request to check availability (faster)
export async function checkHandleWithHeadRequest(
  url: string,
  platform: string,
  handleName: string,
  supabaseClient: ReturnType<typeof createClient>
): Promise<boolean | null> {
  const logger = getLogger(supabaseClient);
  
  try {
    logger.info(`Sending HEAD request to ${url}`, {
      platform,
      handleName
    });
    
    const response = await sendProxiedRequest(url, 'HEAD');
    
    logger.info(`HEAD request to ${url} returned status: ${response.status}`, {
      platform,
      handleName,
      status: response.status
    });
    
    if (response.status === 404) {
      logger.info(`HEAD request to ${url} returned 404 - handle likely available`, {
        platform,
        handleName
      });
      return true;
    } else if (response.status === 200) {
      logger.info(`HEAD request to ${url} returned 200 - handle likely taken`, {
        platform,
        handleName
      });
      return false;
    } else {
      logger.warn(`HEAD request to ${url} returned ${response.status} - proceeding to content check`, {
        platform,
        handleName,
        status: response.status
      });
      return null;
    }
  } catch (error) {
    logger.error(`Error during HEAD request to ${url}:`, {
      platform,
      handleName,
      error
    });
    return null; // Proceed to content check
  }
}

// Detailed content analysis for more accurate results
export async function checkHandleWithContentAnalysis(
  url: string,
  platform: string,
  handleName: string,
  platformConfig: PlatformConfig,
  supabaseClient: ReturnType<typeof createClient>
): Promise<boolean> {
  const logger = getLogger(supabaseClient);
  
  try {
    logger.info(`Performing content analysis for ${url}`, {
      platform,
      handleName
    });
    
    const response = await sendProxiedRequest(url, 'GET');
    logger.info(`GET request to ${url} returned status: ${response.status}`, {
      platform,
      handleName,
      status: response.status
    });
    
    // If we get a 404 status, the handle is likely available
    if (response.status === 404) {
      logger.info(`GET request to ${url} returned 404 - handle likely available`, {
        platform,
        handleName
      });
      return true;
    }
    
    // If we get a non-200 status that isn't 404, we need to be careful
    if (!response.ok && response.status !== 404) {
      logger.warn(`Response not OK (${response.status}) for ${url} - might be a server issue rather than availability`, {
        platform,
        handleName,
        status: response.status
      });
      
      // For certain status codes, we can make determinations
      if (response.status === 429) {
        logger.error(`Rate limited (429) for ${url} - platform is blocking our requests`, {
          platform,
          handleName
        });
        
        // Update queue rate limits - default to 5 minute reset
        requestQueue.setRateLimit(platform, 0, 5 * 60 * 1000);
        
        return false; // Conservative approach: assume unavailable
      }
      
      if (response.status >= 500) {
        logger.error(`Server error (${response.status}) for ${url} - cannot determine availability reliably`, {
          platform,
          handleName,
          status: response.status
        });
        return false; // Conservative approach: assume unavailable
      }
    }
    
    const html = await response.text();
    logger.info(`Got HTML content for ${url} (length: ${html.length})`, {
      platform,
      handleName
    });
    
    // Check for HTTP redirects or canonical URLs that might indicate a handle change
    if (response.redirected) {
      logger.warn(`Request was redirected from ${url} to ${response.url} - this may affect analysis`, {
        platform,
        handleName,
        originalUrl: url,
        redirectUrl: response.url
      });
      
      // If redirected to homepage, the handle likely doesn't exist
      const urlParts = url.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      
      if (!response.url.includes(lastPart)) {
        logger.info(`Redirected to a page that doesn't include the handle - likely available`, {
          platform,
          handleName
        });
        return true;
      }
    }
    
    const result = analyzeContent(html, url, platformConfig);
    logger.info(`Content analysis result for ${platform}/${handleName}: ${result ? 'available' : 'unavailable'}`, {
      platform,
      handleName,
      result
    });
    
    return result;
  } catch (error) {
    logger.error(`Error during content analysis for ${url}:`, {
      platform,
      handleName,
      error
    });
    // In case of connection errors or timeouts, we'll default to unavailable to avoid false positives
    return false;
  }
}

// Main function to check handle availability
export async function checkHandleAvailability(
  handle: string,
  platform: string,
  platformConfig: PlatformConfig,
  supabaseClient: ReturnType<typeof createClient>
): Promise<'available' | 'unavailable'> {
  const logger = getLogger(supabaseClient);
  
  // Clean the handle - remove @ if present
  const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle;
  logger.info(`Checking handle availability for "${cleanHandle}" on platform ${platform}`, {
    platform,
    handleName: cleanHandle
  });

  try {
    // Use Twitter API if configured
    if (platform === 'twitter' && Deno.env.get("TWITTER_BEARER_TOKEN")) {
      try {
        const isAvailable = await checkTwitterHandleWithAPI(cleanHandle, supabaseClient);
        return isAvailable ? 'available' : 'unavailable';
      } catch (error) {
        logger.error(`Error using Twitter API, falling back to content analysis:`, {
          platform,
          handleName: cleanHandle,
          error
        });
        // Fall back to regular content analysis if API fails
      }
    }
    
    // Use Twitch API if configured
    if (platform === 'twitch' && platformConfig.useApi) {
      try {
        const isAvailable = await checkTwitchHandleWithAPI(cleanHandle, supabaseClient);
        return isAvailable ? 'available' : 'unavailable';
      } catch (error) {
        logger.error(`Error using Twitch API, falling back to content analysis:`, {
          platform,
          handleName: cleanHandle,
          error
        });
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
    
    logger.info(`Constructed URL for checking: ${url}`, {
      platform,
      handleName: cleanHandle
    });

    // First try with HEAD request (but skip for Instagram, Twitter/X as they're less reliable)
    let headResult = null;
    if (platform !== 'instagram' && platform !== 'twitter') {
      headResult = await checkHandleWithHeadRequest(url, platform, cleanHandle, supabaseClient);
      
      if (headResult === true) {
        logger.info(`HEAD request indicates ${handle} on ${platform} is available`, {
          platform,
          handleName: cleanHandle
        });
        return 'available';
      } else if (headResult === false) {
        logger.info(`HEAD request indicates ${handle} on ${platform} is unavailable`, {
          platform,
          handleName: cleanHandle
        });
        return 'unavailable';
      }
    } else {
      logger.info(`Skipping HEAD request for ${platform} handle ${handle}, proceeding directly to content analysis`, {
        platform,
        handleName: cleanHandle
      });
    }
    
    // If HEAD request was inconclusive or skipped, perform content analysis
    logger.info(`${headResult === null ? 'HEAD request was inconclusive' : 'HEAD request skipped'} for ${handle}, performing content analysis`, {
      platform,
      handleName: cleanHandle
    });
    
    const contentResult = await checkHandleWithContentAnalysis(
      url,
      platform,
      cleanHandle,
      platformConfig,
      supabaseClient
    );
    
    // Log the final determination and return result
    if (contentResult) {
      logger.info(`Final determination for ${handle} on ${platform}: available`, {
        platform,
        handleName: cleanHandle,
        result: 'available'
      });
      return 'available';
    } else {
      logger.info(`Final determination for ${handle} on ${platform}: unavailable`, {
        platform,
        handleName: cleanHandle,
        result: 'unavailable'
      });
      return 'unavailable';
    }
    
  } catch (err) {
    logger.error(`Error checking ${platform} handle ${handle}:`, {
      platform,
      handleName: cleanHandle,
      error: err
    });
    // If there's an error in the overall process, default to unavailable
    return 'unavailable';
  }
}

// Export the PLATFORMS object from platform-config.ts
export { PLATFORMS } from './platform-config.ts';
