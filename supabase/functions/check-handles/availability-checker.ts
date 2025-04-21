
import { PlatformConfig } from './platform-config.ts';
import { sendProxiedRequest } from './http-client.ts';
import { analyzeContent } from './content-analyzer.ts';

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
      return null;
    }
  } catch (error) {
    console.error(`Error during HEAD request to ${url}:`, error);
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
      if (response.status === 404) {
        return true;
      }
    }
    
    const html = await response.text();
    console.log(`Got HTML content for ${url} (length: ${html.length})`);
    
    return analyzeContent(html, url, notFoundText);
  } catch (error) {
    console.error(`Error during content analysis for ${url}:`, error);
    return true; // If all attempts fail, it's safer to assume the handle might be available
  }
}

export async function checkHandleAvailability(handle: string, platform: string, platformConfig: PlatformConfig): Promise<'available' | 'unavailable'> {
  // Clean the handle - remove @ if present
  const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle;
  console.log(`Checking handle availability for "${cleanHandle}" on platform ${platform}`);

  // Construct the URL correctly based on platform configuration
  let url = '';
  if (platformConfig.requiresAtSymbol) {
    url = platformConfig.url + (cleanHandle.startsWith('@') ? cleanHandle : `@${cleanHandle}`);
  } else {
    url = platformConfig.url + cleanHandle;
  }
  
  console.log(`Constructed URL for checking: ${url}`);

  try {
    // Skip HEAD request for Instagram and Twitter as they're less reliable
    let headResult = null;
    if (platform !== 'instagram' && platform !== 'twitter') {
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
    
    console.log(`${headResult === null ? 'HEAD request was inconclusive' : 'HEAD request skipped'} for ${handle}, performing content analysis`);
    const contentResult = await checkHandleWithContentAnalysis(url, platformConfig.notFoundText);
    
    console.log(`Final determination for ${handle} on ${platform}: ${contentResult ? 'available' : 'unavailable'}`);
    return contentResult ? 'available' : 'unavailable';
    
  } catch (err) {
    console.error(`Error checking ${platform} handle ${handle}:`, err);
    return 'unavailable';
  }
}
