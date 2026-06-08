import type { APIRoute } from 'astro';
import { db } from '../../../db/db';
import { homepageDailyMetrics } from '../../../db/schema';
import { sql } from 'drizzle-orm';

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
    const { pageView, uniqueVisit } = data;

    const pvs = pageView ? 1 : 0;
    const uvs = uniqueVisit ? 1 : 0;

    if (pvs === 0 && uvs === 0) {
      return new Response(JSON.stringify({ success: true, message: 'Nothing to track' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const dateStr = getTehranDateString();

    await db
      .insert(homepageDailyMetrics)
      .values({
        date: dateStr,
        pageViews: pvs,
        uniqueVisits: uvs,
      })
      .onConflictDoUpdate({
        target: [homepageDailyMetrics.date],
        set: {
          pageViews: sql`${homepageDailyMetrics.pageViews} + ${pvs}`,
          uniqueVisits: sql`${homepageDailyMetrics.uniqueVisits} + ${uvs}`,
        },
      });

    return new Response(JSON.stringify({ success: true, message: 'Homepage visit tracked' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Homepage analytics tracking error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Failed to record analytics (database connection issue)' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
