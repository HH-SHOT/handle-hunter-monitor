export interface PlatformConfig {
  url: string;
  notFoundText: string[];
  availableIndicators: string[];
  takenIndicators: string[];
  requiresAtSymbol?: boolean;
  apiEndpoint?: string;
  useApi?: boolean;
}

export const PLATFORMS: Record<string, PlatformConfig> = {
  twitter: {
    url: "https://twitter.com/",
    notFoundText: [
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
      "This account doesn't exist",
      "This profile doesn't exist",
      "User not found",
      "Hmm...this page doesn't exist",
      "Account doesn't exist"
    ],
    takenIndicators: [
      "The latest Tweets from",
      "Joined",
      "post_profile",
      "profile-picture",
      "Follow",
      "Followers",
      "Following"
    ],
    apiEndpoint: "https://api.twitter.com/2/users/by/username/"
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
    ]
  },
  twitch: {
    url: "https://www.twitch.tv/",
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
      "clips"
    ],
    useApi: true
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
    requiresAtSymbol: true
  },
};
