import type { APIRoute } from 'astro';
import { db } from '../../../db/db';
import { vendors as vendorsTable, analyticsDailyMetrics, analyticsDailyItems } from '../../../db/schema';
import { eq, sql } from 'drizzle-orm';

// Helper function to format date in Tehran timezone (YYYY-MM-DD)
const getTehranDateString = (): string => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { vendorSlug, pageView, uniqueVisit, impressions } = data;

    if (!vendorSlug) {
      return new Response(JSON.stringify({ success: false, message: 'Vendor slug is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Lookup vendor by slug
    const vendorList = await db
      .select({ id: vendorsTable.id })
      .from(vendorsTable)
      .where(eq(vendorsTable.slug, vendorSlug))
      .limit(1);

    if (vendorList.length === 0) {
      return new Response(JSON.stringify({ success: false, message: 'Vendor not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const vendorId = vendorList[0].id;
    const dateStr = getTehranDateString();

    const pvs = pageView ? 1 : 0;
    const uvs = uniqueVisit ? 1 : 0;

    // 1. Update Daily Metrics (Page views / unique visits)
    if (pvs > 0 || uvs > 0) {
      await db
        .insert(analyticsDailyMetrics)
        .values({
          vendorId,
          date: dateStr,
          pageViews: pvs,
          uniqueVisits: uvs,
        })
        .onConflictDoUpdate({
          target: [analyticsDailyMetrics.vendorId, analyticsDailyMetrics.date],
          set: {
            pageViews: sql`${analyticsDailyMetrics.pageViews} + ${pvs}`,
            uniqueVisits: sql`${analyticsDailyMetrics.uniqueVisits} + ${uvs}`,
          },
        });
    }

    // 2. Update Daily Items (Impressions) in a batch query
    if (Array.isArray(impressions) && impressions.length > 0) {
      // De-duplicate any repeating item IDs in the payload just in case
      const uniqueItemIds = Array.from(new Set(impressions.map(Number).filter(id => !isNaN(id))));
      
      if (uniqueItemIds.length > 0) {
        const itemValues = uniqueItemIds.map((itemId) => ({
          vendorId,
          itemId,
          date: dateStr,
          impressions: 1,
        }));

        await db
          .insert(analyticsDailyItems)
          .values(itemValues)
          .onConflictDoUpdate({
            target: [analyticsDailyItems.vendorId, analyticsDailyItems.itemId, analyticsDailyItems.date],
            set: {
              impressions: sql`${analyticsDailyItems.impressions} + 1`,
            },
          });
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'Events tracked successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Failed to record analytics (database connection issue)' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
