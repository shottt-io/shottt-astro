import type { APIRoute } from 'astro';
import { db } from '../../../db/db';
import { payments as paymentsTable } from '../../../db/schema';
import { getSession } from '../../../utils/auth';
import { eq } from 'drizzle-orm';
import { useTranslations } from '../../../utils/i18n';

// POST: Approve a payment
export const POST: APIRoute = async ({ request, cookies }) => {
  const { t } = useTranslations(cookies, request);
  const session = getSession(cookies);
  if (!session || session.username !== 'super') {
    return new Response(JSON.stringify({ success: false, message: t('noAccessSuper') }), { status: 403 });
  }

  try {
    const { paymentId } = await request.json();
    if (!paymentId) {
      return new Response(JSON.stringify({ success: false, message: t('requiredFieldsMissing') }), { status: 400 });
    }

    const id = parseInt(paymentId, 10);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ success: false, message: t('invalidId') }), { status: 400 });
    }

    const result = await db
      .update(paymentsTable)
      .set({
        status: 'approved',
        updatedAt: new Date(),
      })
      .where(eq(paymentsTable.id, id))
      .returning();

    if (result.length === 0) {
      return new Response(JSON.stringify({ success: false, message: t('ticketNotFound') }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, message: t('paymentApproved') }), { status: 200 });
  } catch (error: any) {
    console.error('Super approve payment error:', error);
    return new Response(JSON.stringify({ success: false, message: error.message || t('serverError') }), { status: 500 });
  }
};

// DELETE: Reject a payment
export const DELETE: APIRoute = async ({ request, cookies }) => {
  const { t } = useTranslations(cookies, request);
  const session = getSession(cookies);
  if (!session || session.username !== 'super') {
    return new Response(JSON.stringify({ success: false, message: t('noAccessSuper') }), { status: 403 });
  }

  try {
    const url = new URL(request.url);
    let idStr = url.searchParams.get('id');
    
    if (!idStr) {
      // Fallback to body read
      try {
        const body = await request.json();
        idStr = body.paymentId;
      } catch {}
    }

    if (!idStr) {
      return new Response(JSON.stringify({ success: false, message: t('requiredFieldsMissing') }), { status: 400 });
    }

    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ success: false, message: t('invalidId') }), { status: 400 });
    }

    const result = await db
      .update(paymentsTable)
      .set({
        status: 'rejected',
        updatedAt: new Date(),
      })
      .where(eq(paymentsTable.id, id))
      .returning();

    if (result.length === 0) {
      return new Response(JSON.stringify({ success: false, message: t('ticketNotFound') }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, message: t('paymentRejected') }), { status: 200 });
  } catch (error: any) {
    console.error('Super reject payment error:', error);
    return new Response(JSON.stringify({ success: false, message: error.message || t('serverError') }), { status: 500 });
  }
};
