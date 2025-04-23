import { PlatformConfig } from './types';

// Load platform config from the shared JSON file
// Since we can't directly import JSON in edge functions, we're copying the content
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
  instagram: {
    url: "https://www.instagram.com/",
    notFoundText: [
      "Sorry, this page isn't available.",
      "The link you followed may be broken",
      "Page not found",
      "User not found",
      "The page may have been removed",
      "This username isn't available."
    ],
    availableIndicators: [
      "Sorry, this page isn't available.",
      "The link you followed may be broken",
      "Page not found",
      "The page may have been removed"
    ],
    takenIndicators: [
      "profile picture",
      "followers",
      "posts",
      "following",
      "log in to see their photos and videos",
      "This Account is Private"
    ],
    isOptimal: false,
    checkMethod: 'scraping',
    methodNotes: "No public API for username checks. Uses URL probing which is common practice but prone to rate-limits and blocking."
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
  },
  tiktok: {
    url: "https://www.tiktok.com/@",
    notFoundText: [
      "Couldn't find this account",
      "This account is not available",
      "User not found",
      "Page not found",
      "This username doesn't exist"
    ],
    availableIndicators: [
      "Couldn't find this account",
      "This account is not available",
      "User not found",
      "This username doesn't exist"
    ],
    takenIndicators: [
      "followers",
      "following",
      "likes",
      "videos",
      "bio",
      "profile"
    ],
    requiresAtSymbol: true,
    isOptimal: false,
    checkMethod: 'scraping',
    methodNotes: "No official API for username checks. Uses URL probing which is reliable short-term but lacks stability at scale."
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
  isOptimal?: boolean;
  checkMethod: 'api' | 'scraping';
  methodNotes: string;
}
