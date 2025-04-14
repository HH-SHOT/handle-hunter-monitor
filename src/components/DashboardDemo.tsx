import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
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
  Facebook,
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  XCircle,
  CircleCheck
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { supabase, HandleType } from '@/integrations/supabase/client';

interface Handle {
  id: string;
  name: string;
  platform: 'twitter' | 'instagram' | 'facebook' | 'tiktok';
  status: 'available' | 'unavailable' | 'monitoring';
  lastChecked: string;
  notifications: boolean;
}

const mockHandles: Handle[] = [
  { 
    id: '1', 
    name: 'productlaunch', 
    platform: 'twitter',
    status: 'unavailable', 
    lastChecked: '2 minutes ago',
    notifications: true
  },
  { 
    id: '2', 
    name: 'appmaker', 
    platform: 'instagram',
    status: 'available', 
    lastChecked: '5 minutes ago',
    notifications: true
  },
  { 
    id: '3', 
    name: 'techbrand', 
    platform: 'twitter',
    status: 'monitoring', 
    lastChecked: 'just now',
    notifications: true
  },
  { 
    id: '4', 
    name: 'newproduct', 
    platform: 'facebook',
    status: 'unavailable', 
    lastChecked: '15 minutes ago',
    notifications: false
  },
  { 
    id: '5', 
    name: 'digitalservices', 
    platform: 'twitter',
    status: 'unavailable', 
    lastChecked: '32 minutes ago',
    notifications: true
  }
];

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'twitter':
      return <Twitter className="h-4 w-4" />;
    case 'instagram':
      return <Instagram className="h-4 w-4" />;
    case 'facebook':
      return <Facebook className="h-4 w-4" />;
    case 'tiktok':
      return <TrendingUp className="h-4 w-4" />;
    default:
      return <Twitter className="h-4 w-4" />;
  }
};

const getStatusComponent = (status: string) => {
  switch (status) {
    case 'available':
      return (
        <div className="flex items-center text-green-600">
          <CircleCheck className="h-4 w-4 mr-1" />
          <span className="bg-green-100 px-2 py-0.5 rounded-full text-xs">Available</span>
        </div>
      );
    case 'unavailable':
      return (
        <div className="flex items-center text-red-600">
          <XCircle className="h-4 w-4 mr-1" />
          <span className="bg-red-100 px-2 py-0.5 rounded-full text-xs">Taken</span>
        </div>
      );
    case 'monitoring':
      return (
        <div className="flex items-center text-amber-600 animate-pulse-slow">
          <Clock className="h-4 w-4 mr-1" />
          <span className="bg-yellow-100 px-2 py-0.5 rounded-full text-xs">Monitoring</span>
        </div>
      );
    default:
      return null;
  }
};

const DashboardDemo = () => {
  // ... rest of the code remains unchanged
};

export default DashboardDemo;
