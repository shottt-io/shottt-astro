import type { APIRoute } from 'astro';
import { db } from '../../../db/db';
import { tickets, vendorUsers } from '../../../db/schema';
import { getSession } from '../../../utils/auth';
import { and, eq } from 'drizzle-orm';

export const PATCH: APIRoute = async ({ request, cookies }) => {
  const session = getSession(cookies);
  if (!session) {
    return new Response(JSON.stringify({ success: false, message: 'عدم احراز هویت' }), { status: 401 });
  }

  try {
    const { ticketId } = await request.json();

    if (!ticketId) {
      return new Response(JSON.stringify({ success: false, message: 'شناسه تیکت الزامی است' }), { status: 400 });
    }

    // 1. Fetch the ticket
    const ticketList = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, Number(ticketId)))
      .limit(1);

    if (ticketList.length === 0) {
      return new Response(JSON.stringify({ success: false, message: 'تیکت یافت نشد' }), { status: 404 });
    }

    const ticket = ticketList[0];

    // 2. Perform role-based updates and authorization check
    if (session.username === 'super') {
      // Super Admin: mark as seen by super
      await db
        .update(tickets)
        .set({ seenBySuper: true })
        .where(eq(tickets.id, ticket.id));
    } else {
      // Vendor Admin: verify access first
      const access = await db
        .select()
        .from(vendorUsers)
        .where(
          and(
            eq(vendorUsers.userId, session.userId),
            eq(vendorUsers.vendorId, ticket.vendorId)
          )
        )
        .limit(1);

      if (access.length === 0) {
        return new Response(JSON.stringify({ success: false, message: 'عدم دسترسی به این تیکت' }), { status: 403 });
      }

      // Mark as seen by vendor
      await db
        .update(tickets)
        .set({ seenByVendor: true })
        .where(eq(tickets.id, ticket.id));
    }

    return new Response(JSON.stringify({ success: true, message: 'تیکت خوانده شد' }), { status: 200 });
  } catch (error: any) {
    console.error('Error marking ticket as seen:', error);
    return new Response(JSON.stringify({ success: false, message: 'خطای سرور' }), { status: 500 });
  }
};
