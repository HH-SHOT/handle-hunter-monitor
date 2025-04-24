
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
      const response = await fetch('https://mausvzbzorurkcoruhev.supabase.co/.well-known/health', {
        method: 'GET',
      });
      
      if (response.ok) {
        setNetworkStatus({
          successful: true,
          message: 'API server is reachable'
        });
        return true;
      } else {
        setNetworkStatus({
          successful: false,
          message: `API server returned status code ${response.status}`
        });
        return false;
      }
    } catch (error) {
      console.error('Error checking Edge Function status:', error);
      setNetworkStatus({
        successful: false,
        message: 'API server is unreachable'
      });
      return false;
    }
  };

  const testApi = async (platform: 'twitter' | 'twitch', handle: string) => {
    const { user } = await supabase.auth.getSession();
    if (!user.data.session?.user) {
      return { error: 'Authentication required' };
    }
    
    clearTestError();
    
    try {
      const isServerUp = await checkEdgeFunctionStatus();
      if (!isServerUp) {
        throw new Error('Cannot reach the API server. Please try again later.');
      }
      
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        throw new Error('No access token available');
      }
      
      console.log(`Testing ${platform} API for handle:`, handle);
      
      const response = await fetch(`https://mausvzbzorurkcoruhev.supabase.co/functions/v1/test-api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ platform, handle })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log(`${platform} API test result:`, result);
      
      if (!result.success) {
        toast({
          title: `${platform} API Check`,
          description: result.error || "Failed to check handle availability",
          variant: "destructive"
        });
      } else {
        toast({
          title: `${platform} API Check`,
          description: result.message || "Successfully checked handle availability",
        });
      }
      
      return result;
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
