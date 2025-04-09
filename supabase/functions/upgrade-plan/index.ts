
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { user_id, plan_name } = await req.json();
    
    if (!user_id || !plan_name) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameters. Need both user_id and plan_name." 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }
    
    console.log(`Upgrading plan for user ${user_id} to ${plan_name}`);
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Lookup plan ID
    const { data: planData, error: planError } = await supabaseClient
      .from('plans')
      .select('id')
      .eq('name', plan_name)
      .single();
      
    if (planError) {
      throw new Error(`Plan lookup error: ${planError.message}`);
    }
    
    if (!planData) {
      return new Response(
        JSON.stringify({ error: `Plan '${plan_name}' not found` }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 404 
        }
      );
    }
    
    // Check for existing subscription
    const { data: existingSubscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'active')
      .maybeSingle();
      
    if (subError) {
      throw new Error(`Subscription check error: ${subError.message}`);
    }
    
    // Set expiry date to 1 month from now
    const expires_at = new Date();
    expires_at.setMonth(expires_at.getMonth() + 1);
    
    let result;
    
    if (existingSubscription) {
      // Update existing subscription
      console.log(`Updating existing subscription for user ${user_id}`);
      
      const { data, error } = await supabaseClient
        .from('subscriptions')
        .update({ 
          plan_id: planData.id,
          expires_at: expires_at.toISOString() 
        })
        .eq('id', existingSubscription.id)
        .select();
        
      if (error) throw new Error(`Subscription update error: ${error.message}`);
      result = data;
    } else {
      // Create new subscription
      console.log(`Creating new subscription for user ${user_id}`);
      
      const { data, error } = await supabaseClient
        .from('subscriptions')
        .insert({
          user_id: user_id,
          plan_id: planData.id,
          status: 'active',
          expires_at: expires_at.toISOString()
        })
        .select();
        
      if (error) throw new Error(`Subscription creation error: ${error.message}`);
      result = data;
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully upgraded to ${plan_name} plan`,
        data: result
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
