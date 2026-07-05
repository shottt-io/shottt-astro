import type { APIRoute } from 'astro';
import { db } from '../../../db/db';
import { users as usersTable, vendors as vendorsTable, vendorUsers as vendorUsersTable, categories as categoriesTable, menuItems as menuItemsTable } from '../../../db/schema';
import { hashPassword, signSession } from '../../../utils/auth';
import { eq } from 'drizzle-orm';
import { purgeVendorCache } from '../../../utils/purge';
import { useTranslations } from '../../../utils/i18n';

export const POST: APIRoute = async ({ request, cookies }) => {
  const { t } = useTranslations(cookies, request);
  try {
    const body = await request.json();
    const { name, slug, type, city, country, userName, phone, username, password, timezone, previewId } = body;

    let previewData: any = null;
    if (previewId) {
      const { previews } = await import('../../../utils/store');
      previewData = await previews.get(previewId);
    }

    // 1. Validation
    if (!name || !slug || !type || !city || !country || !userName || !phone || !username || !password) {
      return new Response(
        JSON.stringify({ success: false, message: t('requiredFieldsMissing') }),
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
        JSON.stringify({ success: false, message: t('slugReserved') }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (RESERVED_KEYWORDS.includes(normalizedUsername)) {
      return new Response(
        JSON.stringify({ success: false, message: t('usernameReserved') }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify slug format (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(normalizedSlug)) {
      return new Response(
        JSON.stringify({ success: false, message: t('slugFormatError') }),
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
        JSON.stringify({ success: false, message: t('usernameTaken') }),
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
        JSON.stringify({ success: false, message: t('slugTaken') }),
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
          slogan: previewData ? (previewData.slogan || t('seoDescription')) : t('seoDescription'),
          description: previewData ? (previewData.slogan || t('seoDescription')) : t('seoDescription'),
          defaultLayout: previewData ? (previewData.defaultLayout || 'pinterest') : 'pinterest',
          theme: previewData ? (previewData.theme || 'light') : 'light',
          logoIcon: previewData ? (previewData.logoIcon || logoIcon) : logoIcon,
          logo: previewData ? (previewData.logo || '/logo.png') : '/logo.png',
          city: city.trim(),
          country: country.trim(),
          timezone: timezone ? timezone.trim() : 'Asia/Tehran',
          syncSourceUrl: null,
          locale: previewData ? (previewData.locale || null) : null,
          currency: previewData ? (previewData.currency || null) : null
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

      // Clone preview categories and items
      if (previewData && previewData.categories) {
        let catOrder = 0;
        for (const cat of previewData.categories) {
          const [newCat] = await tx
            .insert(categoriesTable)
            .values({
              vendorId: newVendor.id,
              name: cat.name,
              sortOrder: catOrder++,
              status: 'available'
            })
            .returning();

          if (cat.items) {
            let itemOrder = 0;
            for (const item of cat.items) {
              await tx
                .insert(menuItemsTable)
                .values({
                  categoryId: newCat.id,
                  name: item.name,
                  slug: item.slug || null,
                  price: String(item.price),
                  image: item.image || null,
                  description: item.description || null,
                  discount: item.discount ? {
                    originalPrice: String(item.discount.originalPrice),
                    discountText: item.discount.discountText
                  } : null,
                  span2: item.span2 || false,
                  status: 'available',
                  sortOrder: itemOrder++,
                  sections: []
                });
            }
          }
        }
      }

      userSessionData = {
        userId: newUser.id,
        username: newUser.username,
        name: newUser.name || newUser.username
      };
    });

    // Clean up preview session
    if (previewId) {
      const { previews } = await import('../../../utils/store');
      await previews.delete(previewId);
    }

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
      JSON.stringify({ success: true, message: t('registerSuccess') }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Registration API error:', error);
    return new Response(
      JSON.stringify({ success: false, message: t('registerError') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
