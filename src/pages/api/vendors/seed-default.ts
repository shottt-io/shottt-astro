import type { APIRoute } from 'astro';
import { db } from '../../../db/db';
import { vendors as vendorsTable, categories as categoriesTable, menuItems as menuItemsTable, vendorUsers as vendorUsersTable } from '../../../db/schema';
import { getSession } from '../../../utils/auth';
import { eq, and } from 'drizzle-orm';
import { purgeVendorCache } from '../../../utils/purge';
import { useTranslations } from '../../../utils/i18n';
import { getSeedTemplates } from './seed-templates';

// Helper to check user access to a vendor ID
async function checkVendorAccess(userId: number, vendorId: number): Promise<boolean> {
  const access = await db
    .select()
    .from(vendorUsersTable)
    .where(and(eq(vendorUsersTable.userId, userId), eq(vendorUsersTable.vendorId, vendorId)))
    .limit(1);
  return access.length > 0;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const { t, locale } = useTranslations(cookies, request);
  const session = getSession(cookies);
  if (!session) {
    return new Response(JSON.stringify({ success: false, message: t('unauthorized') }), { status: 401 });
  }

  try {
    const { vendorSlug } = await request.json();
    if (!vendorSlug) {
      return new Response(JSON.stringify({ success: false, message: t('requiredFieldsMissing') }), { status: 400 });
    }

    // Lookup vendor
    const vendorList = await db
      .select()
      .from(vendorsTable)
      .where(eq(vendorsTable.slug, vendorSlug))
      .limit(1);

    if (vendorList.length === 0) {
      return new Response(JSON.stringify({ success: false, message: t('vendorNotFound') }), { status: 404 });
    }
    const vendor = vendorList[0];

    // Check access
    const hasAccess = await checkVendorAccess(session.userId, vendor.id);
    if (!hasAccess) {
      return new Response(JSON.stringify({ success: false, message: t('noAccessToVendor') }), { status: 403 });
    }

    // Define mock data templates based on vendor type and locale
    const typeLower = (vendor.type || 'سایر').toLowerCase();
    const defaultCategories = getSeedTemplates(locale, typeLower);

    // Determine brand logo based on type
    let seededLogo = '/logo.png';
    if (typeLower.includes('کافه') && typeLower.includes('رستوران')) {
      seededLogo = 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=300&auto=format&fit=crop';
    } else if (typeLower.includes('کافه') || typeLower.includes('قهوه')) {
      seededLogo = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=300&auto=format&fit=crop';
    } else if (typeLower.includes('رستوران') || typeLower.includes('فست فود') || typeLower.includes('برگر') || typeLower.includes('پیتزا')) {
      seededLogo = 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=300&auto=format&fit=crop';
    } else if (typeLower.includes('پوشاک') || typeLower.includes('لباس') || typeLower.includes('مزون') || typeLower.includes('بوتیک')) {
      seededLogo = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=300&auto=format&fit=crop';
    } else {
      seededLogo = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=300&auto=format&fit=crop';
    }

    // Insert to DB using a transaction
    await db.transaction(async (tx) => {
      // Update vendor logo
      await tx
        .update(vendorsTable)
        .set({ logo: seededLogo })
        .where(eq(vendorsTable.id, vendor.id));

      let sortOrder = 0;
      for (const catData of defaultCategories) {
        // Insert category
        const [insertedCat] = await tx
          .insert(categoriesTable)
          .values({
            vendorId: vendor.id,
            name: catData.name,
            sortOrder: sortOrder++,
            status: 'available'
          })
          .returning();

        // Insert items
        let itemSortOrder = 0;
        for (const itemData of catData.items) {
          await tx
            .insert(menuItemsTable)
            .values({
              categoryId: insertedCat.id,
              name: itemData.name,
              price: itemData.price,
              description: itemData.description,
              image: itemData.image,
              sortOrder: itemSortOrder++,
              status: 'available',
              span2: false
            });
        }
      }
    });

    // Purge CDN Cache
    purgeVendorCache(vendorSlug).catch(() => {});

    return new Response(JSON.stringify({ success: true, message: t('sampleMenuSuccess') }), { status: 200 });
  } catch (error: any) {
    console.error('Seed Default Data Error:', error);
    return new Response(JSON.stringify({ success: false, message: t('sampleMenuError') }), { status: 500 });
  }
};
