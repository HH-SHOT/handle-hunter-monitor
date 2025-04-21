
import { PlatformConfig } from './platform-config.ts';

// Function to analyze HTML content for handle availability
export function analyzeContent(html: string, url: string, platformConfig: PlatformConfig): boolean {
  const lowerHtml = html.toLowerCase();
  
  // Log the first part of the HTML for debugging
  console.log(`Analyzing content for ${url}`);
  console.log(`HTML sample (first 300 chars): ${html.substring(0, 300).replace(/\n/g, ' ')}`);
  
  // Check for platform-specific availability indicators
  for (const indicator of platformConfig.availableIndicators) {
    if (html.includes(indicator)) {
      console.log(`✅ Found availability indicator: "${indicator}" on ${url} - handle is available`);
      return true;
    }
  }
  
  // Check for platform-specific "taken" indicators
  for (const indicator of platformConfig.takenIndicators) {
    if (lowerHtml.includes(indicator.toLowerCase())) {
      console.log(`❌ Found "taken" indicator: "${indicator}" on ${url} - handle is taken`);
      return false;
    }
  }
  
  // Check for generic not found text patterns if no specific indicators matched
  for (const text of platformConfig.notFoundText) {
    if (html.includes(text)) {
      console.log(`✅ Found indicator text: "${text}" on ${url} - handle is available`);
      return true;
    }
  }
  
  // Check meta tags for clues
  if (html.includes('name="robots" content="noindex')) {
    console.log(`✅ Found robots noindex tag on ${url} - handle might be available`);
    return true;
  }
  
  // Check title - if it contains username patterns, likely exists
  if (html.includes("<title>") && 
     (html.includes(" (@") || html.includes(" on Twitter") || html.includes(" on X") || 
      html.includes(" • Instagram photos and videos"))) {
    console.log(`❌ Found title with username on ${url} - handle is taken`);
    return false;
  }
  
  // Generic 404-like content checks
  if (
    lowerHtml.includes("404") && 
    (lowerHtml.includes("not found") || lowerHtml.includes("doesn't exist") || lowerHtml.includes("page not found"))
  ) {
    console.log(`✅ Found 404-like content on ${url} - handle likely available`);
    return true;
  }
  
  // Check for empty profiles or error pages
  if (
    (lowerHtml.includes("error") && lowerHtml.includes("page")) ||
    (lowerHtml.includes("not available") && lowerHtml.includes("account"))
  ) {
    console.log(`✅ Found error or unavailable account indicators on ${url} - handle likely available`);
    return true;
  }
  
  // If we're uncertain, examine more content characteristics
  
  // Short HTML response might indicate error/unavailable page
  if (html.length < 1000 && !lowerHtml.includes("script") && !lowerHtml.includes("style")) {
    console.log(`✅ Found very short HTML content (${html.length} chars) on ${url} - handle might be available`);
    return true;
  }
  
  // Social profile common elements check
  const profileElements = ["follow", "followers", "posts", "profile", "bio", "joined"];
  let profileElementCount = 0;
  
  for (const element of profileElements) {
    if (lowerHtml.includes(element)) {
      profileElementCount++;
    }
  }
  
  if (profileElementCount >= 3) {
    console.log(`❌ Found ${profileElementCount} profile elements on ${url} - handle is likely taken`);
    return false;
  }
  
  // Default behavior: Be conservative
  console.log(`⚠️ No definitive indicators found for ${url} - defaulting to unavailable`);
  return false;
}
