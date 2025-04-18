
export interface PlatformConfig {
  url: string;
  notFoundText: string[];
}

export const PLATFORMS: Record<string, PlatformConfig> = {
  twitter: {
    url: "https://twitter.com/",
    notFoundText: [
      "This account doesn't exist",
      "This profile doesn't exist",
      "This account doesn't exist,Try searching for another."
    ],
  },
  instagram: {
    url: "https://www.instagram.com/",
    notFoundText: [
      "Sorry, this page isn't available.",
      "The link you followed may be broken",
      "Page not found"
    ],
  },
  facebook: {
    url: "https://www.facebook.com/",
    notFoundText: [
      "This content isn't available right now",
      "The link may be broken",
      "This page isn't available"
    ],
  },
  tiktok: {
    url: "https://www.tiktok.com/@",
    notFoundText: [
      "Couldn't find this account",
      "This account is not available",
      "User not found"
    ],
  },
};
