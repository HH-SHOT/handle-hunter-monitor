
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

async function checkPlatformAvailability(
  handle: string,
  platform: string,
  platformConfig: PlatformConfig,
  supabaseClient: ReturnType<typeof createClient>
): Promise<boolean> {
  const logger = getLogger(supabaseClient);
  
  try {
    // Fast-path for API-based checks (Twitch)
    if (platform === 'twitch' && platformConfig.useApi) {
      return await checkTwitchHandleWithAPI(handle, supabaseClient);
    }

    // Fast-path for proxy-based checks (Instagram, TikTok)
    if ((platform === 'instagram' || platform === 'tiktok') && platformConfig.useProxy) {
      return await checkWithProxy(handle, platform, platformConfig, supabaseClient);
    }

    // For all other platforms or if specific checks fail, use content analysis
    const formattedHandle = platformConfig.requiresAtSymbol ? 
      (handle.startsWith('@') ? handle : `@${handle}`) : 
      handle;
      
    const url = platformConfig.url + formattedHandle;
    
    const response = await sendProxiedRequest(url, 'GET');
    const html = await response.text();
    
    // Check for availability indicators
    const isAvailable = platformConfig.availableIndicators.some(
      indicator => html.toLowerCase().includes(indicator.toLowerCase())
    );
    
    // Check for taken indicators
    const isTaken = platformConfig.takenIndicators.some(
      indicator => html.toLowerCase().includes(indicator.toLowerCase())
    );
    
    // Check for not found text if defined
    const notFoundMatch = platformConfig.notFoundText.some(
      text => html.toLowerCase().includes(text.toLowerCase())
    );
    
    logger.info(`Content analysis results for ${handle} on ${platform}:`, {
      platform,
      handleName: handle,
      isAvailable,
      isTaken,
      notFoundMatch
    });
    
    // Return true if available indicators are found or notFoundText matches
    // and no taken indicators are found
    return (isAvailable || notFoundMatch) && !isTaken;
  } catch (error) {
    logger.error(`Error checking platform availability for ${handle} on ${platform}:`, {
      platform,
      handleName: handle,
      error
    });
    throw error;
  }
}

// Optimized proxy check specifically for Instagram and TikTok
async function checkWithProxy(
  handle: string,
  platform: string,
  platformConfig: PlatformConfig,
  supabaseClient: ReturnType<typeof createClient>
): Promise<boolean> {
  const logger = getLogger(supabaseClient);
  const formattedHandle = platformConfig.requiresAtSymbol ? 
    (handle.startsWith('@') ? handle : `@${handle}`) : 
    handle;
  
  const url = platformConfig.url + formattedHandle;
  
  try {
    // Use faster timeout for proxy
    const response = await sendProxiedRequest(url, 'GET');
    
    // For these platforms, a 404 usually means available
    if (response.status === 404) {
      return true;
    }
    
    // If we got a 200, quickly check for taken indicators
    if (response.status === 200) {
      const html = await response.text();
      
      // Check for taken indicators (faster than checking all criteria)
      const isTaken = platformConfig.takenIndicators.some(
        indicator => html.toLowerCase().includes(indicator.toLowerCase())
      );
      
      return !isTaken;
    }
    
    // Default to unavailable for any other status
    return false;
  } catch (error) {
    logger.error(`Error in proxy check for ${handle} on ${platform}:`, {
      platform,
      handleName: handle,
      error
    });
    // Fall back to standard check in case of error
    return false;
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

// Process handle checks in batch - increasing batch size for faster processing
export async function processBatchedHandleChecks(
  supabaseClient: ReturnType<typeof createClient>,
  handles: any[],
  batchSize = 20
): Promise<Record<string, 'available' | 'unavailable'>> {
  const logger = getLogger(supabaseClient);
  const results: Record<string, 'available' | 'unavailable'> = {};
  
  // Add handles to queue with estimated times
  for (const handle of handles) {
    requestQueue.enqueue({
      id: handle.id,
      platform: handle.platform,
      name: handle.name,
      priority: handle.status === 'monitoring' ? 2 : 1,
    });
  }

  // Process queue in larger batches
  while (true) {
    const tasks = requestQueue.dequeue(batchSize);
    if (tasks.length === 0) break;
    
    const checkPromises = tasks.map(async (task) => {
      try {
        const platformConfig = PLATFORMS[task.platform];
        if (!platformConfig) {
          logger.warn(`Unsupported platform: ${task.platform}`);
          requestQueue.complete(task.id);
          results[task.id] = 'unavailable';
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
        logger.error(`Error checking handle ${task.name}:`, error);
        if (task.retries < 2) {
          requestQueue.retry(task, false);
        } else {
          results[task.id] = 'unavailable';
          requestQueue.complete(task.id);
        }
      }
    });
    
    await Promise.all(checkPromises);
  }
  
  return results;
}

// Main function to check handle availability
export async function checkHandleAvailability(
  handle: string,
  platform: string,
  platformConfig: PlatformConfig,
  supabaseClient: ReturnType<typeof createClient>
): Promise<'available' | 'unavailable'> {
  const logger = getLogger(supabaseClient);
  
  const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle;
  
  try {
    const isAvailable = await checkPlatformAvailability(
      cleanHandle, 
      platform, 
      platformConfig,
      supabaseClient
    );
    
    logger.info(`Final availability result for ${cleanHandle} on ${platform}: ${isAvailable ? 'available' : 'unavailable'}`, {
      platform,
      handleName: cleanHandle,
      result: isAvailable ? 'available' : 'unavailable'
    });
    
    return isAvailable ? 'available' : 'unavailable';
  } catch (error) {
    logger.error(`Error in checkHandleAvailability for ${cleanHandle} on ${platform}:`, {
      platform,
      handleName: cleanHandle,
      error
    });
    return 'unavailable';
  }
}

export { PLATFORMS } from './platform-config.ts';
