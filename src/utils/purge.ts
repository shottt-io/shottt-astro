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
  let domain = getEnv('ARVAN_DOMAIN');

  // Fallback domain extraction from SITE_URL if ARVAN_DOMAIN is missing
  if (!domain) {
    const siteUrl = getSiteUrl();
    if (siteUrl) {
      try {
        const parsedUrl = new URL(siteUrl);
        domain = parsedUrl.hostname;
      } catch (e) {
        console.warn(`[ArvanPurge] Failed to parse PUBLIC_SITE_URL to extract domain:`, e);
      }
    }
  }

  console.log(`[ArvanPurge] Attempting to purge URLs:`, urls);
  console.log(`[ArvanPurge] Config - Domain: ${domain}, API Key configured: ${!!apiKey}`);

  if (!apiKey || !domain) {
    console.warn(`[ArvanPurge] Skipping purge: ARVAN_API_KEY or ARVAN_DOMAIN is not set.`);
    return;
  }

  let cleanKey = apiKey.trim().replace(/^['"]|['"]$/g, '').trim();
  if (cleanKey.toLowerCase().startsWith('apikey ')) {
    cleanKey = cleanKey.substring(7).trim();
  }

  const authHeader = `Apikey ${cleanKey}`;

  try {
    const apiEndpoint = `https://napi.arvancloud.ir/cdn/4.0/domains/${domain}/caching/purge`;
    const res = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        purge: 'individual',
        purge_urls: urls,
      }),
      redirect: 'manual',
    });

    const body = await res.text();
    if (res.ok) {
      console.log(`[ArvanPurge] Successfully purged ${urls.join(', ')}. Response: ${res.status} ${body}`);
    } else {
      console.error(`[ArvanPurge] Failed to purge ${urls.join(', ')}: ${res.status} ${body}`);
    }
  } catch (err) {
    console.error('[ArvanPurge] Network error during purge:', err);
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
 * Purges the customer-facing catalog page for a given vendor slug.
 */
export async function purgeVendorCache(vendorSlug: string): Promise<void> {
  const siteUrl = getSiteUrl();
  const base = siteUrl || 'https://shottt.io';
  await purgeUrls([`${base}/${vendorSlug}`]);
}

/**
 * Purges the homepage (/) from CDN cache.
 */
export async function purgeHomepageCache(): Promise<void> {
  const siteUrl = getSiteUrl();
  const base = siteUrl || 'https://shottt.io';
  await purgeUrls([`${base}/`]);
}

// On server startup (when this file is first loaded in production), trigger homepage purge
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
  console.log('[CDNPurge] Server starting up, purging homepage cache...');
  purgeHomepageCache().catch((err) => {
    console.error('[CDNPurge] Failed to purge homepage cache on startup:', err);
  });
}
