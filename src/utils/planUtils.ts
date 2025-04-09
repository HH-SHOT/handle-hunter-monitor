
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const upgradeToPlan = async (userId: string, planName: 'Standard' | 'Pro') => {
  if (!userId) {
    toast({
      title: "Authentication required",
      description: "Please sign in to upgrade your plan",
      variant: "destructive"
    });
    return false;
  }
  
  try {
    toast({
      title: "Processing upgrade...",
      description: "Please wait while we upgrade your plan.",
    });
    
    const { data, error } = await supabase.functions.invoke('upgrade-plan', {
      body: { 
        user_id: userId,
        plan_name: planName
      }
    });
    
    if (error) throw error;
    
    toast({
      title: "Plan upgraded!",
      description: `Your account has been successfully upgraded to the ${planName} plan.`,
    });
    
    return true;
  } catch (error: any) {
    console.error('Error upgrading plan:', error);
    
    toast({
      title: "Upgrade failed",
      description: error.message || "There was a problem upgrading your plan. Please try again.",
      variant: "destructive"
    });
    
    return false;
  }
};
