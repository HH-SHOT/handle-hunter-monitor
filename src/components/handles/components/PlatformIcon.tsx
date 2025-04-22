
import React from 'react';
import { Twitter, Instagram, TrendingUp, Twitch } from 'lucide-react';

interface PlatformIconProps {
  platform: string;
  className?: string;
}

const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, className = "h-4 w-4" }) => {
  switch (platform) {
    case 'twitter':
      return <Twitter className={className} />;
    case 'instagram':
      return <Instagram className={className} />;
    case 'twitch':
      return <Twitch className={className} />;
    case 'tiktok':
      return <TrendingUp className={className} />;
    default:
      return <Twitter className={className} />;
  }
};

export default PlatformIcon;
