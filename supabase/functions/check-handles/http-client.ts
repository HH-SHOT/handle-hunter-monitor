
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
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
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
      if ((await response.clone().text()).toLowerCase().includes('captcha')) {
        console.warn(`⚠️ CAPTCHA detected on ${url} - our request was flagged`);
      }
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error(`Request to ${url} timed out after 10 seconds`);
      throw new Error(`Request timed out after 10 seconds`);
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
export async function getHtmlWithRetries(url: string, maxRetries = 2): Promise<{html: string, status: number}> {
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
      // Exponential backoff: 1s, 2s, 4s, etc.
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
    }
  }
  
  throw new Error(`Failed to fetch ${url} after ${maxRetries + 1} attempts`);
}
