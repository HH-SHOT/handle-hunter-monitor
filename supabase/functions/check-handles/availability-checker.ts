
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
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': DEFAULT_USER_AGENT
      }
    });
    
    const html = await response.text();
    
    // Check if any of the not found text patterns are present
    const isAvailable = notFoundText.some(text => {
      const found = html.includes(text);
      if (found) {
        console.log(`Found indicator text: "${text}" on ${url}`);
      }
      return found;
    });
    
    console.log(`Content analysis for ${url}: Handle ${isAvailable ? 'available' : 'unavailable'}`);
    return isAvailable;
    
  } catch (error) {
    console.error(`Error during content analysis for ${url}:`, error);
    return false; // Default to unavailable on error
  }
}

export async function checkHandleAvailability(handle: string, platform: string, platformConfig: PlatformConfig): Promise<'available' | 'unavailable'> {
  let url = platformConfig.url + handle;
  // For TikTok specifically, make sure the @ symbol is present but not duplicated
  if (platform === 'tiktok' && !url.includes('@')) {
    url = platformConfig.url + handle;
  }
  
  console.log(`Checking handle availability for ${url}`);

  try {
    // Step 1: Try HEAD request first
    const headResult = await checkHandleWithHeadRequest(url);
    
    if (headResult !== null) {
      return headResult ? 'available' : 'unavailable';
    }
    
    // Step 2: Fallback to content analysis
    const contentResult = await checkHandleWithContentAnalysis(url, platformConfig.notFoundText);
    return contentResult ? 'available' : 'unavailable';
    
  } catch (err) {
    console.error(`Error checking ${platform} handle ${handle}:`, err);
    return 'unavailable'; // Default to unavailable on error
  }
}
