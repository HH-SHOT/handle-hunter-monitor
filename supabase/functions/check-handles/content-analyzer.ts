
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
  
  console.log(`None of the indicator patterns found in content for ${url} - handle is taken`);
  return false;
}

function analyzeInstagramContent(html: string, url: string): boolean {
  const instagramNotAvailableText = "Sorry, this page isn't available.";
  const instagramPrivateAccountText = "This Account is Private";
  
  if (html.includes(instagramPrivateAccountText)) {
    console.log(`Found Instagram private account text: "${instagramPrivateAccountText}" on ${url} - handle is taken`);
    return false;
  }
  
  if (html.includes(instagramNotAvailableText)) {
    console.log(`Found Instagram not available text: "${instagramNotAvailableText}" on ${url} - handle is available`);
    return true;
  }
  
  if (html.includes("The link you followed may be broken, or the page may have been removed")) {
    console.log(`Found Instagram error page text on ${url} - handle is available`);
    return true;
  }
  
  return false;
}

function analyzeTwitterContent(html: string, url: string): boolean {
  const twitterPrivateAccountText = "This Account is Private";
  
  if (html.includes(twitterPrivateAccountText)) {
    console.log(`Found Twitter private account text: "${twitterPrivateAccountText}" on ${url} - handle is taken`);
    return false;
  }
  
  return false; // Let the generic checks handle other cases
}
