import type { APIRoute } from 'astro';
import { db } from '../../../db/db';
import { payments as paymentsTable, vendors as vendorsTable } from '../../../db/schema';
import { getSession } from '../../../utils/auth';
import { eq, and } from 'drizzle-orm';
import { useTranslations } from '../../../utils/i18n';

export const POST: APIRoute = async ({ request, cookies }) => {
  const { t } = useTranslations(cookies, request);
  const session = getSession(cookies);
  
  // Verify super admin
  if (!session || session.username !== 'super') {
    return new Response(JSON.stringify({ success: false, message: t('unauthorized') }), { status: 401 });
  }

  try {
    const { vendorId, month } = await request.json();
    if (!vendorId || !month) {
      return new Response(JSON.stringify({ success: false, message: 'Vendor ID and Month (YYYY-MM) are required.' }), { status: 400 });
    }

    // 1. Fetch vendor to verify existence
    const vendorList = await db
      .select()
      .from(vendorsTable)
      .where(eq(vendorsTable.id, parseInt(vendorId, 10)))
      .limit(1);

    if (vendorList.length === 0) {
      return new Response(JSON.stringify({ success: false, message: 'Vendor not found.' }), { status: 404 });
    }

    // 2. Check if a payment record for this month already exists
    const existing = await db
      .select()
      .from(paymentsTable)
      .where(
        and(
          eq(paymentsTable.vendorId, parseInt(vendorId, 10)),
          eq(paymentsTable.month, month)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return new Response(JSON.stringify({ success: false, message: `Invoice for ${month} already exists for this vendor.` }), { status: 400 });
    }

    // 3. Insert unpaid invoice record
    await db.insert(paymentsTable).values({
      vendorId: parseInt(vendorId, 10),
      month: month,
      status: 'unpaid',
      hash: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return new Response(JSON.stringify({ success: true, message: 'Invoice generated successfully.' }), { status: 200 });
  } catch (error: any) {
    console.error('Create test invoice error:', error);
    return new Response(JSON.stringify({ success: false, message: error.message || t('serverError') }), { status: 500 });
  }
};
