
// Function to analyze HTML content for handle availability
export function analyzeContent(html: string, url: string, notFoundText: string[]): boolean {
  const lowerHtml = html.toLowerCase();
  
  // Log the first part of the HTML for debugging
  console.log(`Analyzing content for ${url}`);
  console.log(`HTML sample (first 200 chars): ${html.substring(0, 200).replace(/\n/g, ' ')}`);
  
  // Platform-specific checks
  if (url.includes('instagram.com')) {
    return analyzeInstagramContent(html, url);
  }
  
  if (url.includes('twitter.com') || url.includes('x.com')) {
    return analyzeTwitterContent(html, url);
  }
  
  // Print the patterns we're looking for
  console.log(`Looking for these patterns in ${url}:`, notFoundText);
  
  // Check for generic not found text patterns
  for (const text of notFoundText) {
    if (html.includes(text)) {
      console.log(`✅ Found indicator text: "${text}" on ${url} - handle is available`);
      return true;
    }
  }
  
  // Generic 404-like content checks
  if (
    lowerHtml.includes("404") && 
    (lowerHtml.includes("not found") || lowerHtml.includes("doesn't exist") || lowerHtml.includes("page not found"))
  ) {
    console.log(`✅ Found 404-like content on ${url} - handle is available`);
    return true;
  }
  
  // Check for empty profiles or error pages
  if (
    (lowerHtml.includes("error") && lowerHtml.includes("page")) ||
    (lowerHtml.includes("not available") && lowerHtml.includes("account"))
  ) {
    console.log(`✅ Found error or unavailable account indicators on ${url} - handle is available`);
    return true;
  }
  
  // Check for profile indicators
  const profileIndicators = [
    "profile", "bio", "followers", "following", "timeline", "posts", "tweets"
  ];
  
  for (const indicator of profileIndicators) {
    if (lowerHtml.includes(indicator)) {
      console.log(`❌ Found profile indicator '${indicator}' on ${url} - handle is taken`);
      return false;
    }
  }
  
  // Default behavior: We're unsure, so we'll be conservative
  console.log(`⚠️ No clear indicators found for ${url} - defaulting to unavailable`);
  return false;
}

function analyzeInstagramContent(html: string, url: string): boolean {
  const lowerHtml = html.toLowerCase();
  console.log(`Analyzing Instagram content for ${url}`);
  
  // Clear indicators that the handle is available
  const availableIndicators = [
    "Sorry, this page isn't available.",
    "The link you followed may be broken",
    "Page not found",
    "The page may have been removed"
  ];
  
  for (const indicator of availableIndicators) {
    if (html.includes(indicator)) {
      console.log(`✅ Found Instagram availability indicator: "${indicator}" on ${url}`);
      return true;
    }
  }
  
  // Clear indicators that the handle is taken
  if (html.includes("This Account is Private")) {
    console.log(`❌ Found Instagram private account indicator on ${url} - handle is taken`);
    return false;
  }
  
  // Check for profile content that indicates the handle exists
  const profileIndicators = [
    "profile picture",
    "followers",
    "following",
    "posts",
    "instagram photos and videos",
    "log in to view"
  ];
  
  for (const indicator of profileIndicators) {
    if (lowerHtml.includes(indicator)) {
      console.log(`❌ Found Instagram profile indicator '${indicator}' on ${url} - handle is taken`);
      return false;
    }
  }
  
  // Check for login requirement (indicates profile exists but requires login)
  if (lowerHtml.includes("log in") || lowerHtml.includes("login") || lowerHtml.includes("sign in")) {
    console.log(`❌ Found Instagram login requirement on ${url} - handle is likely taken`);
    return false;
  }
  
  // Check meta title - if it contains the username, likely exists
  if (html.includes("<title>") && html.includes("(@") && html.includes("Instagram")) {
    console.log(`❌ Found Instagram title with username on ${url} - handle is taken`);
    return false;
  }
  
  // For Instagram, we need to be more explicit about what indicates a handle is available
  console.log(`⚠️ No definitive Instagram availability signals for ${url} - assuming handle is taken`);
  return false;
}

function analyzeTwitterContent(html: string, url: string): boolean {
  const lowerHtml = html.toLowerCase();
  console.log(`Analyzing Twitter content for ${url}`);
  
  // Clear indicators for Twitter that the handle is available
  const availableIndicators = [
    "This account doesn't exist",
    "This profile doesn't exist",
    "User not found",
    "Hmm...this page doesn't exist",
    "Account doesn't exist"
  ];
  
  for (const indicator of availableIndicators) {
    if (html.includes(indicator)) {
      console.log(`✅ Found Twitter availability indicator: "${indicator}" on ${url}`);
      return true;
    }
  }
  
  // Clear indicators that the handle is taken
  if (html.includes("This Account is Private") || html.includes("These Tweets are protected")) {
    console.log(`❌ Found Twitter protected account indicator on ${url} - handle is taken`);
    return false;
  }
  
  // Check for profile content that indicates the handle exists
  const profileIndicators = [
    "profile-header",
    "profile-card",
    "profile-timeline",
    "timeline-tweet",
    "follower_count",
    "following_count",
    "Tweets & replies",
    "Joined",
    "X. It's what's happening"
  ];
  
  for (const indicator of profileIndicators) {
    if (html.includes(indicator)) {
      console.log(`❌ Found Twitter profile indicator '${indicator}' on ${url} - handle is taken`);
      return false;
    }
  }
  
  // Check Twitter-specific meta tags
  if (html.includes('name="robots" content="noindex,nofollow"')) {
    console.log(`✅ Found Twitter robots noindex tag on ${url} - handle might be available`);
    return true;
  }
  
  // Check title - if it contains "X" or "Twitter" and doesn't have error, might exist
  if (html.includes("<title>") && 
     (html.includes(" on X") || html.includes(" on Twitter") || html.includes("(@"))) {
    console.log(`❌ Found Twitter title with username on ${url} - handle is taken`);
    return false;
  }
  
  // If we've found no definitive signals of an account, check for error indications
  if (lowerHtml.includes("error") && lowerHtml.includes("page")) {
    console.log(`✅ Found Twitter error page indicators on ${url} - handle might be available`);
    return true;
  }
  
  // For Twitter, default to taken if uncertain
  console.log(`⚠️ No definitive Twitter availability signals for ${url} - assuming handle is taken`);
  return false;
}
