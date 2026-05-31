import type { APIRoute } from 'astro';
import { db } from '../../../db/db';
import { users as usersTable, vendors as vendorsTable, vendorUsers as vendorUsersTable } from '../../../db/schema';
import { hashPassword, signSession } from '../../../utils/auth';
import { eq } from 'drizzle-orm';
import { purgeVendorCache } from '../../../utils/purge';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { name, slug, type, city, userName, phone, username, password } = body;

    // 1. Validation
    if (!name || !slug || !type || !city || !userName || !phone || !username || !password) {
      return new Response(
        JSON.stringify({ success: false, message: 'لطفاً تمامی فیلدهای الزامی را تکمیل کنید.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const normalizedSlug = slug.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    // Reserved system keywords
    const RESERVED_KEYWORDS = [
      'admin', 'api', 'dashboard', 'auth', 'login', 'register', 
      'static', 'assets', 'super', 'vendors', 'products', 'tickets', 
      'categories', 'menu', 'preview', 'shottt', 'root', 'administrator', 
      'manager', 'user', 'settings', 'config', 'profile', 'logout',
      'help', 'support', 'billing', 'db', 'database', 'system'
    ];

    if (RESERVED_KEYWORDS.includes(normalizedSlug)) {
      return new Response(
        JSON.stringify({ success: false, message: 'این شناسه مجموعه (Slug) مجاز نیست و جزو کلمات رزرو شده سیستم است.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (RESERVED_KEYWORDS.includes(normalizedUsername)) {
      return new Response(
        JSON.stringify({ success: false, message: 'این نام کاربری مجاز نیست و جزو کلمات رزرو شده سیستم است.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify slug format (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(normalizedSlug)) {
      return new Response(
        JSON.stringify({ success: false, message: 'شناسه مجموعه (Slug) فقط می‌تواند شامل حروف انگلیسی، اعداد و خط تیره (-) باشد.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Check duplicates
    const existingUser = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.username, normalizedUsername))
      .limit(1);

    if (existingUser.length > 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'این نام کاربری قبلاً انتخاب شده است.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const existingVendor = await db
      .select({ id: vendorsTable.id })
      .from(vendorsTable)
      .where(eq(vendorsTable.slug, normalizedSlug))
      .limit(1);

    if (existingVendor.length > 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'آدرس اینترنتی یا شناسه مجموعه (Slug) قبلاً ثبت شده است.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Determine default logo icon based on type
    let logoIcon = 'store';
    const typeLower = type.toLowerCase();
    if (typeLower.includes('کافه') || typeLower.includes('cafe')) {
      logoIcon = 'coffee';
    } else if (typeLower.includes('رستوران') || typeLower.includes('restaurant')) {
      logoIcon = 'utensils';
    } else if (typeLower.includes('قنادی') || typeLower.includes('شیرینی') || typeLower.includes('pastry') || typeLower.includes('bakery')) {
      logoIcon = 'cake';
    } else if (typeLower.includes('پوشاک') || typeLower.includes('لباس')) {
      logoIcon = 'shirt';
    } else if (typeLower.includes('گالری') || typeLower.includes('هنر')) {
      logoIcon = 'palette';
    } else if (typeLower.includes('دیجیتال')) {
      logoIcon = 'laptop';
    } else if (typeLower.includes('آرایشی')) {
      logoIcon = 'sparkles';
    }

    // 4. Save to Database using transaction
    let userSessionData: any = null;

    await db.transaction(async (tx) => {
      // Create Vendor
      const [newVendor] = await tx
        .insert(vendorsTable)
        .values({
          slug: normalizedSlug,
          name: name.trim(),
          type: type.trim(),
          slogan: 'به کاتالوگ دیجیتال ما خوش آمدید',
          description: 'به کاتالوگ دیجیتال ما خوش آمدید',
          defaultLayout: 'pinterest',
          theme: 'light',
          logoIcon: logoIcon,
          logo: '/logo.png',
          city: city.trim(),
          syncSourceUrl: null
        })
        .returning();

      // Create User
      const [newUser] = await tx
        .insert(usersTable)
        .values({
          username: normalizedUsername,
          password: hashPassword(password),
          name: userName.trim(),
          phone: phone.trim(),
        })
        .returning();

      // Link User and Vendor
      await tx
        .insert(vendorUsersTable)
        .values({
          vendorId: newVendor.id,
          userId: newUser.id
        });

      userSessionData = {
        userId: newUser.id,
        username: newUser.username,
        name: newUser.name || newUser.username
      };
    });

    // 5. Sign Session Cookie
    const token = signSession(userSessionData);
    cookies.set('admin_session', token, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Clear CDN cache
    purgeVendorCache(normalizedSlug).catch(() => {});

    return new Response(
      JSON.stringify({ success: true, message: 'ثبت‌نام با موفقیت انجام شد.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Registration API error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'خطای سرور در انجام ثبت‌نام.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
