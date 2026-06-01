import type { APIRoute } from 'astro';
import { db } from '../../../db/db';
import {
  vendors as vendorsTable,
  analyticsDailyMetrics,
  homepageDailyMetrics,
} from '../../../db/schema';
import { getSession } from '../../../utils/auth';
import { gte, asc, sum } from 'drizzle-orm';

// Helper to calculate date offsets in Tehran timezone
const getTehranDateOffsetString = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
};

export const GET: APIRoute = async ({ request, cookies }) => {
  const session = getSession(cookies);
  if (!session || session.username !== 'super') {
    return new Response(JSON.stringify({ success: false, message: 'عدم دسترسی' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(request.url);
    const rangeParam = url.searchParams.get('range'); // 'today', '7', or '30'
    const days = rangeParam === 'today' ? 1 : rangeParam === '7' ? 7 : 30;
    const cutoffDateStr = getTehranDateOffsetString(days - 1);

    // 1. Homepage daily metrics
    const homepageMetrics = await db
      .select()
      .from(homepageDailyMetrics)
      .where(gte(homepageDailyMetrics.date, cutoffDateStr))
      .orderBy(asc(homepageDailyMetrics.date));

    // Fill date gaps with zeros
    const homepageMap = new Map(homepageMetrics.map(m => [m.date, m]));
    const homepageChartData = [];
    for (let i = days - 1; i >= 0; i--) {
      const dateKey = getTehranDateOffsetString(i);
      const existing = homepageMap.get(dateKey);
      homepageChartData.push({
        date: dateKey,
        pageViews: existing ? existing.pageViews : 0,
        uniqueVisits: existing ? existing.uniqueVisits : 0,
      });
    }

    // 2. All vendors aggregated daily metrics
    const vendorMetricsRaw = await db
      .select({
        date: analyticsDailyMetrics.date,
        pageViews: sum(analyticsDailyMetrics.pageViews),
        uniqueVisits: sum(analyticsDailyMetrics.uniqueVisits),
      })
      .from(analyticsDailyMetrics)
      .where(gte(analyticsDailyMetrics.date, cutoffDateStr))
      .groupBy(analyticsDailyMetrics.date)
      .orderBy(asc(analyticsDailyMetrics.date));

    // Fill date gaps
    const vendorMetricsMap = new Map(vendorMetricsRaw.map(m => [m.date, m]));
    const vendorChartData = [];
    for (let i = days - 1; i >= 0; i--) {
      const dateKey = getTehranDateOffsetString(i);
      const existing = vendorMetricsMap.get(dateKey);
      vendorChartData.push({
        date: dateKey,
        pageViews: existing ? parseInt(existing.pageViews || '0', 10) : 0,
        uniqueVisits: existing ? parseInt(existing.uniqueVisits || '0', 10) : 0,
      });
    }

    // 3. Per-vendor summary (total pageViews & uniqueVisits in range)
    const vendorSummaryRaw = await db
      .select({
        vendorId: analyticsDailyMetrics.vendorId,
        totalPageViews: sum(analyticsDailyMetrics.pageViews),
        totalUniqueVisits: sum(analyticsDailyMetrics.uniqueVisits),
      })
      .from(analyticsDailyMetrics)
      .where(gte(analyticsDailyMetrics.date, cutoffDateStr))
      .groupBy(analyticsDailyMetrics.vendorId);

    // Fetch all vendors for name resolution
    const allVendors = await db
      .select({ id: vendorsTable.id, name: vendorsTable.name, slug: vendorsTable.slug })
      .from(vendorsTable);

    const vendorNameMap = new Map(allVendors.map(v => [v.id, { name: v.name, slug: v.slug }]));

    const vendorSummary = vendorSummaryRaw
      .map(v => ({
        vendorId: v.vendorId,
        name: vendorNameMap.get(v.vendorId)?.name || 'نامشخص',
        slug: vendorNameMap.get(v.vendorId)?.slug || '',
        totalPageViews: parseInt(v.totalPageViews || '0', 10),
        totalUniqueVisits: parseInt(v.totalUniqueVisits || '0', 10),
      }))
      .sort((a, b) => b.totalPageViews - a.totalPageViews)
      .slice(0, 10);

    return new Response(JSON.stringify({
      success: true,
      data: {
        homepage: homepageChartData,
        vendors: vendorChartData,
        vendorSummary,
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Super analytics fetch error:', error);
    return new Response(JSON.stringify({ success: false, message: 'خطای سرور' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
