
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const ApiTest: React.FC = () => {
  const { user } = useAuth();
  const [twitterHandle, setTwitterHandle] = useState('lovabledev');
  const [twitchHandle, setTwitchHandle] = useState('ninja');
  const [twitterResult, setTwitterResult] = useState<any>(null);
  const [twitchResult, setTwitchResult] = useState<any>(null);
  const [isTestingTwitter, setIsTestingTwitter] = useState(false);
  const [isTestingTwitch, setIsTestingTwitch] = useState(false);
  const [showResponseData, setShowResponseData] = useState(false);

  const testTwitterApi = async () => {
    if (!user) {
      setTwitterResult({ error: 'Authentication required' });
      return;
    }
    
    setIsTestingTwitter(true);
    setTwitterResult(null);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        throw new Error('No access token available');
      }
      
      console.log('Testing Twitter API for handle:', twitterHandle);
      
      const response = await fetch(`https://mausvzbzorurkcoruhev.supabase.co/functions/v1/test-api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ 
          platform: 'twitter',
          handle: twitterHandle
        })
      });
      
      const result = await response.json();
      console.log('Twitter API test result:', result);
      setTwitterResult(result);
    } catch (error) {
      console.error('Error testing Twitter API:', error);
      setTwitterResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsTestingTwitter(false);
    }
  };
  
  const testTwitchApi = async () => {
    if (!user) {
      setTwitchResult({ error: 'Authentication required' });
      return;
    }
    
    setIsTestingTwitch(true);
    setTwitchResult(null);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        throw new Error('No access token available');
      }
      
      console.log('Testing Twitch API for handle:', twitchHandle);
      
      const response = await fetch(`https://mausvzbzorurkcoruhev.supabase.co/functions/v1/test-api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ 
          platform: 'twitch',
          handle: twitchHandle
        })
      });
      
      const result = await response.json();
      console.log('Twitch API test result:', result);
      setTwitchResult(result);
    } catch (error) {
      console.error('Error testing Twitch API:', error);
      setTwitchResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsTestingTwitch(false);
    }
  };

  return (
    <div className="container max-w-4xl py-6">
      <h2 className="text-2xl font-bold mb-6">API Test Tool</h2>
      <Tabs defaultValue="twitter">
        <TabsList className="mb-4">
          <TabsTrigger value="twitter">Twitter API</TabsTrigger>
          <TabsTrigger value="twitch">Twitch API</TabsTrigger>
        </TabsList>
        
        <TabsContent value="twitter">
          <Card>
            <CardHeader>
              <CardTitle>Test Twitter API</CardTitle>
              <CardDescription>
                Check if the Twitter API is working correctly by entering a handle to check
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="twitter-handle">Handle to check</Label>
                  <div className="flex gap-2">
                    <Input
                      id="twitter-handle"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                      placeholder="Enter Twitter handle"
                      disabled={isTestingTwitter}
                    />
                    <Button onClick={testTwitterApi} disabled={isTestingTwitter}>
                      {isTestingTwitter ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                      Test API
                    </Button>
                  </div>
                </div>
                
                {twitterResult && (
                  <div className="mt-4">
                    <Separator className="my-4" />
                    <h3 className="text-lg font-medium mb-3">Test Result:</h3>
                    
                    {twitterResult.error ? (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{twitterResult.error}</AlertDescription>
                      </Alert>
                    ) : (
                      <div>
                        <Alert variant={twitterResult.success ? "default" : "destructive"}>
                          {twitterResult.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          <AlertTitle>{twitterResult.success ? "Success" : "Failed"}</AlertTitle>
                          <AlertDescription>
                            {twitterResult.message || "API request completed"}
                          </AlertDescription>
                        </Alert>
                        
                        <div className="mt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowResponseData(!showResponseData)}
                          >
                            {showResponseData ? "Hide" : "Show"} Response Data
                          </Button>
                          
                          {showResponseData && (
                            <pre className="mt-2 p-4 bg-muted rounded-md text-xs overflow-auto">
                              {JSON.stringify(twitterResult, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="twitch">
          <Card>
            <CardHeader>
              <CardTitle>Test Twitch API</CardTitle>
              <CardDescription>
                Check if the Twitch API is working correctly by entering a handle to check
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="twitch-handle">Handle to check</Label>
                  <div className="flex gap-2">
                    <Input
                      id="twitch-handle"
                      value={twitchHandle}
                      onChange={(e) => setTwitchHandle(e.target.value)}
                      placeholder="Enter Twitch handle"
                      disabled={isTestingTwitch}
                    />
                    <Button onClick={testTwitchApi} disabled={isTestingTwitch}>
                      {isTestingTwitch ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                      Test API
                    </Button>
                  </div>
                </div>
                
                {twitchResult && (
                  <div className="mt-4">
                    <Separator className="my-4" />
                    <h3 className="text-lg font-medium mb-3">Test Result:</h3>
                    
                    {twitchResult.error ? (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{twitchResult.error}</AlertDescription>
                      </Alert>
                    ) : (
                      <div>
                        <Alert variant={twitchResult.success ? "default" : "destructive"}>
                          {twitchResult.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          <AlertTitle>{twitchResult.success ? "Success" : "Failed"}</AlertTitle>
                          <AlertDescription>
                            {twitchResult.message || "API request completed"}
                          </AlertDescription>
                        </Alert>
                        
                        <div className="mt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowResponseData(!showResponseData)}
                          >
                            {showResponseData ? "Hide" : "Show"} Response Data
                          </Button>
                          
                          {showResponseData && (
                            <pre className="mt-2 p-4 bg-muted rounded-md text-xs overflow-auto">
                              {JSON.stringify(twitchResult, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiTest;
