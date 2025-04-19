
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
      "This account doesn't exist,Try searching for another.",
      "User not found",
      "Page not found",
      "Hmm...this page doesn't exist",
      "Something went wrong"
    ],
  },
  instagram: {
    url: "https://www.instagram.com/",
    notFoundText: [
      "Sorry, this page isn't available.",
      "The link you followed may be broken",
      "Page not found",
      "User not found",
      "The page may have been removed"
    ],
  },
  facebook: {
    url: "https://www.facebook.com/",
    notFoundText: [
      "This content isn't available right now",
      "The link may be broken",
      "This page isn't available",
      "Page not found",
      "Page not available",
      "This page isn't available"
    ],
  },
  tiktok: {
    url: "https://www.tiktok.com/@",
    notFoundText: [
      "Couldn't find this account",
      "This account is not available",
      "User not found",
      "404",
      "Page not found",
      "Couldn't find this account"
    ],
  },
};
