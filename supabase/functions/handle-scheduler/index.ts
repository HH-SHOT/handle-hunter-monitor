
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

function setupScheduledJob() {
  if (jobInitialized) return;
  
  cron('*/5 * * * *', async () => {
    console.log('Running scheduled handle check');
    lastRunTime = new Date();
    
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
    } catch (error) {
      console.error('Error in scheduled job:', error);
    }
  });
  
  jobInitialized = true;
  console.log('Scheduled job initialized to run every 5 minutes');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  setupScheduledJob();
  
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Handle scheduler is running',
      status: 'active',
      interval: 'every 5 minutes',
      lastRun: lastRunTime ? lastRunTime.toISOString() : null
    }),
    { 
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json'
      } 
    }
  );
});
