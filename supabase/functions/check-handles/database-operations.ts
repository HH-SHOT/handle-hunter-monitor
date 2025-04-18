
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

export async function updateHandleStatus(
  supabaseClient: ReturnType<typeof createClient>,
  handleId: string,
  newStatus: 'available' | 'unavailable',
  lastChecked: string
): Promise<void> {
  const { error: updateError } = await supabaseClient
    .from('handles')
    .update({ 
      status: newStatus, 
      last_checked: lastChecked 
    })
    .eq('id', handleId);
    
  if (updateError) {
    throw updateError;
  }
  
  const { error: historyError } = await supabaseClient
    .from('handle_history')
    .insert({
      handle_id: handleId,
      status: newStatus,
    });
    
  if (historyError) {
    console.error(`Error creating history for handle ${handleId}:`, historyError);
  }
}

export async function getHandlesToCheck(
  supabaseClient: ReturnType<typeof createClient>
): Promise<any[]> {
  const { data: handles, error: fetchError } = await supabaseClient
    .from('handles')
    .select('*');
    
  if (fetchError) {
    throw fetchError;
  }
  
  return handles || [];
}

export async function getSingleHandle(
  supabaseClient: ReturnType<typeof createClient>,
  handleId: string
): Promise<any> {
  const { data: handle, error: fetchError } = await supabaseClient
    .from('handles')
    .select('*')
    .eq('id', handleId)
    .single();
    
  if (fetchError) {
    throw fetchError;
  }
  
  return handle;
}

