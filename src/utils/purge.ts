/**
 * ArvanCloud CDN Cache Purge Utility
 * Automatically purges vendor pages from CDN cache when data is modified.
 * Requires ARVAN_API_KEY and ARVAN_DOMAIN in environment variables.
 */

function getArvanConfig() {
  const apiKey = process.env.ARVAN_API_KEY || import.meta.env.ARVAN_API_KEY;
  const domain = process.env.ARVAN_DOMAIN || import.meta.env.ARVAN_DOMAIN;
  return { apiKey, domain };
}

/**
 * Purges a list of URLs from ArvanCloud CDN cache.
 */
async function purgeUrls(urls: string[]): Promise<void> {
  const { apiKey, domain } = getArvanConfig();

  console.log(`[ArvanPurge] Attempting to purge URLs:`, urls);
  console.log(`[ArvanPurge] Config - Domain: ${domain}, API Key configured: ${!!apiKey}`);

  if (!apiKey || !domain) {
    console.warn(`[ArvanPurge] Skipping purge: ARVAN_API_KEY or ARVAN_DOMAIN is not set in environment.`);
    return;
  }

  // ArvanCloud API key requires the "Apikey " prefix. Prepend it if not present.
  const authHeader = apiKey.trim().startsWith('Apikey ') ? apiKey.trim() : `Apikey ${apiKey.trim()}`;

  try {
    const apiEndpoint = `https://napi.arvancloud.ir/cdn/4.0/domains/${domain}/caching/purge`;
    console.log(`[ArvanPurge] POST request to ${apiEndpoint}`);

    const res = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        purge_type: 'individual',
        files: urls,
      }),
      redirect: 'manual', // Prevent undici redirect loops (redirect count exceeded) if WAF/gateway redirects
    });

    const body = await res.text();
    if (res.ok) {
      console.log(`[ArvanPurge] Successfully purged ${urls.join(', ')}. Response: ${res.status} ${body}`);
    } else {
      if (res.status >= 300 && res.status < 400) {
        console.error(`[ArvanPurge] Failed to purge ${urls.join(', ')}: Redirected with status ${res.status}. Location: ${res.headers.get('location')}`);
      } else {
        console.error(`[ArvanPurge] Failed to purge ${urls.join(', ')}: ${res.status} ${body}`);
      }
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
  const { domain } = getArvanConfig();
  const activeDomain = domain || 'shottt.io';
  const base = `https://${activeDomain}`;
  await purgeUrls([`${base}/${vendorSlug}`]);
}
