
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';
import { TestResult } from './TestResult';
import { ApiTestResult } from '../hooks/useApiTest';

interface PlatformTestProps {
  platform: 'twitter' | 'twitch';
  handle: string;
  onHandleChange: (value: string) => void;
  onTest: () => void;
  isTesting: boolean;
  result: ApiTestResult | null;
  showResponseData: boolean;
  onToggleResponse: () => void;
  isNetworkAvailable: boolean;
}

export const PlatformTest = ({
  platform,
  handle,
  onHandleChange,
  onTest,
  isTesting,
  result,
  showResponseData,
  onToggleResponse,
  isNetworkAvailable
}: PlatformTestProps) => (
  <div className="grid gap-4">
    <div className="grid gap-2">
      <Label htmlFor={`${platform}-handle`}>Handle to check</Label>
      <div className="flex gap-2">
        <Input
          id={`${platform}-handle`}
          value={handle}
          onChange={(e) => onHandleChange(e.target.value)}
          placeholder={`Enter ${platform} handle`}
          disabled={isTesting}
        />
        <Button onClick={onTest} disabled={isTesting || !isNetworkAvailable}>
          {isTesting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
          Test API
        </Button>
      </div>
    </div>
    
    {result && (
      <TestResult
        result={result}
        showResponseData={showResponseData}
        onToggleResponse={onToggleResponse}
      />
    )}
  </div>
);
