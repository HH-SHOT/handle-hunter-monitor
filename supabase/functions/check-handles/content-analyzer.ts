
// Function to analyze HTML content for handle availability
export function analyzeContent(html: string, url: string, notFoundText: string[]): boolean {
  const lowerHtml = html.toLowerCase();
  
  // Platform-specific checks
  if (url.includes('instagram.com')) {
    return analyzeInstagramContent(html, url);
  }
  
  if (url.includes('twitter.com')) {
    return analyzeTwitterContent(html, url);
  }
  
  // Check for generic not found text patterns
  for (const text of notFoundText) {
    if (html.includes(text)) {
      console.log(`Found indicator text: "${text}" on ${url} - handle is available`);
      return true;
    }
  }
  
  // Generic 404-like content checks
  if (
    lowerHtml.includes("404") && 
    (lowerHtml.includes("not found") || lowerHtml.includes("doesn't exist") || lowerHtml.includes("page not found"))
  ) {
    console.log(`Found 404-like content on ${url} - handle is available`);
    return true;
  }
  
  // Check for empty profiles or error pages
  if (
    (lowerHtml.includes("error") && lowerHtml.includes("page")) ||
    (lowerHtml.includes("not available") && lowerHtml.includes("account"))
  ) {
    console.log(`Found error or unavailable account indicators on ${url} - handle is available`);
    return true;
  }
  
  // Default behavior: The absence of 'not found' indicators suggests the handle is taken
  console.log(`No 'available' indicators found for ${url} - assuming handle is taken`);
  return false;
}

function analyzeInstagramContent(html: string, url: string): boolean {
  const instagramNotAvailableText = "Sorry, this page isn't available.";
  const instagramPrivateAccountText = "This Account is Private";
  
  // If we find a private account indicator, the handle is definitely taken
  if (html.includes(instagramPrivateAccountText)) {
    console.log(`Found Instagram private account text: "${instagramPrivateAccountText}" on ${url} - handle is taken`);
    return false;
  }
  
  // If we find the standard Instagram "not available" text, handle is available
  if (html.includes(instagramNotAvailableText)) {
    console.log(`Found Instagram not available text: "${instagramNotAvailableText}" on ${url} - handle is available`);
    return true;
  }
  
  // Check for additional Instagram-specific error messages
  if (html.includes("The link you followed may be broken, or the page may have been removed")) {
    console.log(`Found Instagram error page text on ${url} - handle is available`);
    return true;
  }
  
  // For Instagram, if we see a profile content, it's a strong indicator the handle is taken
  const hasProfileContent = 
    html.includes("profile picture") || 
    html.includes("followers") || 
    html.includes("following") || 
    html.includes("posts");
    
  if (hasProfileContent) {
    console.log(`Found Instagram profile content indicators on ${url} - handle is taken`);
    return false;
  }
  
  // For Instagram, we need to be more explicit about what indicates a handle is available
  // If we don't detect specific availability signals, we'll default to taken to avoid false positives
  console.log(`No definitive Instagram availability signals for ${url} - assuming handle is taken`);
  return false;
}

function analyzeTwitterContent(html: string, url: string): boolean {
  const twitterNotFoundText = [
    "This account doesn't exist",
    "This profile doesn't exist",
    "User not found",
    "Hmm...this page doesn't exist"
  ];
  
  const twitterPrivateAccountText = "This Account is Private";
  
  // If we find a private account indicator, the handle is definitely taken
  if (html.includes(twitterPrivateAccountText)) {
    console.log(`Found Twitter private account text: "${twitterPrivateAccountText}" on ${url} - handle is taken`);
    return false;
  }
  
  // Check for explicit "not found" texts that indicate availability
  for (const text of twitterNotFoundText) {
    if (html.includes(text)) {
      console.log(`Found Twitter availability indicator: "${text}" on ${url} - handle is available`);
      return true;
    }
  }
  
  // For Twitter, look for profile elements that indicate the handle is taken
  const hasProfileContent = 
    html.includes("profile-header") || 
    html.includes("profile-card") || 
    html.includes("profile-timeline") ||
    html.includes("timeline-tweet");
    
  if (hasProfileContent) {
    console.log(`Found Twitter profile content indicators on ${url} - handle is taken`);
    return false;
  }
  
  // If we've found no definitive signals of an account, check for error indications
  if (html.toLowerCase().includes("error") && html.toLowerCase().includes("page")) {
    console.log(`Found Twitter error page indicators on ${url} - handle might be available`);
    return true;
  }
  
  // For Twitter, if we don't have clear signals, default to assuming it's taken to reduce false positives
  console.log(`No definitive Twitter availability signals for ${url} - assuming handle is taken`);
  return false;
}
