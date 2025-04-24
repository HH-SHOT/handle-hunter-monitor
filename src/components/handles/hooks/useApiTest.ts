
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ApiTestResult {
  error?: string;
  success?: boolean;
  message?: string;
  api_response?: any;
}

interface NetworkStatus {
  successful: boolean;
  message: string;
}

export const useApiTest = () => {
  const [twitterHandle, setTwitterHandle] = useState('lovabledev');
  const [twitchHandle, setTwitchHandle] = useState('ninja');
  const [twitterResult, setTwitterResult] = useState<ApiTestResult | null>(null);
  const [twitchResult, setTwitchResult] = useState<ApiTestResult | null>(null);
  const [isTestingTwitter, setIsTestingTwitter] = useState(false);
  const [isTestingTwitch, setIsTestingTwitch] = useState(false);
  const [showResponseData, setShowResponseData] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    successful: true,
    message: 'API server is reachable'
  });

  const clearTestError = () => setTestError(null);

  const checkEdgeFunctionStatus = async () => {
    try {
      // Try a direct fetch to the edge function with ping parameter
      // This should work without authentication now that we've set verify_jwt = false
      const response = await fetch('https://mausvzbzorurkcoruhev.supabase.co/functions/v1/test-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabase.supabaseKey // Include the anon key for good measure
        },
        body: JSON.stringify({ ping: true })
      });
      
      if (!response.ok) {
        console.error('Error checking Edge Function status:', response.status, response.statusText);
        setNetworkStatus({
          successful: false,
          message: `Could not reach API: ${response.status} ${response.statusText}`
        });
        return false;
      }
      
      // If we get here, the server is responsive
      setNetworkStatus({
        successful: true,
        message: 'API server is reachable'
      });
      return true;
    } catch (error) {
      console.error('Error checking Edge Function status:', error);
      setNetworkStatus({
        successful: false,
        message: 'API server is unreachable. Please check your connection or try again later.'
      });
      return false;
    }
  };

  const testApi = async (platform: 'twitter' | 'twitch', handle: string) => {
    const { data: sessionData } = await supabase.auth.getSession();
    
    clearTestError();
    
    try {
      const isServerUp = await checkEdgeFunctionStatus();
      if (!isServerUp) {
        throw new Error('Cannot reach the API server. Please try again later.');
      }
      
      console.log(`Testing ${platform} API for handle:`, handle);
      
      // Use direct fetch instead of supabase client for testing
      const response = await fetch('https://mausvzbzorurkcoruhev.supabase.co/functions/v1/test-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabase.supabaseKey
        },
        body: JSON.stringify({ platform, handle })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`${platform} API test result:`, data);
      
      if (!data.success) {
        toast({
          title: `${platform} API Check`,
          description: data.error || "Failed to check handle availability",
          variant: "destructive"
        });
      } else {
        toast({
          title: `${platform} API Check`,
          description: data.message || "Successfully checked handle availability",
        });
      }
      
      return data;
    } catch (error) {
      console.error(`Error testing ${platform} API:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setTestError(`Failed to test ${platform} API: ${errorMessage}`);
      toast({
        title: "API Test Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: errorMessage };
    }
  };

  const testTwitterApi = async () => {
    setIsTestingTwitter(true);
    setTwitterResult(null);
    const result = await testApi('twitter', twitterHandle);
    setTwitterResult(result);
    setIsTestingTwitter(false);
  };

  const testTwitchApi = async () => {
    setIsTestingTwitch(true);
    setTwitchResult(null);
    const result = await testApi('twitch', twitchHandle);
    setTwitchResult(result);
    setIsTestingTwitch(false);
  };

  return {
    twitterHandle,
    setTwitterHandle,
    twitchHandle,
    setTwitchHandle,
    twitterResult,
    twitchResult,
    isTestingTwitter,
    isTestingTwitch,
    showResponseData,
    setShowResponseData,
    testError,
    networkStatus,
    checkEdgeFunctionStatus,
    testTwitterApi,
    testTwitchApi
  };
};
