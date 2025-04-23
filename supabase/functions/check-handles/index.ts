
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";
import { PLATFORMS } from './platform-config.ts';
import { checkHandleAvailability, processBatchedHandleChecks } from './availability-checker.ts';
import { 
  updateHandleStatus, 
  getHandlesToCheck, 
  getSingleHandle, 
  flushLogs,
  clearExpiredCache
} from './database-operations.ts';
import { initLogger, LogLevel } from './logger.ts';
import { requestQueue } from './queue-manager.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY'
};

function initSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing required environment variables");
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

let logger = null;

function getLogger(supabaseClient: ReturnType<typeof createClient>) {
  if (!logger) {
    logger = initLogger(supabaseClient);
    logger.setMinLevel(LogLevel.INFO);
  }
  return logger;
}

async function handleSingleHandleCheck(
  supabaseClient: ReturnType<typeof createClient>, 
  handleId: string
) {
  const logger = getLogger(supabaseClient);
  logger.info(`Checking single handle with ID: ${handleId}`);
  
  const handle = await getSingleHandle(supabaseClient, handleId);
  
  if (!handle) {
    logger.warn(`Handle not found: ${handleId}`);
    return new Response(
      JSON.stringify({ error: "Handle not found" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
    );
  }
  
  const platformConfig = PLATFORMS[handle.platform];
  if (!platformConfig) {
    logger.warn(`Unsupported platform: ${handle.platform}`, {
      handleId: handle.id,
      platform: handle.platform
    });
    
    return new Response(
      JSON.stringify({ error: "Unsupported platform" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
  
  if (handle.cached) {
    logger.info(`Using cached result for handle ${handle.id}`, {
      handleId: handle.id,
      handleName: handle.name,
      platform: handle.platform,
      status: handle.status
    });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        handle: {
          id: handle.id,
          name: handle.name,
          platform: handle.platform,
          status: handle.status,
          lastChecked: handle.last_checked,
          cached: true,
          queuePosition: 0
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Set higher priority for individual checks (5 instead of 3)
  const queueTask = requestQueue.enqueue({
    id: handle.id,
    platform: handle.platform,
    name: handle.name,
    priority: 5
  });
  
  // Get initial queue position for immediate feedback
  const queuePosition = requestQueue.getQueuePosition(handle.id);
  
  if (queuePosition > 1) {
    // If in queue, return status immediately with position
    return new Response(
      JSON.stringify({ 
        success: true,
        inProgress: true, 
        handle: {
          id: handle.id,
          name: handle.name,
          platform: handle.platform,
          status: 'monitoring',
          lastChecked: handle.last_checked,
          queuePosition: queuePosition
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Only proceed with immediate check for position 1
  const results = await processBatchedHandleChecks(supabaseClient, [handle], 1);
  const newStatus = results[handle.id];
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
        lastChecked: lastChecked,
        queuePosition: 0
      }
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleRefreshAllHandles(supabaseClient: ReturnType<typeof createClient>) {
  const logger = getLogger(supabaseClient);
  logger.info("Manually refreshing all handle availability statuses...");
  
  const handles = await getHandlesToCheck(supabaseClient);
  
  if (!handles || handles.length === 0) {
    logger.info("No handles to check");
    return new Response(
      JSON.stringify({ success: true, message: "No handles to check" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  logger.info(`Found ${handles.length} handles to check`);
  
  // Increased batch size from 5 to 10
  const results = await processBatchedHandleChecks(supabaseClient, handles, 10);
  
  const processedResults = [];
  for (const handle of handles) {
    if (results[handle.id]) {
      const newStatus = results[handle.id];
      const lastChecked = new Date().toISOString();
      
      await updateHandleStatus(supabaseClient, handle.id, newStatus, lastChecked);
      
      processedResults.push({
        id: handle.id,
        name: handle.name,
        platform: handle.platform,
        status: newStatus,
        changed: handle.status !== newStatus
      });
      
      logger.info(`Updated handle ${handle.name} to ${newStatus}`, {
        handleId: handle.id,
        handleName: handle.name,
        platform: handle.platform,
        oldStatus: handle.status,
        newStatus,
        changed: handle.status !== newStatus
      });
    }
  }
  
  EdgeRuntime.waitUntil(clearExpiredCache(supabaseClient));
  EdgeRuntime.waitUntil(flushLogs(supabaseClient));
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: "Handles refreshed successfully",
      results: processedResults
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleScheduledChecks(supabaseClient: ReturnType<typeof createClient>) {
  const logger = getLogger(supabaseClient);
  logger.info("Running scheduled handle checks");
  
  const handles = await getHandlesToCheck(supabaseClient);
  
  if (!handles || handles.length === 0) {
    logger.info("No handles to check");
    return new Response(
      JSON.stringify({ success: true, message: "No handles to check" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  logger.info(`Found ${handles.length} handles to check for scheduled run`);
  
  const handlesToCheck = handles.filter(handle => handle.status === 'monitoring');
  
  logger.info(`${handlesToCheck.length} handles are in monitoring status and will be checked`);
  
  // Increased batch size from 5 to 10
  const results = await processBatchedHandleChecks(supabaseClient, handlesToCheck, 10);
  
  const processedResults = [];
  const availableHandles = [];
  
  for (const handle of handlesToCheck) {
    if (results[handle.id]) {
      const newStatus = results[handle.id];
      const lastChecked = new Date().toISOString();
      
      await updateHandleStatus(supabaseClient, handle.id, newStatus, lastChecked);
      
      if (newStatus === 'available' && handle.notifications_enabled) {
        availableHandles.push({
          name: handle.name,
          platform: handle.platform,
          userId: handle.user_id
        });
      }
      
      processedResults.push({
        id: handle.id,
        name: handle.name,
        platform: handle.platform,
        status: newStatus,
        changed: handle.status !== newStatus
      });
      
      logger.info(`Updated handle ${handle.name} to ${newStatus}`, {
        handleId: handle.id,
        handleName: handle.name,
        platform: handle.platform,
        oldStatus: handle.status,
        newStatus,
        changed: handle.status !== newStatus
      });
    }
  }
  
  EdgeRuntime.waitUntil(clearExpiredCache(supabaseClient));
  EdgeRuntime.waitUntil(flushLogs(supabaseClient));
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: "Scheduled check completed successfully",
      results: processedResults,
      availableHandles: availableHandles
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = initSupabaseClient();
    const logger = getLogger(supabaseClient);
    
    logger.info("Check Handles function invoked");
    
    const requestData = await req.json();
    const { refresh, handleId, scheduled } = requestData;
    
    logger.info(`Request params:`, { refresh, handleId, scheduled });
    
    let response;
    if (scheduled) {
      response = await handleScheduledChecks(supabaseClient);
    } else if (handleId) {
      response = await handleSingleHandleCheck(supabaseClient, handleId);
    } else if (refresh) {
      response = await handleRefreshAllHandles(supabaseClient);
    } else {
      logger.warn("Invalid request: missing required parameters");
      return new Response(
        JSON.stringify({ error: "Invalid request" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    EdgeRuntime.waitUntil(logger.flush());
    
    return response;
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
