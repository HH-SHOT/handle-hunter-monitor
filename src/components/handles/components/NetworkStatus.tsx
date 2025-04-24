
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Server, Globe } from 'lucide-react';

interface NetworkStatusProps {
  successful: boolean;
  message: string;
  onCheck: () => void;
}

export const NetworkStatus = ({ successful, message, onCheck }: NetworkStatusProps) => (
  <Alert variant={successful ? "default" : "destructive"} className="mb-6">
    {successful ? <Server className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
    <AlertTitle>{successful ? "System Status" : "Connection Issue"}</AlertTitle>
    <AlertDescription>
      {message}
      {!successful && (
        <div className="mt-2">
          <Button size="sm" variant="outline" onClick={onCheck}>
            Check Again
          </Button>
        </div>
      )}
    </AlertDescription>
  </Alert>
);
