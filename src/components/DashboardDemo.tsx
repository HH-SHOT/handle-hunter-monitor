
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bell, 
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  MoreVertical,
  Twitter,
  Instagram,
  Facebook
} from 'lucide-react';

const mockHandles = [
  { 
    id: 1, 
    name: 'productlaunch', 
    platform: 'twitter',
    status: 'unavailable', 
    lastChecked: '2 minutes ago',
    notifications: true
  },
  { 
    id: 2, 
    name: 'appmaker', 
    platform: 'instagram',
    status: 'available', 
    lastChecked: '5 minutes ago',
    notifications: true
  },
  { 
    id: 3, 
    name: 'techbrand', 
    platform: 'twitter',
    status: 'monitoring', 
    lastChecked: 'just now',
    notifications: true
  },
  { 
    id: 4, 
    name: 'newproduct', 
    platform: 'facebook',
    status: 'unavailable', 
    lastChecked: '15 minutes ago',
    notifications: false
  },
  { 
    id: 5, 
    name: 'digitalservices', 
    platform: 'twitter',
    status: 'unavailable', 
    lastChecked: '32 minutes ago',
    notifications: true
  }
];

const getPlatformIcon = (platform) => {
  switch (platform) {
    case 'twitter':
      return <Twitter className="h-4 w-4" />;
    case 'instagram':
      return <Instagram className="h-4 w-4" />;
    case 'facebook':
      return <Facebook className="h-4 w-4" />;
    default:
      return <Twitter className="h-4 w-4" />;
  }
};

const getStatusComponent = (status) => {
  switch (status) {
    case 'available':
      return (
        <div className="flex items-center text-green-600">
          <CheckCircle2 className="h-4 w-4 mr-1" />
          <span>Available</span>
        </div>
      );
    case 'unavailable':
      return (
        <div className="flex items-center text-red-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>Unavailable</span>
        </div>
      );
    case 'monitoring':
      return (
        <div className="flex items-center text-amber-600 animate-pulse-slow">
          <Clock className="h-4 w-4 mr-1" />
          <span>Monitoring</span>
        </div>
      );
    default:
      return null;
  }
};

const DashboardDemo = () => {
  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Monitor Your Handles</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get a preview of how the dashboard works. Add handles to monitor and stay updated in real-time.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-4xl mx-auto">
          <div className="border-b border-gray-200 p-4 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-800">Handle Monitor</h3>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" className="text-sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button size="sm" className="bg-brand-blue hover:bg-brand-purple text-white text-sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Handle
              </Button>
            </div>
          </div>
          
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search handles..."
                  className="w-full"
                  prefix={<Search className="h-4 w-4 text-gray-400" />}
                />
              </div>
              <Button variant="outline" size="sm" className="sm:w-auto">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Handle
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Checked
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockHandles.map((handle) => (
                  <tr key={handle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                          {getPlatformIcon(handle.platform)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">@{handle.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {getStatusComponent(handle.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {handle.lastChecked}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Bell className={`h-4 w-4 ${handle.notifications ? 'text-brand-blue' : 'text-gray-400'}`} />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-gray-50 p-4 text-center border-t border-gray-200">
            <p className="text-sm text-gray-600">Showing 5 of 5 handles. <a href="#" className="text-brand-blue hover:underline">View all in dashboard</a></p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardDemo;
