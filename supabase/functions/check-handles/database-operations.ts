
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

export async function updateHandleStatus(
  supabaseClient: ReturnType<typeof createClient>,
  handleId: string,
  newStatus: 'available' | 'unavailable',
  lastChecked: string
): Promise<void> {
  console.log(`Updating handle ${handleId} status to ${newStatus}`);
  
  try {
    const { error: updateError } = await supabaseClient
      .from('handles')
      .update({ 
        status: newStatus, 
        last_checked: lastChecked 
      })
      .eq('id', handleId);
      
    if (updateError) {
      console.error(`Error updating handle ${handleId}:`, updateError);
      throw updateError;
    }
    
    console.log(`Successfully updated handle ${handleId} status`);
    
    // Create a history record
    const { error: historyError } = await supabaseClient
      .from('handle_history')
      .insert({
        handle_id: handleId,
        status: newStatus,
      });
      
    if (historyError) {
      console.error(`Error creating history for handle ${handleId}:`, historyError);
    } else {
      console.log(`Successfully created history record for handle ${handleId}`);
    }
  } catch (error) {
    console.error(`Error in updateHandleStatus for handle ${handleId}:`, error);
    throw error;
  }
}

export async function getHandlesToCheck(
  supabaseClient: ReturnType<typeof createClient>
): Promise<any[]> {
  console.log("Fetching handles to check");
  
  try {
    const { data: handles, error: fetchError } = await supabaseClient
      .from('handles')
      .select('*');
      
    if (fetchError) {
      console.error("Error fetching handles:", fetchError);
      throw fetchError;
    }
    
    console.log(`Successfully fetched ${handles?.length || 0} handles`);
    return handles || [];
  } catch (error) {
    console.error("Error in getHandlesToCheck:", error);
    throw error;
  }
}

export async function getSingleHandle(
  supabaseClient: ReturnType<typeof createClient>,
  handleId: string
): Promise<any> {
  console.log(`Fetching handle with ID: ${handleId}`);
  
  try {
    const { data: handle, error: fetchError } = await supabaseClient
      .from('handles')
      .select('*')
      .eq('id', handleId)
      .maybeSingle();
      
    if (fetchError) {
      console.error(`Error fetching handle ${handleId}:`, fetchError);
      throw fetchError;
    }
    
    if (!handle) {
      console.log(`Handle with ID ${handleId} not found`);
      return null;
    }
    
    console.log(`Successfully fetched handle: ${handle.name} (${handle.platform})`);
    return handle;
  } catch (error) {
    console.error(`Error in getSingleHandle for ID ${handleId}:`, error);
    throw error;
  }
}

// Function to get handles with specific status
export async function getHandlesByStatus(
  supabaseClient: ReturnType<typeof createClient>,
  status: 'available' | 'unavailable' | 'monitoring'
): Promise<any[]> {
  console.log(`Fetching handles with status: ${status}`);
  
  try {
    const { data: handles, error: fetchError } = await supabaseClient
      .from('handles')
      .select('*')
      .eq('status', status);
      
    if (fetchError) {
      console.error(`Error fetching handles with status ${status}:`, fetchError);
      throw fetchError;
    }
    
    console.log(`Successfully fetched ${handles?.length || 0} handles with status ${status}`);
    return handles || [];
  } catch (error) {
    console.error(`Error in getHandlesByStatus for status ${status}:`, error);
    throw error;
  }
}

// Function to get handle history
export async function getHandleHistory(
  supabaseClient: ReturnType<typeof createClient>,
  handleId: string
): Promise<any[]> {
  console.log(`Fetching history for handle with ID: ${handleId}`);
  
  try {
    const { data: history, error: fetchError } = await supabaseClient
      .from('handle_history')
      .select('*')
      .eq('handle_id', handleId)
      .order('created_at', { ascending: false });
      
    if (fetchError) {
      console.error(`Error fetching history for handle ${handleId}:`, fetchError);
      throw fetchError;
    }
    
    console.log(`Successfully fetched ${history?.length || 0} history records for handle ${handleId}`);
    return history || [];
  } catch (error) {
    console.error(`Error in getHandleHistory for handle ${handleId}:`, error);
    throw error;
  }
}
