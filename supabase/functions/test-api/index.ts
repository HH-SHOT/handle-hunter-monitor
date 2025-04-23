
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function initSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing required environment variables");
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

async function testTwitterAPI(handle: string) {
  console.log(`Testing Twitter API for handle: ${handle}`);
  const twitterBearerToken = Deno.env.get("TWITTER_BEARER_TOKEN");
  
  if (!twitterBearerToken) {
    return { 
      success: false, 
      error: "Twitter API token not configured" 
    };
  }
  
  try {
    // First try a direct user lookup by username
    const userLookupResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${handle}`, {
        headers: {
          'Authorization': `Bearer ${twitterBearerToken}`,
        },
      }
    );
    
    console.log("Twitter API response status:", userLookupResponse.status);
    
    const userLookupData = await userLookupResponse.json();
    console.log("Twitter API response data:", JSON.stringify(userLookupData));
    
    // Check if user exists
    if (userLookupResponse.status === 200 && userLookupData.data) {
      return {
        success: true,
        available: false,
        message: `The handle @${handle} is taken on Twitter`,
        user: userLookupData.data,
        api_response: userLookupData
      };
    } 
    
    // If API returns a 404, the username is likely available
    if (userLookupResponse.status === 404) {
      return {
        success: true,
        available: true,
        message: `The handle @${handle} appears to be available on Twitter`,
        api_response: userLookupData
      };
    }
    
    // Handle other potential status codes
    return {
      success: false,
      error: `Twitter API returned status code ${userLookupResponse.status}`,
      api_response: userLookupData
    };
  } catch (error) {
    console.error("Error testing Twitter API:", error);
    return {
      success: false,
      error: `Error testing Twitter API: ${error.message}`,
    };
  }
}

async function testTwitchAPI(handle: string) {
  console.log(`Testing Twitch API for handle: ${handle}`);
  const clientId = Deno.env.get("TWITCH_CLIENT_ID");
  const clientSecret = Deno.env.get("TWITCH_CLIENT_SECRET");
  
  if (!clientId || !clientSecret) {
    return { 
      success: false, 
      error: "Twitch API credentials not configured" 
    };
  }
  
  try {
    // First get OAuth token
    const tokenResponse = await fetch(
      "https://id.twitch.tv/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      }
    );
    
    if (!tokenResponse.ok) {
      console.error("Failed to get Twitch access token:", tokenResponse.status);
      return {
        success: false,
        error: `Failed to get Twitch access token: ${tokenResponse.status}`,
      };
    }
    
    const { access_token } = await tokenResponse.json();
    
    // Now check if the user exists
    const userResponse = await fetch(
      `https://api.twitch.tv/helix/users?login=${handle}`, {
        headers: {
          "Client-ID": clientId,
          "Authorization": `Bearer ${access_token}`,
        },
      }
    );
    
    console.log("Twitch API response status:", userResponse.status);
    
    if (!userResponse.ok) {
      return {
        success: false,
        error: `Twitch API returned status code ${userResponse.status}`,
      };
    }
    
    const userData = await userResponse.json();
    console.log("Twitch API response data:", JSON.stringify(userData));
    
    // Check if user exists based on data array length
    if (userData.data && userData.data.length > 0) {
      return {
        success: true,
        available: false,
        message: `The handle ${handle} is taken on Twitch`,
        user: userData.data[0],
        api_response: userData
      };
    } else {
      return {
        success: true,
        available: true,
        message: `The handle ${handle} appears to be available on Twitch`,
        api_response: userData
      };
    }
  } catch (error) {
    console.error("Error testing Twitch API:", error);
    return {
      success: false,
      error: `Error testing Twitch API: ${error.message}`,
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const supabaseClient = initSupabaseClient();
    
    const data = await req.json();
    const { platform, handle } = data;
    
    if (!platform || !handle) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }
    
    let result;
    
    if (platform === 'twitter') {
      result = await testTwitterAPI(handle);
    } else if (platform === 'twitch') {
      result = await testTwitchAPI(handle);
    } else {
      return new Response(
        JSON.stringify({ error: "Unsupported platform" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
