
import { getRandomUserAgent, generateSessionId, createProxyUrl } from './proxy-config.ts';

// Function to send a request through the Bright Data proxy
export async function sendProxiedRequest(url: string, method: 'HEAD' | 'GET' = 'GET'): Promise<Response> {
  const sessionId = generateSessionId();
  const proxyUrl = createProxyUrl(sessionId);
  const userAgent = getRandomUserAgent();

  console.log(`Sending ${method} request to ${url} via proxy session ${sessionId}`);
  console.log(`Using User-Agent: ${userAgent}`);
  console.log(`Full proxy URL being used: ${proxyUrl} (DO NOT SHARE THIS)`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000); // 7 second timeout
  
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
