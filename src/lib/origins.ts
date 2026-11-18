// The same rules the server applies to an app's website URLs (backend/src/lib/origins.ts),
// so mistakes are caught before saving.

export const MAX_ORIGINS = 10;

const LOCAL_HOSTS = ["localhost", "127.0.0.1"];

// Returns the cleaned origin ("https://myapp.com"), or an error message.
export function checkOrigin(input: string): { origin: string } | { error: string } {
  const text = input.trim();
  if (!text) return { error: "Enter your site's address, for example https://myapp.com" };

  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return { error: "That is not a valid address. Include https://, for example https://myapp.com" };
  }

  const isHttps = url.protocol === "https:";
  const isLocal = url.protocol === "http:" && LOCAL_HOSTS.includes(url.hostname);
  if (!isHttps && !isLocal) return { error: "Use https:// (http:// is only allowed for localhost)." };

  const hasExtras = url.pathname !== "/" || url.search || url.hash || url.username || url.password || /[?#]/.test(text);
  if (hasExtras) return { error: "Enter only the site address, with no path. For example https://myapp.com" };

  return { origin: url.origin };
}
