import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Do not touch static assets or file paths containing a dot
  const isStaticFile = pathname.includes('.') || pathname.startsWith('/_astro');
  if (isStaticFile) {
    return response;
  }

  // Create a new Headers instance to avoid immutable header modification issues
  const newHeaders = new Headers(response.headers);

  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    // Admin dashboard and APIs should NEVER be cached by CDN or browser
    newHeaders.set(
      'Cache-Control',
      'private, no-cache, no-store, must-revalidate'
    );
    newHeaders.set('Pragma', 'no-cache');
    newHeaders.set('Expires', '0');
  } else if (context.request.method === 'GET' && response.status === 200) {
    // Public pages (landing and vendor catalogs) cached on CDN for 5 seconds
    // and served stale for up to 10 minutes while background revalidation occurs.
    // This allows instant load times via CDN while ensuring database updates
    // propagate to users within seconds via background revalidation.
    newHeaders.set(
      'Cache-Control',
      'public, max-age=0, s-maxage=5, stale-while-revalidate=600'
    );
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
});
