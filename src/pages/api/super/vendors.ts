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
import { purgeHomepageCache } from '../../../utils/purge';
import { useTranslations } from '../../../utils/i18n';

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
export const GET: APIRoute = async ({ cookies, request }) => {
  const { t } = useTranslations(cookies, request);
  const session = getSession(cookies);
  if (!session || session.username !== 'super') {
    return new Response(JSON.stringify({ success: false, message: t('noAccessSuper') }), { status: 403 });
  }

  try {
    const list = await db.select().from(vendorsTable).orderBy(vendorsTable.name);
    return new Response(JSON.stringify({ success: true, vendors: list }), { status: 200 });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: error.message || t('serverError') }), { status: 500 });
  }
};

// POST: Create a new vendor
export const POST: APIRoute = async ({ request, cookies }) => {
  const { t } = useTranslations(cookies, request);
  const session = getSession(cookies);
  if (!session || session.username !== 'super') {
    return new Response(JSON.stringify({ success: false, message: t('noAccessSuper') }), { status: 403 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = (status: string, message: string, progress: number = 0) => {
        controller.enqueue(
          encoder.encode(JSON.stringify({ status, message, progress }) + '\n')
        );
      };

      try {
        const body = await request.json();
        const { name, slug, type, mode, packageType, mennoVendor, city } = body;

        if (!name || !slug || !type || !mode) {
          sendUpdate('error', t('cityInputRequired'));
          controller.close();
          return;
        }

        // Check if slug already exists
        const existing = await db
          .select()
          .from(vendorsTable)
          .where(eq(vendorsTable.slug, slug))
          .limit(1);

        if (existing.length > 0) {
          sendUpdate('error', t('slugTaken'));
          controller.close();
          return;
        }

        let createdVendorId: number;

        if (mode === 'empty') {
          sendUpdate('progress', t('progressCreatingEmptyVendor'), 20);
          await db.transaction(async (tx) => {
            const [newVendor] = await tx.insert(vendorsTable).values({
              slug,
              name,
              type,
              slogan: 'کاتالوگ دیجیتال ما',
              description: 'به کاتالوگ دیجیتال ما خوش آمدید.',
              defaultLayout: 'pinterest',
              logoIcon: getLogoIconFromType(type),
              logo: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=1200&auto=format&fit=crop',
              city: city || null,
            }).returning({ id: vendorsTable.id });
            
            createdVendorId = newVendor.id;
            sendUpdate('progress', t('progressCreatingUserAccess'), 70);

            await tx.insert(vendorUsersTable).values({
              vendorId: createdVendorId,
              userId: session.userId,
            });
          });
          sendUpdate('progress', t('progressPurgingCache'), 90);
        } else if (mode === 'package') {
          sendUpdate('progress', t('progressPreparingDefaultPackage'), 10);
          const targetMockSlug = packageType === 'cafe' ? 'cafe-lumiere' : packageType === 'restaurant' ? 'bistro-dada' : 'pastry-atelier';
          const mockVendor = mockVendors.find(v => v.slug === targetMockSlug);
          
          if (!mockVendor) {
            sendUpdate('error', t('errorPackageNotFound'));
            controller.close();
            return;
          }

          sendUpdate('progress', t('progressCreatingNewVendor'), 30);
          await db.transaction(async (tx) => {
            const [newVendor] = await tx.insert(vendorsTable).values({
              slug,
              name,
              type,
              slogan: mockVendor.slogan,
              description: mockVendor.description,
              defaultLayout: mockVendor.defaultLayout,
              logoIcon: getLogoIconFromType(type),
              logo: mockVendor.logo,
              city: city || null,
            }).returning({ id: vendorsTable.id });

            createdVendorId = newVendor.id;
            sendUpdate('progress', t('progressImportingPackage'), 50);

            let sortOrder = 0;
            for (const category of mockVendor.categories) {
              const [newCategory] = await tx.insert(categoriesTable).values({
                vendorId: createdVendorId,
                name: category.name,
                sortOrder: sortOrder++,
                status: 'available',
              }).returning({ id: categoriesTable.id });

              let itemSortOrder = 0;
              for (const item of category.items) {
                await tx.insert(menuItemsTable).values({
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
                  sortOrder: itemSortOrder++,
                });
              }
            }

            sendUpdate('progress', t('progressCreatingUserAccess'), 80);
            await tx.insert(vendorUsersTable).values({
              vendorId: createdVendorId,
              userId: session.userId,
            });
          });
          sendUpdate('progress', t('progressPurgingCache'), 90);
        } else if (mode === 'menno') {
          if (!mennoVendor) {
            sendUpdate('error', t('errorMennoIdRequired'));
            controller.close();
            return;
          }

          sendUpdate('progress', t('progressFetchingMennoInfo'), 10);
          const shopRes = await fetch(`https://api.menno.pro/shops/${mennoVendor}`);
          if (!shopRes.ok) {
            sendUpdate('error', t('errorMennoFetchFailed').replace('{status}', shopRes.statusText));
            controller.close();
            return;
          }
          const shopData = await shopRes.json();

          sendUpdate('progress', t('progressFetchingMennoMenu'), 20);
          const menuRes = await fetch(`https://api.menno.pro/menus/${mennoVendor}`);
          let menuCategories: any[] = [];
          if (menuRes.ok) {
            const menuData = await menuRes.json();
            if (menuData.categories && Array.isArray(menuData.categories)) {
              menuCategories = menuData.categories;
            }
          }

          // Pre-download all images concurrently in batches outside the DB transaction
          const preparedCategories = [];
          const sortedCategories = [...menuCategories].sort((a: any, b: any) => (a.position || 0) - (b.position || 0));

          const downloadTasks: {
            imageUrl: string;
            callback: (url: string | null) => void;
          }[] = [];

          // Download Shop Logo Task
          let logoUrl = 'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=1200&auto=format&fit=crop';
          const logoPath = shopData.logoImage?.origin || shopData.logoImage?.md || shopData.logo;
          if (logoPath) {
            const remoteLogoUrl = logoPath.startsWith('http') ? logoPath : `https://file.menno.pro/${logoPath}`;
            downloadTasks.push({
              imageUrl: remoteLogoUrl,
              callback: (url) => { if (url) logoUrl = url; }
            });
          }

          for (const cat of sortedCategories) {
            const preparedProducts: any[] = [];
            if (cat.products && Array.isArray(cat.products)) {
              const sortedProducts = [...cat.products].sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
              
              for (const prod of sortedProducts) {
                // Map Subcategories
                const sections: any[] = [];
                if (prod.subcategories && prod.subcategories.length > 0) {
                  sections.push({
                    title: 'دسته‌بندی‌های فرعی',
                    chips: prod.subcategories.filter(Boolean),
                  });
                }

                const preparedProd = {
                  title: prod.title || 'بدون نام',
                  id: prod.id || null,
                  price: prod.price,
                  image: null as string | null,
                  description: prod.description || null,
                  sections: sections,
                  variants: prod.variants || null,
                };

                preparedProducts.push(preparedProd);

                const prodImagePath = prod.imageFiles?.[0]?.origin || prod.imageFiles?.[0]?.md || prod.images?.[0];
                if (prodImagePath) {
                  const remoteProdImageUrl = prodImagePath.startsWith('http') ? prodImagePath : `https://file.menno.pro/${prodImagePath}`;
                  downloadTasks.push({
                    imageUrl: remoteProdImageUrl,
                    callback: (url) => { preparedProd.image = url; }
                  });
                }
              }
            }

            preparedCategories.push({
              title: cat.title || 'بدون نام',
              products: preparedProducts,
            });
          }

          // Execute S3/Local image downloads concurrently in batches of 10
          const totalTasks = downloadTasks.length;
          let completedTasks = 0;
          const CONCURRENCY_LIMIT = 10;
          
          sendUpdate('progress', t('progressDownloadingImages').replace('{completed}', '0').replace('{total}', String(totalTasks)), 30);

          for (let i = 0; i < downloadTasks.length; i += CONCURRENCY_LIMIT) {
            const batch = downloadTasks.slice(i, i + CONCURRENCY_LIMIT);
            await Promise.all(batch.map(async (task) => {
              try {
                const downloadedUrl = await downloadAndSaveImage(task.imageUrl, slug);
                task.callback(downloadedUrl);
              } catch (err) {
                console.error(`Failed to download image ${task.imageUrl}:`, err);
              } finally {
                completedTasks++;
                // Progress moves from 30% to 80% based on download completion
                const percent = Math.min(80, Math.round(30 + (completedTasks / totalTasks) * 50));
                sendUpdate('progress', t('progressDownloadingImages').replace('{completed}', String(completedTasks)).replace('{total}', String(totalTasks)), percent);
              }
            }));
          }

          sendUpdate('progress', t('progressSavingDatabase'), 85);

          // Execute all database writes in a single transaction
          await db.transaction(async (tx) => {
            // Insert Vendor
            const [newVendor] = await tx.insert(vendorsTable).values({
              slug,
              name,
              type,
              slogan: shopData.description || 'کاتالوگ دیجیتال ما',
              description: shopData.seo?.description || shopData.description || 'به کاتالوگ دیجیتال ما خوش آمدید.',
              defaultLayout: 'pinterest',
              logoIcon: getLogoIconFromType(type),
              logo: logoUrl,
              city: city || null,
            }).returning({ id: vendorsTable.id });

            createdVendorId = newVendor.id;

            let catSort = 0;
            for (const preparedCat of preparedCategories) {
              // Insert Category
              const [newCategory] = await tx.insert(categoriesTable).values({
                vendorId: createdVendorId,
                name: preparedCat.title,
                sortOrder: catSort++,
                status: 'available',
              }).returning({ id: categoriesTable.id });

              let itemSortOrder = 0;
              for (const prod of preparedCat.products) {
                if (prod.variants && Array.isArray(prod.variants) && prod.variants.length > 0) {
                  // If the base product has a price, insert it as a separate menu item
                  if (prod.price && prod.price > 0) {
                    const formattedPrice = Math.round(prod.price / 1000).toString();
                    await tx.insert(menuItemsTable).values({
                      categoryId: newCategory.id,
                      name: prod.title,
                      slug: prod.id,
                      price: formattedPrice,
                      image: prod.image,
                      description: prod.description,
                      span2: false,
                      sections: prod.sections,
                      status: 'available',
                      sortOrder: itemSortOrder++,
                    });
                  }

                  // If product has variants, insert each one
                  for (const v of prod.variants) {
                    const isRedundantVariant = 
                      (v.title === 'ساده' || !v.title || v.title.trim() === '') && 
                      prod.price && 
                      v.price === prod.price;

                    if (isRedundantVariant) continue;

                    const variantName = `${prod.title} (${v.title || 'ساده'})`;
                    const variantPrice = Math.round((v.price || 0) / 1000).toString();
                    const variantSlug = prod.id ? `${prod.id}-${v.id}` : null;

                    await tx.insert(menuItemsTable).values({
                      categoryId: newCategory.id,
                      name: variantName,
                      slug: variantSlug,
                      price: variantPrice,
                      image: prod.image,
                      description: prod.description,
                      span2: false,
                      sections: prod.sections,
                      status: 'available',
                      sortOrder: itemSortOrder++,
                    });
                  }
                } else {
                  // Standard product insert without variants
                  const formattedPrice = Math.round((prod.price || 0) / 1000).toString();
                  await tx.insert(menuItemsTable).values({
                    categoryId: newCategory.id,
                    name: prod.title,
                    slug: prod.id,
                    price: formattedPrice,
                    image: prod.image,
                    description: prod.description,
                    span2: false,
                    sections: prod.sections,
                    status: 'available',
                    sortOrder: itemSortOrder++,
                  });
                }
              }
            }

            // Link the current super-admin user to the created vendor
            await tx.insert(vendorUsersTable).values({
              vendorId: createdVendorId,
              userId: session.userId,
            });
          });
          
          sendUpdate('progress', t('progressPurgingCache'), 95);
        } else {
          sendUpdate('error', t('errorInvalidFillMode'));
          controller.close();
          return;
        }

        // Purge the homepage cache from ArvanCloud so the new collection shows up on the homepage
        purgeHomepageCache().catch(() => {});

        sendUpdate('success', t('vendorCreatedSuccess'), 100);
        controller.close();
      } catch (error: any) {
        console.error('Vendor create error:', error);
        sendUpdate('error', error.message || t('serverError'));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
};

// DELETE: Delete a vendor
export const DELETE: APIRoute = async ({ request, cookies }) => {
  const { t } = useTranslations(cookies, request);
  const session = getSession(cookies);
  if (!session || session.username !== 'super') {
    return new Response(JSON.stringify({ success: false, message: t('noAccessSuper') }), { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const idStr = url.searchParams.get('id');
    if (!idStr) {
      return new Response(JSON.stringify({ success: false, message: t('requiredFieldsMissing') }), { status: 400 });
    }

    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ success: false, message: t('invalidId') }), { status: 400 });
    }

    // Delete vendor (cascades database deletions to categories, products, and vendorUsers)
    const result = await db.delete(vendorsTable).where(eq(vendorsTable.id, id)).returning();

    if (result.length === 0) {
      return new Response(JSON.stringify({ success: false, message: t('vendorNotFound') }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, message: t('vendorDeletedSuccess') }), { status: 200 });
  } catch (error: any) {
    console.error('Vendor delete error:', error);
    return new Response(JSON.stringify({ success: false, message: error.message || t('serverError') }), { status: 500 });
  }
};
