/**
 * CDN Cache Purge Utility
 * Automatically purges vendor pages from CDN cache when data is modified.
 * Supports multiple strategies based on environment settings (e.g. ArvanCloud, Cloudflare).
 */

function getEnv(key: string): string {
  if (typeof process !== 'undefined' && process.env[key]) {
    return process.env[key]!;
  }
  try {
    return (import.meta.env[key] as string) || '';
  } catch (e) {
    return '';
  }
}

function getSiteUrl(): string {
  const siteUrl = getEnv('PUBLIC_SITE_URL');
  if (siteUrl) {
    return siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
  }
  return '';
}

/**
 * Purges a list of URLs from ArvanCloud CDN cache.
 */
async function purgeArvan(urls: string[]): Promise<void> {
  const apiKey = getEnv('ARVAN_API_KEY');
  if (!apiKey) {
    console.warn(`[ArvanPurge] Skipping purge: ARVAN_API_KEY is not set.`);
    return;
  }

  let cleanKey = apiKey.trim().replace(/^['"]|['"]$/g, '').trim();
  if (cleanKey.toLowerCase().startsWith('apikey ')) {
    cleanKey = cleanKey.substring(7).trim();
  }

  const authHeader = `Apikey ${cleanKey}`;

  // Group URLs by domain
  const urlsByDomain: Record<string, string[]> = {};

  for (const url of urls) {
    try {
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname;

      if (!urlsByDomain[domain]) {
        urlsByDomain[domain] = [];
      }
      urlsByDomain[domain].push(url);
    } catch (e) {
      console.warn(`[ArvanPurge] Invalid URL format: ${url}. Skipping.`);
    }
  }

  console.log(`[ArvanPurge] Grouped URLs for purge:`, urlsByDomain);

  for (const [domain, domainUrls] of Object.entries(urlsByDomain)) {
    try {
      console.log(`[ArvanPurge] Purging ${domainUrls.length} URLs for domain ${domain}...`);
      const apiEndpoint = `https://napi.arvancloud.ir/cdn/4.0/domains/${domain}/caching/purge`;
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purge: 'individual',
          purge_urls: domainUrls,
        }),
        redirect: 'manual',
      });

      const body = await res.text();
      if (res.ok) {
        console.log(`[ArvanPurge] Successfully purged ${domainUrls.join(', ')} on domain ${domain}. Response: ${res.status} ${body}`);
      } else {
        console.error(`[ArvanPurge] Failed to purge ${domainUrls.join(', ')} on domain ${domain}: ${res.status} ${body}`);
      }
    } catch (err) {
      console.error(`[ArvanPurge] Network error during purge for domain ${domain}:`, err);
    }
  }
}

/**
 * Purges a list of URLs from Cloudflare CDN cache.
 */
async function purgeCloudflare(urls: string[]): Promise<void> {
  const zoneId = getEnv('CLOUDFLARE_ZONE_ID');
  const token = getEnv('CLOUDFLARE_API_TOKEN');

  console.log(`[CFPurge] Attempting to purge URLs:`, urls);
  console.log(`[CFPurge] Config - Zone ID: ${zoneId}, API Token configured: ${!!token}`);

  if (!zoneId || !token) {
    console.warn(`[CFPurge] Skipping purge: CLOUDFLARE_ZONE_ID or CLOUDFLARE_API_TOKEN is not set.`);
    return;
  }

  try {
    const apiEndpoint = `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`;
    const res = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: urls,
      }),
    });

    const body = await res.text();
    if (res.ok) {
      console.log(`[CFPurge] Successfully purged ${urls.join(', ')}. Response: ${res.status} ${body}`);
    } else {
      console.error(`[CFPurge] Failed to purge ${urls.join(', ')}: ${res.status} ${body}`);
    }
  } catch (err) {
    console.error('[CFPurge] Network error during purge:', err);
  }
}

/**
 * Unified purge entry point dispatching to configured CDN strategy.
 */
async function purgeUrls(urls: string[]): Promise<void> {
  const strategy = getEnv('CDN_STRATEGY') || 'none';
  console.log(`[CDNPurge] Purge requested for strategy: ${strategy}, URLs:`, urls);

  if (strategy === 'arvan') {
    await purgeArvan(urls);
  } else if (strategy === 'cloudflare') {
    await purgeCloudflare(urls);
  } else {
    console.log(`[CDNPurge] No active/supported CDN strategy matches '${strategy}'. Skipping purge.`);
  }
}

/**
 * Retrieves the base URLs configuration for cache purging from the environment.
 * Expects a comma-separated list of URLs in PURGE_BASE_URLS.
 */
function getPurgeBaseUrls(): string[] {
  const baseUrlsEnv = getEnv('PURGE_BASE_URLS');
  if (!baseUrlsEnv) {
    return [];
  }
  return baseUrlsEnv
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => (url.endsWith('/') ? url.slice(0, -1) : url));
}

/**
 * Purges the customer-facing catalog page for a given vendor slug.
 */
export async function purgeVendorCache(vendorSlug: string): Promise<void> {
  const baseUrls = getPurgeBaseUrls();
  if (baseUrls.length === 0) {
    console.warn(`[CDNPurge] Skipping vendor page purge: PURGE_BASE_URLS is not set.`);
    return;
  }
  const urlsToPurge = baseUrls.map((base) => `${base}/${vendorSlug}`);
  await purgeUrls(urlsToPurge);
}

/**
 * Purges the homepage (/) from CDN cache.
 */
export async function purgeHomepageCache(): Promise<void> {
  const baseUrls = getPurgeBaseUrls();
  if (baseUrls.length === 0) {
    console.warn(`[CDNPurge] Skipping homepage purge: PURGE_BASE_URLS is not set.`);
    return;
  }
  const urlsToPurge = baseUrls.map((base) => `${base}/`);
  await purgeUrls(urlsToPurge);
}

// On server startup (when this file is first loaded in production), trigger homepage purge
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
  console.log('[CDNPurge] Server starting up, purging homepage cache...');
  purgeHomepageCache().catch((err) => {
    console.error('[CDNPurge] Failed to purge homepage cache on startup:', err);
  });
}
