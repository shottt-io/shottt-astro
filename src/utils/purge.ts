/**
 * ArvanCloud CDN Cache Purge Utility
 * Automatically purges vendor pages from CDN cache when data is modified.
 * Requires ARVAN_API_KEY and ARVAN_DOMAIN in environment variables.
 */

const ARVAN_API_KEY = import.meta.env.ARVAN_API_KEY;
const ARVAN_DOMAIN = import.meta.env.ARVAN_DOMAIN;
const ARVAN_CDN_BASE = `https://napi.arvancloud.ir/cdn/4.0/domains/${ARVAN_DOMAIN}/caching`;

/**
 * Purges a list of URLs from ArvanCloud CDN cache.
 * Silently fails if env vars are not configured (e.g. local dev).
 */
async function purgeUrls(urls: string[]): Promise<void> {
  if (!ARVAN_API_KEY || !ARVAN_DOMAIN) {
    return; // No-op in local dev
  }

  try {
    const res = await fetch(`${ARVAN_CDN_BASE}/purge`, {
      method: 'POST',
      headers: {
        'Authorization': ARVAN_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        purge_type: 'individual',
        files: urls,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[ArvanPurge] Failed to purge ${urls.join(', ')}: ${res.status} ${body}`);
    }
  } catch (err) {
    console.error('[ArvanPurge] Network error during purge:', err);
  }
}

/**
 * Purges the customer-facing catalog page for a given vendor slug.
 * Homepage (/) is NOT purged here — it only changes on new code deployments.
 */
export async function purgeVendorCache(vendorSlug: string): Promise<void> {
  const base = `https://${ARVAN_DOMAIN}`;
  await purgeUrls([`${base}/${vendorSlug}`]);
}
