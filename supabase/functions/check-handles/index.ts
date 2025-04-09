
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
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { refresh } = await req.json();
    
    if (refresh) {
      console.log("Refreshing handle availability status...");
      
      // Get all handles to check
      const { data: handles, error: fetchError } = await supabaseClient
        .from('handles')
        .select('*');
        
      if (fetchError) {
        throw fetchError;
      }
      
      console.log(`Found ${handles.length} handles to check`);
      
      // This would be where actual API calls to check availability would happen
      // For now, we'll simulate randomized results
      for (const handle of handles) {
        // Simulate checking - in a real scenario, you would call APIs for each platform
        const newStatus = Math.random() > 0.7 ? 'available' : 'unavailable';
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
        
        console.log(`Updated handle ${handle.name} to ${newStatus}`);
      }
      
      return new Response(
        JSON.stringify({ success: true, message: "Handles refreshed successfully" }),
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
