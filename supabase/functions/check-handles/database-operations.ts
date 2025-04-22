import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";
import { initLogger, Logger } from './logger.ts';
import { initCacheManager, CacheManager } from './cache-manager.ts';

let logger: Logger | null = null;
let cacheManager: CacheManager | null = null;

// Initialize utilities
function initUtils(supabaseClient: ReturnType<typeof createClient>): { logger: Logger, cacheManager: CacheManager } {
  if (!logger) {
    logger = initLogger(supabaseClient);
  }
  
  if (!cacheManager) {
    cacheManager = initCacheManager(supabaseClient);
  }
  
  return { logger, cacheManager };
}

export async function updateHandleStatus(
  supabaseClient: ReturnType<typeof createClient>,
  handleId: string,
  newStatus: 'available' | 'unavailable',
  lastChecked: string
): Promise<void> {
  const { logger, cacheManager } = initUtils(supabaseClient);
  logger.info(`Updating handle ${handleId} status to ${newStatus}`);
  
  try {
    const { data: handle, error: getError } = await supabaseClient
      .from('handles')
      .select('name, platform, status')
      .eq('id', handleId)
      .single();
      
    if (getError) {
      logger.error(`Error fetching handle ${handleId}:`, { error: getError });
      throw getError;
    }
    
    const statusChanged = handle.status !== newStatus;
    
    const { error: updateError } = await supabaseClient
      .from('handles')
      .update({ 
        status: newStatus, 
        last_checked: lastChecked 
      })
      .eq('id', handleId);
      
    if (updateError) {
      logger.error(`Error updating handle ${handleId}:`, { error: updateError });
      throw updateError;
    }
    
    logger.info(`Successfully updated handle ${handleId} status`, {
      handleId,
      handleName: handle.name,
      platform: handle.platform,
      oldStatus: handle.status,
      newStatus,
      statusChanged
    });
    
    // Create a history record
    const { error: historyError } = await supabaseClient
      .from('handle_history')
      .insert({
        handle_id: handleId,
        status: newStatus,
      });
      
    if (historyError) {
      logger.error(`Error creating history for handle ${handleId}:`, { error: historyError });
    } else {
      logger.info(`Successfully created history record for handle ${handleId}`);
    }
    
    // Cache the result
    await cacheManager.cacheCheckResult(
      handleId,
      handle.name,
      handle.platform,
      newStatus
    );
  } catch (error) {
    logger.error(`Error in updateHandleStatus for handle ${handleId}:`, { error });
    throw error;
  }
}

export async function getHandlesToCheck(
  supabaseClient: ReturnType<typeof createClient>
): Promise<any[]> {
  const { logger } = initUtils(supabaseClient);
  logger.info("Fetching handles to check");
  
  try {
    const { data: handles, error: fetchError } = await supabaseClient
      .from('handles')
      .select('*');
      
    if (fetchError) {
      logger.error("Error fetching handles:", { error: fetchError });
      throw fetchError;
    }
    
    logger.info(`Successfully fetched ${handles?.length || 0} handles`);
    return handles || [];
  } catch (error) {
    logger.error("Error in getHandlesToCheck:", { error });
    throw error;
  }
}

export async function getSingleHandle(
  supabaseClient: ReturnType<typeof createClient>,
  handleId: string
): Promise<any> {
  const { logger, cacheManager } = initUtils(supabaseClient);
  logger.info(`Fetching handle with ID: ${handleId}`);
  
  try {
    // Check cache first
    const cachedCheck = await cacheManager.getCachedCheck(handleId);
    if (cachedCheck) {
      logger.info(`Using cached result for handle ${handleId}`, {
        handleId,
        handleName: cachedCheck.handleName,
        platform: cachedCheck.platform,
        status: cachedCheck.status,
        cachedAt: cachedCheck.checkedAt,
        expiresAt: cachedCheck.expiresAt
      });
    }
    
    const { data: handle, error: fetchError } = await supabaseClient
      .from('handles')
      .select('*')
      .eq('id', handleId)
      .single();
      
    if (fetchError) {
      logger.error(`Error fetching handle ${handleId}:`, { error: fetchError });
      throw fetchError;
    }
    
    if (!handle) {
      logger.warn(`Handle with ID ${handleId} not found`);
      return null;
    }
    
    logger.info(`Successfully fetched handle: ${handle.name} (${handle.platform})`, {
      handleId,
      handleName: handle.name,
      platform: handle.platform,
      status: handle.status
    });
    
    // If we have a valid cached check, merge the status
    if (cachedCheck && cachedCheck.status !== handle.status) {
      logger.info(`Returning cached status for handle ${handleId}`, {
        databaseStatus: handle.status,
        cachedStatus: cachedCheck.status
      });
      handle.status = cachedCheck.status;
      handle.cached = true;
    }
    
    return handle;
  } catch (error) {
    logger.error(`Error in getSingleHandle for ID ${handleId}:`, { error });
    throw error;
  }
}

// Function to get handles with specific status
export async function getHandlesByStatus(
  supabaseClient: ReturnType<typeof createClient>,
  status: 'available' | 'unavailable' | 'monitoring'
): Promise<any[]> {
  const { logger } = initUtils(supabaseClient);
  logger.info(`Fetching handles with status: ${status}`);
  
  try {
    const { data: handles, error: fetchError } = await supabaseClient
      .from('handles')
      .select('*')
      .eq('status', status);
      
    if (fetchError) {
      logger.error(`Error fetching handles with status ${status}:`, { error: fetchError });
      throw fetchError;
    }
    
    logger.info(`Successfully fetched ${handles?.length || 0} handles with status ${status}`);
    return handles || [];
  } catch (error) {
    logger.error(`Error in getHandlesByStatus for status ${status}:`, { error });
    throw error;
  }
}

// Function to get handle history
export async function getHandleHistory(
  supabaseClient: ReturnType<typeof createClient>,
  handleId: string
): Promise<any[]> {
  const { logger } = initUtils(supabaseClient);
  logger.info(`Fetching history for handle with ID: ${handleId}`);
  
  try {
    const { data: history, error: fetchError } = await supabaseClient
      .from('handle_history')
      .select('*')
      .eq('handle_id', handleId)
      .order('created_at', { ascending: false });
      
    if (fetchError) {
      logger.error(`Error fetching history for handle ${handleId}:`, { error: fetchError });
      throw fetchError;
    }
    
    logger.info(`Successfully fetched ${history?.length || 0} history records for handle ${handleId}`);
    return history || [];
  } catch (error) {
    logger.error(`Error in getHandleHistory for handle ${handleId}:`, { error });
    throw error;
  }
}

// Get cached token or fetch a new one
export async function getTwitchAccessToken(supabaseClient: ReturnType<typeof createClient>): Promise<string> {
  const { logger, cacheManager } = initUtils(supabaseClient);
  logger.info('Getting Twitch access token');
  
  try {
    // Try to get cached token
    const cachedToken = await cacheManager.getCachedToken('twitch');
    
    // If we have a valid token, return it
    if (cachedToken) {
      logger.info('Using cached Twitch token', {
        expiresAt: cachedToken.expiresAt.toISOString()
      });
      return cachedToken.token;
    }

    // Otherwise, get a new token
    logger.info('Fetching new Twitch token');
    const clientId = Deno.env.get("TWITCH_CLIENT_ID");
    const clientSecret = Deno.env.get("TWITCH_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      logger.error("Twitch API authentication not configured");
      throw new Error("Twitch API authentication not configured");
    }

    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    });

    if (!response.ok) {
      logger.error("Failed to get Twitch access token", {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error("Failed to get Twitch access token");
    }

    const { access_token, expires_in } = await response.json();
    
    // Cache the new token
    await cacheManager.cacheToken('twitch', access_token, expires_in);

    return access_token;
  } catch (error) {
    logger.error('Error in getTwitchAccessToken:', { error });
    throw error;
  }
}

// Function to clear expired cache entries
export async function clearExpiredCache(supabaseClient: ReturnType<typeof createClient>): Promise<void> {
  const { logger, cacheManager } = initUtils(supabaseClient);
  logger.info('Clearing expired cache entries');
  
  try {
    await cacheManager.clearExpiredEntries();
    logger.info('Successfully cleared expired cache entries');
  } catch (error) {
    logger.error('Error clearing expired cache entries:', { error });
  }
}

// Flush logs to database
export async function flushLogs(supabaseClient: ReturnType<typeof createClient>): Promise<void> {
  const { logger } = initUtils(supabaseClient);
  
  try {
    await logger.flush();
  } catch (error) {
    console.error('Error flushing logs:', error);
  }
}
