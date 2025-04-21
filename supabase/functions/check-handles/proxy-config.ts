
// Bright Data proxy configuration
export const PROXY_HOST = "brd.superproxy.io";
export const PROXY_PORT = "33335";
export const PROXY_USERNAME = "brd-customer-hl_3fded35d-zone-datacenter_proxy1";
export const PROXY_PASSWORD = "sg46x8lwwwynp";

// Modern User-Agent strings
export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

// Get a random User-Agent
export function getRandomUserAgent(): string {
  const randomIndex = Math.floor(Math.random() * USER_AGENTS.length);
  return USER_AGENTS[randomIndex];
}

// Generate a random session ID for proxy rotation
export function generateSessionId(): string {
  return `-session-${Math.floor(Math.random() * 1000000)}`;
}

// Create the proxy URL with session
export function createProxyUrl(sessionId?: string): string {
  const username = sessionId ? `${PROXY_USERNAME}${sessionId}` : PROXY_USERNAME;
  return `http://${username}:${PROXY_PASSWORD}@${PROXY_HOST}:${PROXY_PORT}`;
}
