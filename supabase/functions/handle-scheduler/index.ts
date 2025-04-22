
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { cron } from "https://deno.land/x/deno_cron@v1.0.0/cron.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize the scheduled task to run every 5 minutes
let jobInitialized = false;
let lastRunTime: Date | null = null;
let lastRunStatus: { success: boolean, message: string } | null = null;
let runCount = 0;

function setupScheduledJob() {
  if (jobInitialized) return;
  
  cron('*/5 * * * *', async () => {
    console.log('Running scheduled handle check');
    lastRunTime = new Date();
    runCount++;
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/check-handles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ scheduled: true })
      });
      
      const result = await response.json();
      console.log('Scheduled job result:', result);
      
      lastRunStatus = {
        success: response.ok,
        message: response.ok ? `Successfully processed ${result.results?.length || 0} handles` : `Error: ${result.error || 'Unknown error'}`
      };
    } catch (error) {
      console.error('Error in scheduled job:', error);
      lastRunStatus = {
        success: false,
        message: `Error: ${error.message || 'Unknown error'}`
      };
    }
  });
  
  // Also create a job to clean up expired cache entries daily
  cron('0 0 * * *', async () => {
    console.log('Running daily cache cleanup');
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/check-handles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ cleanupCache: true })
      });
      
      const result = await response.json();
      console.log('Cache cleanup result:', result);
    } catch (error) {
      console.error('Error in cache cleanup job:', error);
    }
  });
  
  jobInitialized = true;
  console.log('Scheduled jobs initialized');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  setupScheduledJob();
  
  // Provide status information about the scheduler
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Handle scheduler is running',
      status: 'active',
      interval: 'every 5 minutes',
      lastRun: lastRunTime ? lastRunTime.toISOString() : null,
      lastRunStatus,
      runCount,
      dailyCleanup: {
        status: 'scheduled',
        schedule: '0 0 * * *' // Midnight every day
      }
    }),
    { 
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json'
      } 
    }
  );
});
