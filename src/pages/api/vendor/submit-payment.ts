import type { APIRoute } from 'astro';
import { db } from '../../../db/db';
import { payments as paymentsTable, vendors as vendorsTable, vendorUsers as vendorUsersTable } from '../../../db/schema';
import { getSession } from '../../../utils/auth';
import { eq, and, desc } from 'drizzle-orm';
import { useTranslations } from '../../../utils/i18n';

export const POST: APIRoute = async ({ request, cookies }) => {
  const { t } = useTranslations(cookies, request);
  const session = getSession(cookies);
  if (!session) {
    return new Response(JSON.stringify({ success: false, message: t('unauthorized') }), { status: 401 });
  }

  try {
    const { hash, vendorSlug, paidAt, month } = await request.json();
    if (!hash || !vendorSlug) {
      return new Response(JSON.stringify({ success: false, message: t('requiredFieldsMissing') }), { status: 400 });
    }

    // 1. Fetch vendor by slug
    const vendorList = await db
      .select()
      .from(vendorsTable)
      .where(eq(vendorsTable.slug, vendorSlug))
      .limit(1);

    if (vendorList.length === 0) {
      return new Response(JSON.stringify({ success: false, message: t('vendorNotFound') }), { status: 404 });
    }
    const vendor = vendorList[0];

    // 2. Verify user has access to this vendor
    const accessList = await db
      .select()
      .from(vendorUsersTable)
      .where(
        and(
          eq(vendorUsersTable.userId, session.userId),
          eq(vendorUsersTable.vendorId, vendor.id)
        )
      )
      .limit(1);

    if (accessList.length === 0 && session.username !== 'super') {
      return new Response(JSON.stringify({ success: false, message: t('noAccessToVendor') }), { status: 403 });
    }

    // 3. Compute month key (YYYY-MM)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth() + 1;
    const currentMonthStr = month ? month.trim() : `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;

    // 4. Query if a payment record already exists for this vendor and month
    const existing = await db
      .select()
      .from(paymentsTable)
      .where(
        and(
          eq(paymentsTable.vendorId, vendor.id),
          eq(paymentsTable.month, currentMonthStr)
        )
      )
      .orderBy(desc(paymentsTable.createdAt))
      .limit(1);

    const parsedPaidAt = paidAt ? new Date(paidAt) : new Date();

    if (existing.length > 0) {
      // Update existing record to 'pending' with the new hash
      await db
        .update(paymentsTable)
        .set({
          status: 'pending',
          hash: hash.trim(),
          paidAt: parsedPaidAt,
          updatedAt: new Date(),
        })
        .where(eq(paymentsTable.id, existing[0].id));
    } else {
      // Insert new payment record
      await db.insert(paymentsTable).values({
        vendorId: vendor.id,
        month: currentMonthStr,
        status: 'pending',
        hash: hash.trim(),
        paidAt: parsedPaidAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return new Response(JSON.stringify({ success: true, message: t('replySuccess') }), { status: 200 });
  } catch (error: any) {
    console.error('Submit payment hash error:', error);
    return new Response(JSON.stringify({ success: false, message: error.message || t('serverError') }), { status: 500 });
  }
};
