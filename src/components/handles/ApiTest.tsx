
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApiTest } from './hooks/useApiTest';
import { NetworkStatus } from './components/NetworkStatus';
import { ErrorDisplay } from './components/ErrorDisplay';
import { PlatformTest } from './components/PlatformTest';

const ApiTest: React.FC = () => {
  const {
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
  } = useApiTest();

  useEffect(() => {
    checkEdgeFunctionStatus();
  }, []);

  return (
    <div className="container max-w-4xl py-6">
      <h2 className="text-2xl font-bold mb-6">API Test Tool</h2>
      
      <NetworkStatus 
        successful={networkStatus.successful}
        message={networkStatus.message}
        onCheck={checkEdgeFunctionStatus}
      />
      
      {testError && <ErrorDisplay error={testError} />}
      
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
              <PlatformTest
                platform="twitter"
                handle={twitterHandle}
                onHandleChange={setTwitterHandle}
                onTest={testTwitterApi}
                isTesting={isTestingTwitter}
                result={twitterResult}
                showResponseData={showResponseData}
                onToggleResponse={() => setShowResponseData(!showResponseData)}
                isNetworkAvailable={networkStatus.successful}
              />
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
              <PlatformTest
                platform="twitch"
                handle={twitchHandle}
                onHandleChange={setTwitchHandle}
                onTest={testTwitchApi}
                isTesting={isTestingTwitch}
                result={twitchResult}
                showResponseData={showResponseData}
                onToggleResponse={() => setShowResponseData(!showResponseData)}
                isNetworkAvailable={networkStatus.successful}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiTest;
