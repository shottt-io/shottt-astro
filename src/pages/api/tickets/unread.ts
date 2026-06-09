import type { APIRoute } from 'astro';
import { db } from '../../../db/db';
import { tickets, vendors, vendorUsers } from '../../../db/schema';
import { getSession } from '../../../utils/auth';
import { and, eq } from 'drizzle-orm';
import { useTranslations } from '../../../utils/i18n';

export const GET: APIRoute = async ({ request, cookies }) => {
  const { t } = useTranslations(cookies, request);
  const session = getSession(cookies);
  if (!session) {
    return new Response(JSON.stringify({ success: false, message: t('unauthorized') }), { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const vendorSlug = url.searchParams.get('vendorSlug');

    let hasUnread = false;

    if (session.username === 'super') {
      // Super Admin: check all tickets where seenBySuper is false
      const unreadTickets = await db
        .select({ id: tickets.id })
        .from(tickets)
        .where(eq(tickets.seenBySuper, false))
        .limit(1);

      hasUnread = unreadTickets.length > 0;
    } else {
      // Vendor Admin: check tickets for the current vendor or all linked vendors
      if (vendorSlug) {
        // Look up vendor by slug
        const vendorList = await db
          .select()
          .from(vendors)
          .where(eq(vendors.slug, vendorSlug))
          .limit(1);

        if (vendorList.length > 0) {
          const vendor = vendorList[0];
          // Check access
          const access = await db
            .select()
            .from(vendorUsers)
            .where(
              and(
                eq(vendorUsers.userId, session.userId),
                eq(vendorUsers.vendorId, vendor.id)
              )
            )
            .limit(1);

          if (access.length > 0) {
            const unreadTickets = await db
              .select({ id: tickets.id })
              .from(tickets)
              .where(
                and(
                  eq(tickets.vendorId, vendor.id),
                  eq(tickets.seenByVendor, false)
                )
              )
              .limit(1);

            hasUnread = unreadTickets.length > 0;
          }
        }
      } else {
        // Check across all vendors this user has access to
        const userVendors = await db
          .select({ vendorId: vendorUsers.vendorId })
          .from(vendorUsers)
          .where(eq(vendorUsers.userId, session.userId));

        if (userVendors.length > 0) {
          const vendorIds = userVendors.map(uv => uv.vendorId);
          // Query for unread tickets in any of these vendor IDs
          for (const vendorId of vendorIds) {
            const unread = await db
              .select({ id: tickets.id })
              .from(tickets)
              .where(
                and(
                  eq(tickets.vendorId, vendorId),
                  eq(tickets.seenByVendor, false)
                )
              )
              .limit(1);

            if (unread.length > 0) {
              hasUnread = true;
              break;
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, hasUnread }), { status: 200 });
  } catch (error: any) {
    console.error('Error checking unread tickets count:', error);
    return new Response(JSON.stringify({ success: false, message: t('serverError') }), { status: 500 });
  }
};
