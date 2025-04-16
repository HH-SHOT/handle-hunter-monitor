
import React from 'react';
import { Twitter, Instagram, Facebook, TrendingUp } from 'lucide-react';

type PlatformType = 'twitter' | 'instagram' | 'facebook' | 'tiktok';

interface PlatformIconProps {
  platform: PlatformType | string;
  className?: string;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, className = "h-4 w-4" }) => {
  switch (platform) {
    case 'twitter':
      return <Twitter className={className} />;
    case 'instagram':
      return <Instagram className={className} />;
    case 'facebook':
      return <Facebook className={className} />;
    case 'tiktok':
      return <TrendingUp className={className} />;
    default:
      return <Twitter className={className} />;
  }
};

export default PlatformIcon;
