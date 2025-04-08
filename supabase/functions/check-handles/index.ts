
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle OPTIONS request for CORS
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the user from the request
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get request body
    const { refresh, handleId } = await req.json()

    // Query handles to check
    const handlesQuery = supabaseClient
      .from('handles')
      .select('*')

    // If handleId is provided, only check that specific handle
    if (handleId) {
      handlesQuery.eq('id', handleId).eq('user_id', user.id)
    } else {
      handlesQuery.eq('user_id', user.id)
    }

    const { data: handles, error } = await handlesQuery

    if (error) {
      throw error
    }

    console.log(`Checking ${handles.length} handles`)

    // Check each handle
    const results = await Promise.all(
      handles.map(async (handle) => {
        const availability = await checkHandleAvailability(handle.name, handle.platform)
        
        // Update the handle status in the database
        const { error: updateError } = await supabaseClient
          .from('handles')
          .update({
            status: availability.available ? 'available' : 'unavailable',
            last_checked: new Date().toISOString()
          })
          .eq('id', handle.id)

        if (updateError) {
          console.error(`Error updating handle ${handle.name}:`, updateError)
        }

        // Add to history if status has changed
        if (availability.available !== (handle.status === 'available')) {
          await supabaseClient
            .from('handle_history')
            .insert({
              handle_id: handle.id,
              status: availability.available ? 'available' : 'unavailable'
            })
        }

        return {
          id: handle.id,
          name: handle.name,
          platform: handle.platform,
          available: availability.available,
          message: availability.message
        }
      })
    )

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in check-handles function:', error)

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

/**
 * Check if a handle is available on a social media platform
 * This is a simplified implementation that would need to be expanded 
 * with actual API calls to each platform.
 */
async function checkHandleAvailability(handle: string, platform: string) {
  console.log(`Checking ${platform} handle: ${handle}`)
  
  try {
    // In a real implementation, this would make API calls to each platform
    // For this demo, we're using a mock implementation
    const responseTime = Math.random() * 1000 + 500 // Simulate API response time
    await new Promise(resolve => setTimeout(resolve, responseTime))
    
    // Randomly determine if handle is available (for demo purposes)
    // In a real implementation, this would be based on API responses
    const random = Math.random()
    const available = random > 0.8 // 20% chance of being available
    
    return {
      available,
      message: available 
        ? `@${handle} is available on ${platform}!` 
        : `@${handle} is not available on ${platform}`
    }
  } catch (error) {
    console.error(`Error checking ${platform} handle ${handle}:`, error)
    return { 
      available: false, 
      message: `Error checking ${platform} handle: ${error.message}` 
    }
  }
}
