import { db } from '../db/db';
import { payments } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { TOTAL_FREE } from '../config/region';

export interface BillingStatus {
  active: boolean;
  status: 'free' | 'new_trial' | 'paid' | 'pending' | 'rejected' | 'unpaid';
  hash?: string;
}

export async function checkVendorActive(vendor: { id: number; createdAt: Date | string }): Promise<BillingStatus> {
  // 1. If system-wide total free is enabled, bypass
  if (TOTAL_FREE) {
    return { active: true, status: 'free' };
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;
  const currentMonthStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;

  // 2. First Month Free: Check if vendor registered in the current calendar month
  const vendorCreatedAt = new Date(vendor.createdAt);
  const registerYear = vendorCreatedAt.getFullYear();
  const registerMonth = vendorCreatedAt.getMonth() + 1;
  const registerMonthStr = `${registerYear}-${String(registerMonth).padStart(2, '0')}`;

  if (registerMonthStr === currentMonthStr) {
    return { active: true, status: 'new_trial' };
  }

  // 3. Query the payments table for the current month record
  const paymentRecord = await db
    .select()
    .from(payments)
    .where(
      and(
        eq(payments.vendorId, vendor.id),
        eq(payments.month, currentMonthStr)
      )
    )
    .orderBy(desc(payments.createdAt))
    .limit(1);

  // 4. If no billing entry exists for this month, auto-insert an 'unpaid' pending billing
  if (paymentRecord.length === 0) {
    await db.insert(payments).values({
      vendorId: vendor.id,
      month: currentMonthStr,
      status: 'unpaid',
      hash: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const currentDay = now.getDate();
    const isGracePeriod = currentDay <= 10;
    return { active: isGracePeriod, status: 'unpaid' };
  }

  const record = paymentRecord[0];

  const currentDay = now.getDate();
  const isGracePeriod = currentDay <= 10;

  // 5. Evaluate the current status of the monthly billing
  if (record.status === 'approved') {
    return { active: true, status: 'paid' };
  } else if (record.status === 'pending') {
    return { active: isGracePeriod, status: 'pending', hash: record.hash };
  } else if (record.status === 'rejected') {
    return { active: isGracePeriod, status: 'rejected' };
  }

  return { active: isGracePeriod, status: 'unpaid' };
}

export function formatSubscriptionFee(fee: string | undefined | null, locale: string): string {
  if (!fee) return '';
  const cleanFee = fee.split('/')[0].trim();
  const parsed = parseFloat(cleanFee);
  if (!isNaN(parsed) && !cleanFee.includes('€') && !cleanFee.includes('$')) {
    return `${parsed} €`;
  }
  return cleanFee;
}

export function formatBillingMonth(monthStr: string | undefined | null, locale: string): string {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  if (!year || !month) return monthStr;
  const monthNum = parseInt(month, 10);
  
  const monthNamesFa = [
    'ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن',
    'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'
  ];
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNamesTr = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const monthIndex = monthNum - 1;
  if (monthIndex < 0 || monthIndex > 11) return monthStr;

  if (locale === 'fa') {
    const persianYear = year.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)]);
    return `${monthNamesFa[monthIndex]} ${persianYear}`;
  } else if (locale === 'tr') {
    return `${monthNamesTr[monthIndex]} ${year}`;
  } else {
    return `${monthNamesEn[monthIndex]} ${year}`;
  }
}

export function formatDateString(dateInput: Date | string | undefined | null): string {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

