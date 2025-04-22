import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

// Interface for cached check results
export interface CachedCheck {
  handleId: string;
  handleName: string;
  platform: string;
  status: 'available' | 'unavailable';
  checkedAt: string;
  expiresAt: string;
}

// Cache configuration by status
const CACHE_TTL = {
  // Cache available handles for 30 minutes
  available: 30 * 60 * 1000,
  // Cache unavailable handles for 2 hours
  unavailable: 2 * 60 * 60 * 1000,
  // Cache API tokens based on their expiration
  token: 0 // Will be set based on the token's expiration time
};

export class CacheManager {
  private supabaseClient: ReturnType<typeof createClient>;
  
  constructor(supabaseClient: ReturnType<typeof createClient>) {
    this.supabaseClient = supabaseClient;
  }
  
  // Cache a handle check result
  async cacheCheckResult(
    handleId: string,
    handleName: string,
    platform: string,
    status: 'available' | 'unavailable' | 'monitoring'
  ): Promise<void> {
    const now = new Date();
    const ttl = CACHE_TTL[status];
    const expiresAt = new Date(now.getTime() + ttl);
    
    try {
      const { error } = await this.supabaseClient
        .from('handle_cache')
        .upsert({
          handle_id: handleId,
          name: handleName,
          platform,
          status,
          checked_at: now.toISOString(),
          expires_at: expiresAt.toISOString()
        });
        
      if (error) {
        console.error(`Error caching check result: ${error.message}`);
      } else {
        console.log(`Cached result for ${platform}/${handleName}: ${status} (expires: ${expiresAt.toISOString()})`);
      }
    } catch (error) {
      console.error(`Failed to cache check result: ${error.message}`);
    }
  }
  
  // Get cached result for a handle
  async getCachedCheck(handleId: string): Promise<CachedCheck | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from('handle_cache')
        .select('*')
        .eq('handle_id', handleId)
        .single();
        
      if (error) {
        if (error.code !== 'PGRST116') { // Not found error
          console.error(`Error fetching cached check: ${error.message}`);
        }
        return null;
      }
      
      // Check if cache is still valid
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      
      if (now > expiresAt) {
        console.log(`Cache expired for handle ${data.name}`);
        return null;
      }
      
      return {
        handleId: data.handle_id,
        handleName: data.name,
        platform: data.platform,
        status: data.status,
        checkedAt: data.checked_at,
        expiresAt: data.expires_at
      };
    } catch (error) {
      console.error(`Failed to get cached check: ${error.message}`);
      return null;
    }
  }
  
  // Cache a token with its expiration time
  async cacheToken(
    tokenId: string,
    accessToken: string,
    expiresInSeconds: number
  ): Promise<void> {
    const now = new Date();
    // Subtract 5 minutes for safety margin
    const expiresAt = new Date(now.getTime() + (expiresInSeconds - 300) * 1000);
    
    try {
      // Store the token
      const { error } = await this.supabaseClient
        .from('api_tokens')
        .upsert({
          id: tokenId,
          access_token: accessToken,
          expires_at: expiresAt.toISOString(),
        });
        
      if (error) {
        console.error(`Error caching token: ${error.message}`);
      } else {
        console.log(`Cached token ${tokenId} (expires: ${expiresAt.toISOString()})`);
      }
    } catch (error) {
      console.error(`Failed to cache token: ${error.message}`);
    }
  }
  
  // Get a cached token
  async getCachedToken(tokenId: string): Promise<{ token: string, expiresAt: Date } | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from('api_tokens')
        .select('*')
        .eq('id', tokenId)
        .single();
        
      if (error) {
        console.error(`Error fetching cached token: ${error.message}`);
        return null;
      }
      
      // Check if token is still valid
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      
      if (now > expiresAt) {
        console.log(`Token ${tokenId} expired`);
        return null;
      }
      
      return {
        token: data.access_token,
        expiresAt
      };
    } catch (error) {
      console.error(`Failed to get cached token: ${error.message}`);
      return null;
    }
  }
  
  // Clear expired cache entries
  async clearExpiredEntries(): Promise<void> {
    const now = new Date().toISOString();
    
    try {
      // Clear expired handle checks
      const { error: cacheError } = await this.supabaseClient
        .from('handle_cache')
        .delete()
        .lt('expires_at', now);
        
      if (cacheError) {
        console.error(`Error clearing expired cache entries: ${cacheError.message}`);
      }
      
      // We don't delete expired tokens as they might be useful for auditing
    } catch (error) {
      console.error(`Failed to clear expired entries: ${error.message}`);
    }
  }
}

// Function to initialize the cache manager
export function initCacheManager(supabaseClient: ReturnType<typeof createClient>): CacheManager {
  return new CacheManager(supabaseClient);
}
