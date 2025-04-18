
import { PlatformConfig } from './platform-config';

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

export async function checkHandleWithHeadRequest(url: string): Promise<boolean | null> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': DEFAULT_USER_AGENT
      }
    });
    
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
        'User-Agent': DEFAULT_USER_AGENT
      }
    });
    
    if (!response.ok) {
      console.log(`Response not OK (${response.status}) for ${url}, might indicate availability`);
      
      // For certain status codes, the handle might be available
      if (response.status === 404) {
        return true;
      }
    }
    
    const html = await response.text();
    console.log(`Got HTML content for ${url} (length: ${html.length})`);
    
    // Enhanced logging: Log a sample of the HTML to check what we're getting
    console.log(`Sample HTML: ${html.substring(0, 200)}...`);
    
    // Check if any of the not found text patterns are present
    const isAvailable = notFoundText.some(text => {
      const found = html.includes(text);
      if (found) {
        console.log(`Found indicator text: "${text}" on ${url} - handle is available`);
      }
      return found;
    });
    
    if (!isAvailable) {
      console.log(`None of the indicator patterns found in content for ${url} - handle is unavailable`);
    }
    
    console.log(`Content analysis for ${url}: Handle ${isAvailable ? 'available' : 'unavailable'}`);
    return isAvailable;
    
  } catch (error) {
    console.error(`Error during content analysis for ${url}:`, error);
    return false; // Default to unavailable on error
  }
}

export async function checkHandleAvailability(handle: string, platform: string, platformConfig: PlatformConfig): Promise<'available' | 'unavailable'> {
  // Construct the URL correctly based on platform
  let url = platformConfig.url + handle;
  
  // For TikTok specifically, ensure @ is present but not duplicated
  if (platform === 'tiktok') {
    if (handle.startsWith('@')) {
      url = platformConfig.url + handle.substring(1); // Remove @ from handle if it already has one
    } else {
      // The URL already includes @ in the config
    }
  }
  
  console.log(`Checking handle availability for ${url} on platform ${platform}`);

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
    return 'unavailable'; // Default to unavailable on error
  }
}
