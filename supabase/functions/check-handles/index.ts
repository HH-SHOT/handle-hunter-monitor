
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";
import { PLATFORMS } from './platform-config.ts';
import { checkHandleAvailability } from './availability-checker.ts';
import { updateHandleStatus, getHandlesToCheck, getSingleHandle } from './database-operations.ts';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY'
};

// Initialize the Supabase client
function initSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing required environment variables");
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Handler for checking individual handle
async function handleSingleHandleCheck(supabaseClient: ReturnType<typeof createClient>, handleId: string) {
  console.log(`Checking single handle with ID: ${handleId}`);
  
  const handle = await getSingleHandle(supabaseClient, handleId);
  
  if (!handle) {
    return new Response(
      JSON.stringify({ error: "Handle not found" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
    );
  }
  
  const platformConfig = PLATFORMS[handle.platform];
  if (!platformConfig) {
    return new Response(
      JSON.stringify({ error: "Unsupported platform" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
  
  const newStatus = await checkHandleAvailability(handle.name, handle.platform, platformConfig);
  const lastChecked = new Date().toISOString();
  
  await updateHandleStatus(supabaseClient, handle.id, newStatus, lastChecked);
  
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

// Handler for refreshing all handles
async function handleRefreshAllHandles(supabaseClient: ReturnType<typeof createClient>) {
  console.log("Manually refreshing all handle availability statuses...");
  
  const handles = await getHandlesToCheck(supabaseClient);
  
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
      const platformConfig = PLATFORMS[handle.platform];
      if (!platformConfig) {
        console.log(`Unsupported platform: ${handle.platform}`);
        continue;
      }
      
      const newStatus = await checkHandleAvailability(handle.name, handle.platform, platformConfig);
      const lastChecked = new Date().toISOString();
      
      await updateHandleStatus(supabaseClient, handle.id, newStatus, lastChecked);
      
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

// Handler for scheduled checks
async function handleScheduledChecks(supabaseClient: ReturnType<typeof createClient>) {
  console.log("Running scheduled handle checks");
  
  const handles = await getHandlesToCheck(supabaseClient);
  
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
      if (handle.status === 'monitoring') {
        const platformConfig = PLATFORMS[handle.platform];
        if (!platformConfig) {
          console.log(`Unsupported platform: ${handle.platform}`);
          continue;
        }
        
        const newStatus = await checkHandleAvailability(handle.name, handle.platform, platformConfig);
        const lastChecked = new Date().toISOString();
        
        await updateHandleStatus(supabaseClient, handle.id, newStatus, lastChecked);
        
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

// Main server function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Check Handles function invoked");
    
    // Initialize Supabase client
    const supabaseClient = initSupabaseClient();

    const { refresh, handleId, scheduled } = await req.json();
    console.log(`Request params: refresh=${refresh}, handleId=${handleId}, scheduled=${scheduled}`);
    
    // Route the request to the appropriate handler
    if (scheduled) {
      return await handleScheduledChecks(supabaseClient);
    } else if (handleId) {
      return await handleSingleHandleCheck(supabaseClient, handleId);
    } else if (refresh) {
      return await handleRefreshAllHandles(supabaseClient);
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid request" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
