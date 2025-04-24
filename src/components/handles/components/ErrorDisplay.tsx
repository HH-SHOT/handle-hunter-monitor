
import { Alert, AlertCircle, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorDisplayProps {
  error: string;
}

export const ErrorDisplay = ({ error }: ErrorDisplayProps) => (
  <Alert variant="destructive" className="mb-6">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>
      {error}
      <div className="mt-2 text-xs">
        <p>Possible causes:</p>
        <ul className="list-disc pl-5 mt-1">
          <li>Network connection issues</li>
          <li>Edge function not deployed or has errors</li>
          <li>API credentials not configured in Supabase</li>
          <li>Authentication token issues</li>
        </ul>
      </div>
    </AlertDescription>
  </Alert>
);
