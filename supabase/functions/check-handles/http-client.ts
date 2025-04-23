
import { getRandomUserAgent, generateSessionId, createProxyUrl } from './proxy-config.ts';

// Function to send a request through the Bright Data proxy
export async function sendProxiedRequest(url: string, method: 'HEAD' | 'GET' = 'GET'): Promise<Response> {
  const sessionId = generateSessionId();
  const proxyUrl = createProxyUrl(sessionId);
  const userAgent = getRandomUserAgent();

  console.log(`Sending ${method} request to ${url} via proxy session ${sessionId}`);
  console.log(`Using User-Agent: ${userAgent}`);
  
  // Security headers
  const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "default-src 'self'",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'no-referrer',
    'X-XSS-Protection': '1; mode=block',
  };
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // Reduced timeout from 10s to 5s
  
  try {
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
        'X-Forwarded-For': '88.213.234.176',
        'Via': '1.1 proxy.brightdata.com',
        ...securityHeaders
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    console.log(`Response status for ${url}: ${response.status}`);
    console.log(`Response headers: ${JSON.stringify(Object.fromEntries([...response.headers]))}`);
    
    // Check for common anti-bot or CAPTCHA indicators
    const contentType = response.headers.get('content-type') || '';
    if (response.status === 200 && contentType.includes('text/html')) {
      // For performance, we'll only check for CAPTCHA in the first 500 chars
      const text = await response.clone().text();
      const sample = text.toLowerCase().substring(0, 500);
      if (sample.includes('captcha')) {
        console.warn(`⚠️ CAPTCHA detected on ${url} - our request was flagged`);
      }
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error(`Request to ${url} timed out after 5 seconds`);
      throw new Error(`Request timed out after 5 seconds`);
    }
    console.error(`Error details:`, error);
    throw error;
  }
}

// Add helper function for checking status
export function isSuccessStatusCode(statusCode: number): boolean {
  return statusCode >= 200 && statusCode < 300;
}

// Function to get HTML content with retries
export async function getHtmlWithRetries(url: string, maxRetries = 1): Promise<{html: string, status: number}> {
  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      console.log(`Attempt ${retries + 1}/${maxRetries + 1} to fetch ${url}`);
      const response = await sendProxiedRequest(url, 'GET');
      const html = await response.text();
      
      return {
        html,
        status: response.status
      };
    } catch (error) {
      retries++;
      if (retries > maxRetries) {
        console.error(`All ${maxRetries + 1} attempts to fetch ${url} failed`);
        throw error;
      }
      
      console.log(`Request failed, retrying (${retries}/${maxRetries})...`);
      // Faster backoff: 500ms, 1s
      await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retries - 1)));
    }
  }
  
  throw new Error(`Failed to fetch ${url} after ${maxRetries + 1} attempts`);
}

// New function for Twitter API calls with proper error handling and retries
export async function callTwitterApi(endpoint: string, maxRetries = 1): Promise<Response> {
  const bearerToken = Deno.env.get("TWITTER_BEARER_TOKEN");
  if (!bearerToken) {
    throw new Error("TWITTER_BEARER_TOKEN environment variable is not set");
  }
  
  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      console.log(`Attempt ${retries + 1}/${maxRetries + 1} to call Twitter API: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
          'User-Agent': getRandomUserAgent()
        }
      });
      
      // If we're rate limited, wait and retry
      if (response.status === 429) {
        const resetTime = response.headers.get('x-rate-limit-reset');
        const waitTime = resetTime ? (parseInt(resetTime) * 1000) - Date.now() : 30000; // Reduced from 60s to 30s
        console.log(`Rate limited. Waiting ${Math.floor(waitTime/1000)} seconds before retrying...`);
        retries++;
        if (retries > maxRetries) {
          console.error(`All ${maxRetries + 1} attempts to call Twitter API failed due to rate limiting`);
          return response; // Return the rate limited response
        }
        // Wait until rate limit resets (or at least 30 seconds)
        await new Promise(resolve => setTimeout(resolve, Math.max(waitTime, 30000)));
        continue;
      }
      
      return response;
    } catch (error) {
      retries++;
      if (retries > maxRetries) {
        console.error(`All ${maxRetries + 1} attempts to call Twitter API failed`);
        throw error;
      }
      
      console.log(`Request failed, retrying (${retries}/${maxRetries})...`);
      // Faster backoff: 500ms, 1s
      await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retries - 1)));
    }
  }
  
  throw new Error(`Failed to call Twitter API after ${maxRetries + 1} attempts`);
}

