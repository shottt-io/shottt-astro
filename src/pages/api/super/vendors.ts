import type { APIRoute } from 'astro';
import { db } from '../../../db/db';
import { 
  vendors as vendorsTable, 
  categories as categoriesTable, 
  menuItems as menuItemsTable, 
  vendorUsers as vendorUsersTable 
} from '../../../db/schema';
import { getSession } from '../../../utils/auth';
import { eq, and } from 'drizzle-orm';
import { vendors as mockVendors } from '../../../data/vendors';
import { downloadAndSaveImage } from '../../../utils/download';

// Helper to determine logo icon from type
function getLogoIconFromType(type: string): string {
  const typeLower = type.toLowerCase();
  if (type.includes('کافه') || typeLower.includes('coffee') || typeLower.includes('cafe')) {
    return 'coffee';
  } else if (type.includes('رستوران') || type.includes('بیسترو') || typeLower.includes('restaurant') || typeLower.includes('bistro')) {
    return 'utensils';
  } else if (type.includes('قنادی') || type.includes('شیرینی') || typeLower.includes('pastry') || typeLower.includes('bakery') || typeLower.includes('cake')) {
    return 'cake';
  } else if (type.includes('پوشاک') || type.includes('لباس') || typeLower.includes('store') || typeLower.includes('shop')) {
    return 'shirt';
  } else if (type.includes('گالری') || type.includes('هنر') || typeLower.includes('art') || typeLower.includes('gallery')) {
    return 'palette';
  } else if (type.includes('دیجیتال') || typeLower.includes('digital') || typeLower.includes('tech')) {
    return 'laptop';
  }
  return 'store';
}

// GET: List all vendors
export const GET: APIRoute = async ({ cookies }) => {
  const session = getSession(cookies);
  if (!session || session.username !== 'super') {
    return new Response(JSON.stringify({ success: false, message: 'عدم دسترسی به پنل سازمانی' }), { status: 403 });
  }

  try {
    const list = await db.select().from(vendorsTable).orderBy(vendorsTable.name);
    return new Response(JSON.stringify({ success: true, vendors: list }), { status: 200 });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: error.message || 'خطای سرور' }), { status: 500 });
  }
};

// POST: Create a new vendor
export const POST: APIRoute = async ({ request, cookies }) => {
  const session = getSession(cookies);
  if (!session || session.username !== 'super') {
    return new Response(JSON.stringify({ success: false, message: 'عدم دسترسی به پنل سازمانی' }), { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, slug, type, mode, packageType, mennoVendor } = body;

    if (!name || !slug || !type || !mode) {
      return new Response(JSON.stringify({ success: false, message: 'پر کردن فیلدهای ستاره‌دار الزامی است' }), { status: 400 });
    }

    // Check if slug already exists
    const existing = await db
      .select()
      .from(vendorsTable)
      .where(eq(vendorsTable.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      return new Response(JSON.stringify({ success: false, message: 'این آیدی مجموعه (Slug) قبلاً ثبت شده است' }), { status: 400 });
    }

    let createdVendorId: number;

    if (mode === 'empty') {
      // 1. Create Empty Vendor
      const [newVendor] = await db.insert(vendorsTable).values({
        slug,
        name,
        type,
        slogan: 'کاتالوگ دیجیتال ما',
        description: 'به کاتالوگ دیجیتال ما خوش آمدید.',
        defaultLayout: 'pinterest',
        logoIcon: getLogoIconFromType(type),
        logo: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=1200&auto=format&fit=crop',
      }).returning({ id: vendorsTable.id });
      
      createdVendorId = newVendor.id;
    } else if (mode === 'package') {
      // 2. Create Pre-filled Package Vendor
      const targetMockSlug = packageType === 'cafe' ? 'cafe-lumiere' : packageType === 'restaurant' ? 'bistro-dada' : 'pastry-atelier';
      const mockVendor = mockVendors.find(v => v.slug === targetMockSlug);
      
      if (!mockVendor) {
        return new Response(JSON.stringify({ success: false, message: 'پکیج انتخابی یافت نشد' }), { status: 400 });
      }

      const [newVendor] = await db.insert(vendorsTable).values({
        slug,
        name,
        type,
        slogan: mockVendor.slogan,
        description: mockVendor.description,
        defaultLayout: mockVendor.defaultLayout,
        logoIcon: getLogoIconFromType(type),
        logo: mockVendor.logo,
      }).returning({ id: vendorsTable.id });

      createdVendorId = newVendor.id;

      // Copy categories & products from template
      let sortOrder = 0;
      for (const category of mockVendor.categories) {
        const [newCategory] = await db.insert(categoriesTable).values({
          vendorId: createdVendorId,
          name: category.name,
          sortOrder: sortOrder++,
          status: 'available',
        }).returning({ id: categoriesTable.id });

        for (const item of category.items) {
          await db.insert(menuItemsTable).values({
            categoryId: newCategory.id,
            name: item.name,
            slug: item.id,
            price: item.price,
            image: item.image || null,
            description: item.description || null,
            discount: item.discount ? {
              originalPrice: item.discount.originalPrice,
              discountText: item.discount.discountText,
            } : null,
            span2: item.span2 || false,
            sections: item.sections || [],
            status: 'available',
          });
        }
      }
    } else if (mode === 'menno') {
      // 3. Sync from menno.pro
      if (!mennoVendor) {
        return new Response(JSON.stringify({ success: false, message: 'شناسه مجموعه menno.pro الزامی است' }), { status: 400 });
      }

      // Fetch Shop Info
      const shopRes = await fetch(`https://api.menno.pro/shops/${mennoVendor}`);
      if (!shopRes.ok) {
        return new Response(JSON.stringify({ success: false, message: `یافتن اطلاعات مجموعه در menno.pro با خطا مواجه شد (${shopRes.statusText})` }), { status: 400 });
      }
      const shopData = await shopRes.json();

      // Download Shop Logo
      let logoUrl = 'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=1200&auto=format&fit=crop';
      const logoPath = shopData.logoImage?.origin || shopData.logoImage?.md || shopData.logo;
      if (logoPath) {
        const remoteLogoUrl = logoPath.startsWith('http') ? logoPath : `https://file.menno.pro/${logoPath}`;
        const downloadedLogo = await downloadAndSaveImage(remoteLogoUrl);
        if (downloadedLogo) logoUrl = downloadedLogo;
      }

      // Insert Vendor
      const [newVendor] = await db.insert(vendorsTable).values({
        slug,
        name,
        type,
        slogan: shopData.description || 'کاتالوگ دیجیتال ما',
        description: shopData.seo?.description || shopData.description || 'به کاتالوگ دیجیتال ما خوش آمدید.',
        defaultLayout: 'pinterest',
        logoIcon: getLogoIconFromType(type),
        logo: logoUrl,
      }).returning({ id: vendorsTable.id });

      createdVendorId = newVendor.id;

      // Fetch Menu Info
      const menuRes = await fetch(`https://api.menno.pro/menus/${mennoVendor}`);
      if (menuRes.ok) {
        const menuData = await menuRes.json();
        if (menuData.categories && Array.isArray(menuData.categories)) {
          // Sort categories by their position ascending
          const sortedCategories = [...menuData.categories].sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
          
          let catSort = 0;
          for (const cat of sortedCategories) {
            // Insert Category
            const [newCategory] = await db.insert(categoriesTable).values({
              vendorId: createdVendorId,
              name: cat.title || 'بدون نام',
              sortOrder: catSort++,
              status: 'available',
            }).returning({ id: categoriesTable.id });

            if (cat.products && Array.isArray(cat.products)) {
              // Sort products by their position ascending
              const sortedProducts = [...cat.products].sort((a: any, b: any) => (a.position || 0) - (b.position || 0));

              for (const prod of sortedProducts) {
                // Determine price: divide by 1000 and round
                let rawPrice = prod.price || 0;
                if (rawPrice === 0 && prod.variants && prod.variants.length > 0) {
                  rawPrice = prod.variants[0].price || 0;
                }
                const formattedPrice = Math.round(rawPrice / 1000).toString();

                // Download Product Image
                let productImageUrl = null;
                const prodImagePath = prod.imageFiles?.[0]?.origin || prod.imageFiles?.[0]?.md || prod.images?.[0];
                if (prodImagePath) {
                  const remoteProdImageUrl = prodImagePath.startsWith('http') ? prodImagePath : `https://file.menno.pro/${prodImagePath}`;
                  const downloadedProdImage = await downloadAndSaveImage(remoteProdImageUrl);
                  if (downloadedProdImage) productImageUrl = downloadedProdImage;
                }

                // Map Subcategories and Variants as sections for premium detail view
                const sections: any[] = [];
                if (prod.subcategories && prod.subcategories.length > 0) {
                  sections.push({
                    title: 'دسته‌بندی‌های فرعی',
                    chips: prod.subcategories.filter(Boolean),
                  });
                }
                if (prod.variants && prod.variants.length > 0) {
                  sections.push({
                    title: 'انواع و قیمت‌ها',
                    chips: prod.variants.map((v: any) => `${v.title || 'ساده'}: ${Math.round((v.price || 0) / 1000)} هزار تومان`),
                  });
                }

                // Insert Product
                await db.insert(menuItemsTable).values({
                  categoryId: newCategory.id,
                  name: prod.title || 'بدون نام',
                  slug: prod.id || null,
                  price: formattedPrice,
                  image: productImageUrl,
                  description: prod.description || null,
                  span2: false,
                  sections: sections,
                  status: 'available',
                });
              }
            }
          }
        }
      }
    } else {
      return new Response(JSON.stringify({ success: false, message: 'حالت پر کردن نامعتبر است' }), { status: 400 });
    }

    // Link the current super-admin user to the created vendor
    await db.insert(vendorUsersTable).values({
      vendorId: createdVendorId,
      userId: session.userId,
    });

    return new Response(JSON.stringify({ success: true, message: 'مجموعه جدید با موفقیت ایجاد شد', vendorId: createdVendorId }), { status: 201 });
  } catch (error: any) {
    console.error('Vendor create error:', error);
    return new Response(JSON.stringify({ success: false, message: error.message || 'خطای سرور' }), { status: 500 });
  }
};

// DELETE: Delete a vendor
export const DELETE: APIRoute = async ({ request, cookies }) => {
  const session = getSession(cookies);
  if (!session || session.username !== 'super') {
    return new Response(JSON.stringify({ success: false, message: 'عدم دسترسی به پنل سازمانی' }), { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const idStr = url.searchParams.get('id');
    if (!idStr) {
      return new Response(JSON.stringify({ success: false, message: 'شناسه مجموعه الزامی است' }), { status: 400 });
    }

    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ success: false, message: 'شناسه نامعتبر است' }), { status: 400 });
    }

    // Delete vendor (cascades database deletions to categories, products, and vendorUsers)
    const result = await db.delete(vendorsTable).where(eq(vendorsTable.id, id)).returning();

    if (result.length === 0) {
      return new Response(JSON.stringify({ success: false, message: 'مجموعه یافت نشد' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, message: 'مجموعه با موفقیت حذف شد' }), { status: 200 });
  } catch (error: any) {
    console.error('Vendor delete error:', error);
    return new Response(JSON.stringify({ success: false, message: error.message || 'خطای سرور' }), { status: 500 });
  }
};
