import type { APIRoute } from 'astro';
import { db } from '../../../db/db';
import {
  vendors as vendorsTable,
  vendorUsers as vendorUsersTable,
  analyticsDailyMetrics,
  analyticsDailyItems,
  categories as categoriesTable,
  menuItems as menuItemsTable,
} from '../../../db/schema';
import { getSession } from '../../../utils/auth';
import { eq, and, gte, asc, desc, sum, inArray, ne } from 'drizzle-orm';

// Helper to check user access to a vendor ID
async function checkVendorAccess(userId: number, vendorId: number): Promise<boolean> {
  const access = await db
    .select()
    .from(vendorUsersTable)
    .where(and(eq(vendorUsersTable.userId, userId), eq(vendorUsersTable.vendorId, vendorId)))
    .limit(1);
  return access.length > 0;
}

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
  if (!session) {
    return new Response(JSON.stringify({ success: false, message: 'عدم احراز هویت' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(request.url);
    const vendorSlug = url.searchParams.get('vendorSlug');
    const rangeParam = url.searchParams.get('range'); // 'today', '7', or '30'

    if (!vendorSlug) {
      return new Response(JSON.stringify({ success: false, message: 'شناسه مجموعه الزامی است' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const days = rangeParam === 'today' ? 1 : rangeParam === '7' ? 7 : 30;

    // 1. Fetch vendor to verify authorization
    const vendorList = await db
      .select()
      .from(vendorsTable)
      .where(eq(vendorsTable.slug, vendorSlug))
      .limit(1);

    if (vendorList.length === 0) {
      return new Response(JSON.stringify({ success: false, message: 'مجموعه یافت نشد' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const vendor = vendorList[0];

    const hasAccess = await checkVendorAccess(session.userId, vendor.id);
    if (!hasAccess) {
      return new Response(JSON.stringify({ success: false, message: 'عدم دسترسی به این مجموعه' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cutoffDateStr = getTehranDateOffsetString(days - 1);

    // 2. Fetch daily page views & unique visits
    const dailyMetrics = await db
      .select()
      .from(analyticsDailyMetrics)
      .where(
        and(
          eq(analyticsDailyMetrics.vendorId, vendor.id),
          gte(analyticsDailyMetrics.date, cutoffDateStr)
        )
      )
      .orderBy(asc(analyticsDailyMetrics.date));

    // Fill gaps in dates with 0
    const metricsMap = new Map(dailyMetrics.map(m => [m.date, m]));
    const visitChartData = [];

    for (let i = days - 1; i >= 0; i--) {
      const dateKey = getTehranDateOffsetString(i);
      const existing = metricsMap.get(dateKey);
      visitChartData.push({
        date: dateKey,
        pageViews: existing ? existing.pageViews : 0,
        uniqueVisits: existing ? existing.uniqueVisits : 0,
      });
    }

    // 3. Fetch all active menu items for this vendor to ensure 0-visit items are included
    const activeCategories = await db
      .select({ id: categoriesTable.id })
      .from(categoriesTable)
      .where(
        and(
          eq(categoriesTable.vendorId, vendor.id),
          ne(categoriesTable.status, 'inactive')
        )
      );

    const categoryIds = activeCategories.map(c => c.id);
    let allItemsWithStats: any[] = [];

    if (categoryIds.length > 0) {
      const activeItems = await db
        .select({
          id: menuItemsTable.id,
          name: menuItemsTable.name,
        })
        .from(menuItemsTable)
        .where(
          and(
            inArray(menuItemsTable.categoryId, categoryIds),
            ne(menuItemsTable.status, 'inactive')
          )
        );

      // Fetch aggregated impressions for the cutoff range
      const itemImpressions = await db
        .select({
          itemId: analyticsDailyItems.itemId,
          impressions: sum(analyticsDailyItems.impressions),
        })
        .from(analyticsDailyItems)
        .where(
          and(
            eq(analyticsDailyItems.vendorId, vendor.id),
            gte(analyticsDailyItems.date, cutoffDateStr)
          )
        )
        .groupBy(analyticsDailyItems.itemId);

      const impressionsMap = new Map(
        itemImpressions.map(item => [item.itemId, parseInt(item.impressions || '0', 10)])
      );

      allItemsWithStats = activeItems.map(item => ({
        itemId: item.id,
        name: item.name,
        impressions: impressionsMap.get(item.id) || 0,
      }));
    }

    // Sort items descending by default for the return payload
    allItemsWithStats.sort((a, b) => b.impressions - a.impressions);

    return new Response(JSON.stringify({
      success: true,
      data: {
        visits: visitChartData,
        items: allItemsWithStats,
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Fetch analytics error:', error);
    return new Response(JSON.stringify({ success: false, message: 'خطای سرور' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
