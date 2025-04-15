import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const platformStrategies = {
  async twitter(handle: string): Promise<'available' | 'unavailable'> {
    try {
      const response = await fetch(`https://twitter.com/${handle}`, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      return response.status === 404 ? 'available' : 'unavailable';
    } catch {
      return 'unavailable';
    }
  },
  
  async instagram(handle: string): Promise<'available' | 'unavailable'> {
    try {
      const response = await fetch(`https://www.instagram.com/${handle}`, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      return response.status === 404 ? 'available' : 'unavailable';
    } catch {
      return 'unavailable';
    }
  },

  async facebook(handle: string): Promise<'available' | 'unavailable'> {
    try {
      const response = await fetch(`https://www.facebook.com/${handle}`, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      return response.status === 404 ? 'available' : 'unavailable';
    } catch {
      return 'unavailable';
    }
  },

  async tiktok(handle: string): Promise<'available' | 'unavailable'> {
    try {
      const response = await fetch(`https://www.tiktok.com/@${handle}`, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      return response.status === 404 ? 'available' : 'unavailable';
    } catch {
      return 'unavailable';
    }
  }
};

// Utility function to check handle availability
async function checkHandleAvailability(handle: string, platform: string): Promise<'available' | 'unavailable'> {
  const platformStrategy = platformStrategies[platform];
  
  if (!platformStrategy) {
    console.log(`Unsupported platform: ${platform}`);
    return 'unavailable';
  }

  try {
    console.log(`Checking ${platform} handle: ${handle}`);
    const status = await platformStrategy(handle);
    console.log(`Response status for ${handle} on ${platform}: ${status}`);
    return status;
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
            
            // If handle became available, add to notification list
            if (newStatus === 'available' && handle.notifications_enabled) {
              availableHandles.push({
                name: handle.name,
                platform: handle.platform,
                userId: handle.user_id
              });
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
