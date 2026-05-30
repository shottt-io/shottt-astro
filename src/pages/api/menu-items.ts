import type { APIRoute } from 'astro';
import { db } from '../../db/db';
import { 
  menuItems as menuItemsTable, 
  categories as categoriesTable, 
  vendors as vendorsTable,
  vendorUsers as vendorUsersTable 
} from '../../db/schema';
import { getSession } from '../../utils/auth';
import { eq, and, asc, desc } from 'drizzle-orm';
import { purgeVendorCache } from '../../utils/purge';

// Helper to check user access to a category ID
async function checkCategoryAccess(userId: number, categoryId: number): Promise<boolean> {
  const categoryList = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.id, categoryId))
    .limit(1);

  if (categoryList.length === 0) return false;
  const category = categoryList[0];

  const access = await db
    .select()
    .from(vendorUsersTable)
    .where(and(eq(vendorUsersTable.userId, userId), eq(vendorUsersTable.vendorId, category.vendorId)))
    .limit(1);

  return access.length > 0;
}

// Helper to get vendor slug from a category ID
async function getVendorSlugByCategoryId(categoryId: number): Promise<string | null> {
  const result = await db
    .select({ slug: vendorsTable.slug })
    .from(categoriesTable)
    .innerJoin(vendorsTable, eq(categoriesTable.vendorId, vendorsTable.id))
    .where(eq(categoriesTable.id, categoryId))
    .limit(1);
  return result.length > 0 ? result[0].slug : null;
}

// Helper to check user access to a menu item ID and return the item
async function checkMenuItemAccess(userId: number, menuItemId: number) {
  const itemList = await db
    .select()
    .from(menuItemsTable)
    .where(eq(menuItemsTable.id, menuItemId))
    .limit(1);

  if (itemList.length === 0) return null;
  const item = itemList[0];

  const hasAccess = await checkCategoryAccess(userId, item.categoryId);
  if (!hasAccess) return null;

  return item;
}

// POST: Create menu item
export const POST: APIRoute = async ({ request, cookies }) => {
  const session = getSession(cookies);
  if (!session) {
    return new Response(JSON.stringify({ success: false, message: 'عدم احراز هویت' }), { status: 401 });
  }

  try {
    const data = await request.json();
    const { categoryId, name, price, image, description, span2, discount, sections, status } = data;

    if (!categoryId || !name || !price) {
      return new Response(JSON.stringify({ success: false, message: 'فیلدهای اجباری ناقص هستند' }), { status: 400 });
    }

    const hasAccess = await checkCategoryAccess(session.userId, categoryId);
    if (!hasAccess) {
      return new Response(JSON.stringify({ success: false, message: 'عدم دسترسی به این دسته‌بندی' }), { status: 403 });
    }

    // Auto-generate slug from name (English slug or simple fallback)
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-') // Support Persian and English chars
      .replace(/^-+|-+$/g, '');

    // Determine the next sort order in this category
    const maxSortList = await db
      .select()
      .from(menuItemsTable)
      .where(eq(menuItemsTable.categoryId, categoryId))
      .orderBy(desc(menuItemsTable.sortOrder))
      .limit(1);

    const nextSortOrder = maxSortList.length > 0 ? maxSortList[0].sortOrder + 1 : 0;

    await db.insert(menuItemsTable).values({
      categoryId: categoryId,
      name: name,
      slug: slug || undefined,
      price: price,
      image: image || null,
      description: description || null,
      span2: !!span2,
      discount: discount || null,
      sections: sections || [],
      status: status || 'available',
      sortOrder: nextSortOrder,
    });

    // Purge CDN cache
    const vendorSlug = await getVendorSlugByCategoryId(categoryId);
    if (vendorSlug) purgeVendorCache(vendorSlug).catch(() => {});

    return new Response(JSON.stringify({ success: true, message: 'آیتم با موفقیت ایجاد شد' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: 'خطای سرور' }), { status: 500 });
  }
};

// PATCH: Update menu item
export const PATCH: APIRoute = async ({ request, cookies }) => {
  const session = getSession(cookies);
  if (!session) {
    return new Response(JSON.stringify({ success: false, message: 'عدم احراز هویت' }), { status: 401 });
  }

  try {
    const data = await request.json();
    const { id, categoryId, name, price, image, description, span2, discount, sections, status, action, direction } = data;
    const itemId = parseInt(id);

    if (!itemId) {
      return new Response(JSON.stringify({ success: false, message: 'شناسه آیتم الزامی است' }), { status: 400 });
    }

    // Check access to existing item
    const item = await checkMenuItemAccess(session.userId, itemId);
    if (!item) {
      return new Response(JSON.stringify({ success: false, message: 'دسترسی غیرمجاز یا شناسه نامعتبر' }), { status: 403 });
    }

    if (action === 'reorder') {
      if (direction !== 'up' && direction !== 'down') {
        return new Response(JSON.stringify({ success: false, message: 'جهت نامعتبر' }), { status: 400 });
      }

      // Fetch all items in the same category, sorted by sortOrder
      let allItems = await db
        .select()
        .from(menuItemsTable)
        .where(eq(menuItemsTable.categoryId, item.categoryId))
        .orderBy(asc(menuItemsTable.sortOrder), asc(menuItemsTable.id));

      // Clean up / normalize sortOrder if they are duplicate or default to 0
      let needsCleanup = false;
      const seenOrders = new Set<number>();
      for (const it of allItems) {
        if (seenOrders.has(it.sortOrder)) {
          needsCleanup = true;
          break;
        }
        seenOrders.add(it.sortOrder);
      }

      if (needsCleanup) {
        for (let idx = 0; idx < allItems.length; idx++) {
          await db
            .update(menuItemsTable)
            .set({ sortOrder: idx })
            .where(eq(menuItemsTable.id, allItems[idx].id));
          allItems[idx].sortOrder = idx;
        }
      }

      const currentIndex = allItems.findIndex(i => i.id === itemId);
      if (currentIndex === -1) {
        return new Response(JSON.stringify({ success: false, message: 'آیتم یافت نشد' }), { status: 404 });
      }

      let targetIndex = -1;
      if (direction === 'up' && currentIndex > 0) {
        targetIndex = currentIndex - 1;
      } else if (direction === 'down' && currentIndex < allItems.length - 1) {
        targetIndex = currentIndex + 1;
      }

      if (targetIndex !== -1) {
        const currentItem = allItems[currentIndex];
        const targetItem = allItems[targetIndex];

        // Swap sortOrder
        const tempOrder = currentItem.sortOrder;

        await db
          .update(menuItemsTable)
          .set({ sortOrder: targetItem.sortOrder })
          .where(eq(menuItemsTable.id, currentItem.id));

        await db
          .update(menuItemsTable)
          .set({ sortOrder: tempOrder })
          .where(eq(menuItemsTable.id, targetItem.id));

        return new Response(JSON.stringify({ success: true, message: 'ترتیب با موفقیت به‌روزرسانی شد' }), { status: 200 });
      }

      return new Response(JSON.stringify({ success: false, message: 'امکان جابجایی در این جهت وجود ندارد' }), { status: 400 });
    }

    // Default UPDATE behavior
    if (!categoryId || !name || !price) {
      return new Response(JSON.stringify({ success: false, message: 'فیلدهای اجباری ناقص هستند' }), { status: 400 });
    }

    // Check access to new category (in case they changed it)
    let updatedSortOrder = undefined;
    if (categoryId !== item.categoryId) {
      const hasNewAccess = await checkCategoryAccess(session.userId, categoryId);
      if (!hasNewAccess) {
        return new Response(JSON.stringify({ success: false, message: 'عدم دسترسی به دسته‌بندی جدید' }), { status: 403 });
      }

      // Determine the next sort order in the new category
      const maxSortList = await db
        .select()
        .from(menuItemsTable)
        .where(eq(menuItemsTable.categoryId, categoryId))
        .orderBy(desc(menuItemsTable.sortOrder))
        .limit(1);
      updatedSortOrder = maxSortList.length > 0 ? maxSortList[0].sortOrder + 1 : 0;
    }

    // Auto-generate slug from name if needed
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/^-+|-+$/g, '');

    await db
      .update(menuItemsTable)
      .set({
        categoryId: categoryId,
        name: name,
        slug: slug || undefined,
        price: price,
        image: image || null,
        description: description || null,
        span2: !!span2,
        discount: discount || null,
        sections: sections || [],
        status: status || 'available',
        ...(updatedSortOrder !== undefined ? { sortOrder: updatedSortOrder } : {}),
      })
      .where(eq(menuItemsTable.id, itemId));

    // Purge CDN cache
    const vendorSlug = await getVendorSlugByCategoryId(categoryId);
    if (vendorSlug) purgeVendorCache(vendorSlug).catch(() => {});

    return new Response(JSON.stringify({ success: true, message: 'آیتم با موفقیت به‌روزرسانی شد' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: 'خطای سرور' }), { status: 500 });
  }
};

// DELETE: Delete menu item
export const DELETE: APIRoute = async ({ request, cookies }) => {
  const session = getSession(cookies);
  if (!session) {
    return new Response(JSON.stringify({ success: false, message: 'عدم احراز هویت' }), { status: 401 });
  }

  try {
    const { id } = await request.json();
    const itemId = parseInt(id);

    const item = await checkMenuItemAccess(session.userId, itemId);
    if (!item) {
      return new Response(JSON.stringify({ success: false, message: 'دسترسی غیرمجاز یا شناسه نامعتبر' }), { status: 403 });
    }

    await db
      .delete(menuItemsTable)
      .where(eq(menuItemsTable.id, itemId));

    // Purge CDN cache
    const vendorSlug = await getVendorSlugByCategoryId(item.categoryId);
    if (vendorSlug) purgeVendorCache(vendorSlug).catch(() => {});

    return new Response(JSON.stringify({ success: true, message: 'آیتم با موفقیت حذف شد' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: 'خطای سرور' }), { status: 500 });
  }
};
