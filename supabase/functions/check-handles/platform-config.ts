import { PlatformConfig } from './types';

export const PLATFORMS: Record<string, PlatformConfig> = {
  twitter: {
    url: "https://twitter.com/",
    notFoundText: [
      "Sorry, that page doesn't exist!",
      "This account doesn't exist",
      "This profile doesn't exist",
      "User not found",
      "Page not found",
      "Hmm...this page doesn't exist",
      "Account doesn't exist",
      "Something went wrong",
      "doesn't exist. Try searching for another."
    ],
    availableIndicators: [
      "Sorry, that page doesn't exist!",
      "This account doesn't exist",
      "This profile doesn't exist",
      "User not found",
      "Page not found"
    ],
    takenIndicators: [
      "joined Twitter",
      "Joined",
      "post_profile",
      "profile-picture",
      "Follow",
      "Followers",
      "Following"
    ],
    isOptimal: false,
    checkMethod: 'scraping',
    methodNotes: "Using web scraping due to Twitter API changes. May be less reliable but avoids API rate limits.",
    headers: {
      "User-Agent": "Mozilla/5.0"
    },
    useProxy: true
  },
  twitch: {
    url: "https://www.twitch.tv/",
    apiEndpoint: "https://api.twitch.tv/helix/users",
    notFoundText: [
      "This channel is currently unavailable.",
      "Sorry. Unless you've got a time machine, that content is unavailable.",
      "User not found",
      "Page not found",
      "Channel not found",
      "This page is no longer available"
    ],
    availableIndicators: [
      "This channel is currently unavailable.",
      "Sorry. Unless you've got a time machine, that content is unavailable.",
      "User not found",
      "Page not found",
      "Channel not found"
    ],
    takenIndicators: [
      "streaming",
      "followers",
      "channel",
      "Subscribe",
      "videos",
      "clips",
      "data"
    ],
    useApi: true,
    isOptimal: true,
    checkMethod: 'api',
    methodNotes: "Uses official Twitch Helix API which is fast, reliable, and accurate for username checks."
  }
};

export interface PlatformConfig {
  url: string;
  notFoundText: string[];
  availableIndicators: string[];
  takenIndicators: string[];
  requiresAtSymbol?: boolean;
  apiEndpoint?: string;
  useApi?: boolean;
  useProxy?: boolean;
  isOptimal?: boolean;
  checkMethod: 'api' | 'scraping';
  methodNotes: string;
  headers?: Record<string, string>;
}
