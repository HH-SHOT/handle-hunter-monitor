
import { PlatformConfig } from './platform-config.ts';

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

export async function checkHandleWithHeadRequest(url: string): Promise<boolean | null> {
  try {
    console.log(`Sending HEAD request to ${url}`);
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': DEFAULT_USER_AGENT
      }
    });
    
    console.log(`HEAD request to ${url} returned status: ${response.status}`);
    
    if (response.status === 404) {
      console.log(`HEAD request to ${url} returned 404 - handle likely available`);
      return true;
    } else if (response.status === 200) {
      console.log(`HEAD request to ${url} returned 200 - proceeding to content check`);
      return null; // Proceed to content check
    } else {
      console.log(`HEAD request to ${url} returned ${response.status} - proceeding to content check`);
      return null; // Proceed to content check
    }
  } catch (error) {
    console.error(`Error during HEAD request to ${url}:`, error);
    return null; // Proceed to content check
  }
}

export async function checkHandleWithContentAnalysis(url: string, notFoundText: string[]): Promise<boolean> {
  try {
    console.log(`Performing content analysis for ${url} with patterns:`, notFoundText);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml'
      },
      redirect: 'follow'
    });
    
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
    
    console.log(`None of the indicator patterns found in content for ${url} - handle is unavailable`);
    return false;
    
  } catch (error) {
    console.error(`Error during content analysis for ${url}:`, error);
    // If we can't access the page at all, it might be an indication that the handle could be available
    console.log(`Exception during fetch might indicate handle is available`);
    return true;
  }
}

export async function checkHandleAvailability(handle: string, platform: string, platformConfig: PlatformConfig): Promise<'available' | 'unavailable'> {
  // Clean the handle - remove @ if present
  const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle;
  console.log(`Checking handle availability for "${cleanHandle}" on platform ${platform}`);

  // Construct the URL correctly based on platform
  let url = '';
  if (platform === 'tiktok') {
    // TikTok already has @ in the URL format
    url = platformConfig.url + cleanHandle;
  } else {
    url = platformConfig.url + cleanHandle;
  }
  
  console.log(`Constructed URL for checking: ${url}`);

  try {
    // Step 1: Try HEAD request first for faster checking
    const headResult = await checkHandleWithHeadRequest(url);
    
    if (headResult === true) {
      console.log(`HEAD request indicates ${handle} on ${platform} is available`);
      return 'available';
    } else if (headResult === false) {
      console.log(`HEAD request indicates ${handle} on ${platform} is unavailable`);
      return 'unavailable';
    }
    
    // Step 2: Fallback to content analysis if HEAD request was inconclusive
    console.log(`HEAD request was inconclusive for ${handle}, performing content analysis`);
    const contentResult = await checkHandleWithContentAnalysis(url, platformConfig.notFoundText);
    
    console.log(`Final determination for ${handle} on ${platform}: ${contentResult ? 'available' : 'unavailable'}`);
    return contentResult ? 'available' : 'unavailable';
    
  } catch (err) {
    console.error(`Error checking ${platform} handle ${handle}:`, err);
    // If we're getting errors, we'll assume it's unavailable to be safe
    return 'unavailable';
  }
}
