import { PlatformConfig } from './platform-config.ts';

// Bright Data proxy configuration
const PROXY_HOST = "brd.superproxy.io";
const PROXY_PORT = "33335";
const PROXY_USERNAME = "brd-customer-hl_3fded35d-zone-datacenter_proxy1";
const PROXY_PASSWORD = "sg46x8lwwynp";

// Modern User-Agent strings
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

// Get a random User-Agent
function getRandomUserAgent(): string {
  const randomIndex = Math.floor(Math.random() * USER_AGENTS.length);
  return USER_AGENTS[randomIndex];
}

// Generate a random session ID for proxy rotation
function generateSessionId(): string {
  return `-session-${Math.floor(Math.random() * 1000000)}`;
}

// Create the proxy URL with session
function createProxyUrl(sessionId?: string): string {
  const username = sessionId ? `${PROXY_USERNAME}${sessionId}` : PROXY_USERNAME;
  return `http://${username}:${PROXY_PASSWORD}@${PROXY_HOST}:${PROXY_PORT}`;
}

// Function to send a request through the Bright Data proxy
async function sendProxiedRequest(url: string, method: 'HEAD' | 'GET' = 'GET'): Promise<Response> {
  const sessionId = generateSessionId();
  const proxyUrl = createProxyUrl(sessionId);
  const userAgent = getRandomUserAgent();

  console.log(`Sending ${method} request to ${url} via proxy session ${sessionId}`);
  console.log(`Using User-Agent: ${userAgent}`);
  console.log(`Full proxy URL being used: ${proxyUrl} (DO NOT SHARE THIS)`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000); // 7 second timeout
  
  try {
    // Note: In Deno's context, we can't directly use the proxy parameter
    // Instead, Deno edge functions are already running in a cloud environment
    // and will handle outbound connections properly
    const response = await fetch(url, {
      method: method,
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        // Adding these headers to test if they help with proxy identification
        'X-Forwarded-For': '88.213.234.176', // Random IP to help proxy routing
        'Via': '1.1 proxy.brightdata.com'
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    console.log(`Response status for ${url}: ${response.status}`);
    console.log(`Response headers: ${JSON.stringify(Object.fromEntries([...response.headers]))}`);
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error(`Request to ${url} timed out after 7 seconds`);
      throw new Error(`Request timed out after 7 seconds`);
    }
    console.error(`Error details:`, error);
    throw error;
  }
}

export async function checkHandleWithHeadRequest(url: string): Promise<boolean | null> {
  try {
    console.log(`Sending HEAD request to ${url}`);
    const response = await sendProxiedRequest(url, 'HEAD');
    
    console.log(`HEAD request to ${url} returned status: ${response.status}`);
    
    if (response.status === 404) {
      console.log(`HEAD request to ${url} returned 404 - handle likely available`);
      return true;
    } else if (response.status === 200) {
      console.log(`HEAD request to ${url} returned 200 - handle likely taken`);
      return false;
    } else {
      console.log(`HEAD request to ${url} returned ${response.status} - proceeding to content check`);
      return null; // Proceed to content check
    }
  } catch (error) {
    console.error(`Error during HEAD request to ${url}:`, error);
    // Try once more with a different proxy session
    try {
      console.log(`Retrying HEAD request to ${url} with a new proxy session`);
      const response = await sendProxiedRequest(url, 'HEAD');
      
      if (response.status === 404) {
        return true;
      } else if (response.status === 200) {
        return false;
      }
    } catch (retryError) {
      console.error(`Retry also failed for HEAD request to ${url}:`, retryError);
    }
    
    return null; // Proceed to content check
  }
}

export async function checkHandleWithContentAnalysis(url: string, notFoundText: string[]): Promise<boolean> {
  try {
    console.log(`Performing content analysis for ${url} with patterns:`, notFoundText);
    
    const response = await sendProxiedRequest(url, 'GET');
    
    console.log(`GET request to ${url} returned status: ${response.status}`);
    
    if (!response.ok) {
      console.log(`Response not OK (${response.status}) for ${url}, might indicate availability`);
      
      // For certain status codes, the handle might be available
      if (response.status === 404) {
        return true;
      }
    }
    
    const html = await response.text();
    console.log(`Got HTML content for ${url} (length: ${html.length})`);
    
    // Log a sample of the HTML for debugging
    console.log(`Sample HTML (first 300 chars): ${html.substring(0, 300)}...`);
    console.log(`Sample HTML (last 300 chars): ${html.substring(Math.max(0, html.length - 300))}...`);
    
    // Check for Instagram specific not found text
    if (url.includes('instagram.com')) {
      const instagramNotAvailableText = "Sorry, this page isn't available.";
      if (html.includes(instagramNotAvailableText)) {
        console.log(`Found Instagram not available text: "${instagramNotAvailableText}" on ${url} - handle is available`);
        return true;
      }
      
      // Also check for variations
      if (html.includes("The link you followed may be broken, or the page may have been removed")) {
        console.log(`Found Instagram error page text on ${url} - handle is available`);
        return true;
      }
    }
    
    // Check if any of the not found text patterns are present
    for (const text of notFoundText) {
      if (html.includes(text)) {
        console.log(`Found indicator text: "${text}" on ${url} - handle is available`);
        return true;
      }
    }
    
    // Additional checks for 404-like content
    const lowerHtml = html.toLowerCase();
    if (
      lowerHtml.includes("404") && 
      (lowerHtml.includes("not found") || lowerHtml.includes("doesn't exist") || lowerHtml.includes("page not found"))
    ) {
      console.log(`Found 404-like content on ${url} - handle is available`);
      return true;
    }
    
    // Check for empty profiles or error pages
    if (
      (lowerHtml.includes("error") && lowerHtml.includes("page")) ||
      (lowerHtml.includes("not available") && lowerHtml.includes("account"))
    ) {
      console.log(`Found error or unavailable account indicators on ${url} - handle is available`);
      return true;
    }
    
    console.log(`None of the indicator patterns found in content for ${url} - handle is taken`);
    return false;
    
  } catch (error) {
    console.error(`Error during content analysis for ${url}:`, error);
    
    // Try once more with a different proxy session
    try {
      console.log(`Retrying content analysis for ${url} with a new proxy session`);
      const response = await sendProxiedRequest(url, 'GET');
      
      if (!response.ok) {
        if (response.status === 404) {
          return true;
        }
      }
      
      const html = await response.text();
      
      // Check for not found indicators
      for (const text of notFoundText) {
        if (html.includes(text)) {
          return true;
        }
      }
      
      // Check for 404-like content in retry
      const lowerHtml = html.toLowerCase();
      if (
        lowerHtml.includes("404") && 
        (lowerHtml.includes("not found") || lowerHtml.includes("doesn't exist") || lowerHtml.includes("page not found"))
      ) {
        return true;
      }
      
      return false;
    } catch (retryError) {
      console.error(`Retry also failed for content analysis for ${url}:`, retryError);
      // If all attempts fail, it's safer to assume the handle might be available
      return true;
    }
  }
}

export async function checkHandleAvailability(handle: string, platform: string, platformConfig: PlatformConfig): Promise<'available' | 'unavailable'> {
  // Clean the handle - remove @ if present
  const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle;
  console.log(`Checking handle availability for "${cleanHandle}" on platform ${platform}`);

  // Construct the URL correctly based on platform configuration
  let url = '';
  if (platformConfig.requiresAtSymbol) {
    // For platforms like TikTok that require @ in the URL
    url = platformConfig.url + (cleanHandle.startsWith('@') ? cleanHandle : `@${cleanHandle}`);
  } else {
    url = platformConfig.url + cleanHandle;
  }
  
  console.log(`Constructed URL for checking: ${url}`);

  try {
    // Skip HEAD request for Instagram and Twitter as they're less reliable
    let headResult = null;
    if (platform !== 'instagram' && platform !== 'twitter') {
      // Step 1: Try HEAD request first for faster checking
      headResult = await checkHandleWithHeadRequest(url);
      
      if (headResult === true) {
        console.log(`HEAD request indicates ${handle} on ${platform} is available`);
        return 'available';
      } else if (headResult === false) {
        console.log(`HEAD request indicates ${handle} on ${platform} is unavailable`);
        return 'unavailable';
      }
    } else {
      console.log(`Skipping HEAD request for ${platform} handle ${handle}, proceeding directly to content analysis`);
    }
    
    // Step 2: Fallback to content analysis if HEAD request was inconclusive or skipped
    console.log(`${headResult === null ? 'HEAD request was inconclusive' : 'HEAD request skipped'} for ${handle}, performing content analysis`);
    const contentResult = await checkHandleWithContentAnalysis(url, platformConfig.notFoundText);
    
    console.log(`Final determination for ${handle} on ${platform}: ${contentResult ? 'available' : 'unavailable'}`);
    return contentResult ? 'available' : 'unavailable';
    
  } catch (err) {
    console.error(`Error checking ${platform} handle ${handle}:`, err);
    // If we're getting errors, we'll make a best guess based on typical platform behavior
    return 'unavailable';
  }
}
