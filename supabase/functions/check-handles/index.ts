import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlatformConfig {
  url: string;
  notFoundText: string[];
}

const PLATFORMS: Record<string, PlatformConfig> = {
  twitter: {
    url: "https://twitter.com/",
    notFoundText: ["This account doesn't exist", "This profile doesn't exist"],
  },
  instagram: {
    url: "https://www.instagram.com/",
    notFoundText: ["Sorry, this page isn't available.", "The link you followed may be broken"],
  },
  facebook: {
    url: "https://www.facebook.com/",
    notFoundText: ["This content isn't available right now", "The link may be broken"],
  },
  tiktok: {
    url: "https://www.tiktok.com/@",
    notFoundText: ["Couldn't find this account", "This account is not available"],
  },
};

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

async function checkHandleWithHeadRequest(url: string): Promise<boolean | null> {
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

async function checkHandleWithContentAnalysis(url: string, notFoundText: string[]): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': DEFAULT_USER_AGENT
      }
    });
    
    const html = await response.text();
    
    // Check if any of the not found text patterns are present
    const isAvailable = notFoundText.some(text => html.includes(text));
    
    console.log(`Content analysis for ${url}: Handle ${isAvailable ? 'available' : 'unavailable'}`);
    return isAvailable;
    
  } catch (error) {
    console.error(`Error during content analysis for ${url}:`, error);
    return false; // Default to unavailable on error
  }
}

async function checkHandleAvailability(handle: string, platform: string): Promise<'available' | 'unavailable'> {
  const platformConfig = PLATFORMS[platform];
  
  if (!platformConfig) {
    console.log(`Unsupported platform: ${platform}`);
    return 'unavailable';
  }

  const url = `${platformConfig.url}${platform === 'tiktok' ? '@' : ''}${handle}`;
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { refresh, handleId, scheduled } = await req.json();
    
    // Handle scheduled checks (runs every 5 minutes)
    if (scheduled) {
      console.log("Running scheduled handle checks (every 5 minutes)");
      
      // Get all handles to check
      const { data: handles, error: fetchError } = await supabaseClient
        .from('handles')
        .select('*');
        
      if (fetchError) {
        throw fetchError;
      }
      
      if (!handles || handles.length === 0) {
        return new Response(
          JSON.stringify({ success: true, message: "No handles to check" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.log(`Found ${handles.length} handles to check`);
      
      const results = [];
      const availableHandles = [];
      
      for (const handle of handles) {
        try {
          // Check if the handle is in 'monitoring' status or needs to be refreshed
          if (handle.status === 'monitoring' || refresh) {
            const newStatus = await checkHandleAvailability(handle.name, handle.platform);
            const lastChecked = new Date().toISOString();
            
            // Update handle status
            const { error: updateError } = await supabaseClient
              .from('handles')
              .update({ 
                status: newStatus, 
                last_checked: lastChecked 
              })
              .eq('id', handle.id);
              
            if (updateError) {
              console.error(`Error updating handle ${handle.name}:`, updateError);
              continue;
            }
            
            // Create history record
            const { error: historyError } = await supabaseClient
              .from('handle_history')
              .insert({
                handle_id: handle.id,
                status: newStatus,
              });
              
            if (historyError) {
              console.error(`Error creating history for ${handle.name}:`, historyError);
            }
            
            // If handle became available, add to notification list
            if (newStatus === 'available' && handle.notifications_enabled) {
              availableHandles.push({
                name: handle.name,
                platform: handle.platform,
                userId: handle.user_id
              });
            }
            
            results.push({
              id: handle.id,
              name: handle.name,
              platform: handle.platform,
              status: newStatus,
              changed: handle.status !== newStatus
            });
            
            console.log(`Updated handle ${handle.name} to ${newStatus}`);
          } else {
            // Skip handles that are not in monitoring state and not explicitly refreshed
            console.log(`Skipping handle ${handle.name} with status ${handle.status}`);
            results.push({
              id: handle.id,
              name: handle.name,
              platform: handle.platform,
              status: handle.status,
              changed: false
            });
          }
        } catch (error) {
          console.error(`Error processing handle ${handle.name}:`, error);
        }
      }
      
      // Here you would implement notification sending for any newly available handles
      if (availableHandles.length > 0) {
        console.log("Handles now available:", availableHandles);
        // TODO: Implement notification system (email, push, etc.)
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Scheduled check completed successfully",
          results: results,
          availableHandles: availableHandles
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // If checking a single handle
    if (handleId) {
      console.log(`Checking single handle with ID: ${handleId}`);
      
      const { data: handle, error: fetchError } = await supabaseClient
        .from('handles')
        .select('*')
        .eq('id', handleId)
        .single();
        
      if (fetchError) {
        throw fetchError;
      }
      
      if (!handle) {
        return new Response(
          JSON.stringify({ error: "Handle not found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
        );
      }
      
      const newStatus = await checkHandleAvailability(handle.name, handle.platform);
      const lastChecked = new Date().toISOString();
      
      // Update handle status
      const { error: updateError } = await supabaseClient
        .from('handles')
        .update({ 
          status: newStatus, 
          last_checked: lastChecked 
        })
        .eq('id', handle.id);
        
      if (updateError) {
        throw updateError;
      }
      
      // Only create history record if status changed
      if (handle.status !== newStatus) {
        const { error: historyError } = await supabaseClient
          .from('handle_history')
          .insert({
            handle_id: handle.id,
            status: newStatus,
          });
          
        if (historyError) {
          console.error(`Error creating history for ${handle.name}:`, historyError);
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          handle: {
            id: handle.id,
            name: handle.name,
            platform: handle.platform,
            status: newStatus,
            lastChecked: lastChecked
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // If refreshing all handles manually
    if (refresh) {
      console.log("Manually refreshing all handle availability statuses...");
      
      // Get all handles to check
      const { data: handles, error: fetchError } = await supabaseClient
        .from('handles')
        .select('*');
        
      if (fetchError) {
        throw fetchError;
      }
      
      if (!handles || handles.length === 0) {
        return new Response(
          JSON.stringify({ success: true, message: "No handles to check" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.log(`Found ${handles.length} handles to check`);
      
      const results = [];
      
      for (const handle of handles) {
        try {
          const newStatus = await checkHandleAvailability(handle.name, handle.platform);
          const lastChecked = new Date().toISOString();
          
          // Update handle status
          const { error: updateError } = await supabaseClient
            .from('handles')
            .update({ 
              status: newStatus, 
              last_checked: lastChecked 
            })
            .eq('id', handle.id);
            
          if (updateError) {
            console.error(`Error updating handle ${handle.name}:`, updateError);
            continue;
          }
          
          // Only create history record if status changed
          if (handle.status !== newStatus) {
            const { error: historyError } = await supabaseClient
              .from('handle_history')
              .insert({
                handle_id: handle.id,
                status: newStatus,
              });
              
            if (historyError) {
              console.error(`Error creating history for ${handle.name}:`, historyError);
            }
          }
          
          results.push({
            id: handle.id,
            name: handle.name,
            platform: handle.platform,
            status: newStatus,
            changed: handle.status !== newStatus
          });
          
          console.log(`Updated handle ${handle.name} to ${newStatus}`);
        } catch (error) {
          console.error(`Error processing handle ${handle.name}:`, error);
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Handles refreshed successfully",
          results: results
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Invalid request" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
    
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
