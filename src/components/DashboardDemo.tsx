
import React from 'react';
import HandleDashboard from './handles/HandleDashboard';
import { Card, CardContent } from '@/components/ui/card';

const DashboardDemo = () => {
  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardContent className="p-0 sm:p-0">
          <HandleDashboard />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardDemo;
