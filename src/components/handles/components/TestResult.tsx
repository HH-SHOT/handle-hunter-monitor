
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ApiTestResult } from '../hooks/useApiTest';

interface TestResultProps {
  result: ApiTestResult;
  showResponseData: boolean;
  onToggleResponse: () => void;
}

export const TestResult = ({ result, showResponseData, onToggleResponse }: TestResultProps) => (
  <div className="mt-4">
    <Separator className="my-4" />
    <h3 className="text-lg font-medium mb-3">Test Result:</h3>
    
    {result.error ? (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{result.error}</AlertDescription>
      </Alert>
    ) : (
      <div>
        <Alert variant={result.success ? "default" : "destructive"}>
          {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          <AlertTitle>{result.success ? "Success" : "Failed"}</AlertTitle>
          <AlertDescription>
            {result.message || "API request completed"}
          </AlertDescription>
        </Alert>
        
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onToggleResponse}
          >
            {showResponseData ? "Hide" : "Show"} Response Data
          </Button>
          
          {showResponseData && (
            <pre className="mt-2 p-4 bg-muted rounded-md text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      </div>
    )}
  </div>
);
