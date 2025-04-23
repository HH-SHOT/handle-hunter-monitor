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
    // Handle API-based checks for specific platforms
    if (platform === 'twitch' && platformConfig.useApi) {
      return await checkTwitchHandleWithAPI(handle, supabaseClient);
    }

    // For all other platforms or if API check fails, use content analysis
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
        
        logger.info(`Final status for ${task.name} on ${task.platform}: ${status}`, {
          handleId: task.id,
          platform: task.platform,
          name: task.name,
          status: status
        });
        
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
