import type { APIRoute } from 'astro';
import { db } from '../../db/db';
import { categories as categoriesTable, vendors as vendorsTable, vendorUsers as vendorUsersTable } from '../../db/schema';
import { getSession } from '../../utils/auth';
import { eq, and, asc, desc } from 'drizzle-orm';
import { purgeVendorCache } from '../../utils/purge';

// Helper to check user access to a vendor ID
async function checkVendorAccess(userId: number, vendorId: number): Promise<boolean> {
  const access = await db
    .select()
    .from(vendorUsersTable)
    .where(and(eq(vendorUsersTable.userId, userId), eq(vendorUsersTable.vendorId, vendorId)))
    .limit(1);
  return access.length > 0;
}

// Helper to check user access to a category ID and return the category
async function checkCategoryAccess(userId: number, categoryId: number) {
  const categoryList = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.id, categoryId))
    .limit(1);
  
  if (categoryList.length === 0) return null;
  const category = categoryList[0];
  
  const hasAccess = await checkVendorAccess(userId, category.vendorId);
  if (!hasAccess) return null;
  
  return category;
}

// Helper to get vendor slug by vendor ID
async function getVendorSlug(vendorId: number): Promise<string | null> {
  const vendor = await db.select({ slug: vendorsTable.slug }).from(vendorsTable).where(eq(vendorsTable.id, vendorId)).limit(1);
  return vendor.length > 0 ? vendor[0].slug : null;
}

// POST: Create category
export const POST: APIRoute = async ({ request, cookies }) => {
  const session = getSession(cookies);
  if (!session) {
    return new Response(JSON.stringify({ success: false, message: 'عدم احراز هویت' }), { status: 401 });
  }

  try {
    const { name, vendorSlug } = await request.json();
    if (!name || !vendorSlug) {
      return new Response(JSON.stringify({ success: false, message: 'فیلدهای اجباری ناقص هستند' }), { status: 400 });
    }

    const vendorList = await db
      .select()
      .from(vendorsTable)
      .where(eq(vendorsTable.slug, vendorSlug))
      .limit(1);

    if (vendorList.length === 0) {
      return new Response(JSON.stringify({ success: false, message: 'مجموعه یافت نشد' }), { status: 404 });
    }
    const vendor = vendorList[0];

    const hasAccess = await checkVendorAccess(session.userId, vendor.id);
    if (!hasAccess) {
      return new Response(JSON.stringify({ success: false, message: 'عدم دسترسی به این مجموعه' }), { status: 403 });
    }

    // Determine the next sort order
    const maxSortList = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.vendorId, vendor.id))
      .orderBy(desc(categoriesTable.sortOrder))
      .limit(1);

    const nextSortOrder = maxSortList.length > 0 ? maxSortList[0].sortOrder + 1 : 0;

    await db.insert(categoriesTable).values({
      vendorId: vendor.id,
      name: name,
      sortOrder: nextSortOrder
    });

    // Purge CDN cache
    purgeVendorCache(vendorSlug).catch(() => {});

    return new Response(JSON.stringify({ success: true, message: 'مجموعه با موفقیت ایجاد شد' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: 'خطای سرور' }), { status: 500 });
  }
};

// PATCH: Rename or Reorder category
export const PATCH: APIRoute = async ({ request, cookies }) => {
  const session = getSession(cookies);
  if (!session) {
    return new Response(JSON.stringify({ success: false, message: 'عدم احراز هویت' }), { status: 401 });
  }

  try {
    const { id, name, action, direction, status } = await request.json();
    const categoryId = parseInt(id);

    const category = await checkCategoryAccess(session.userId, categoryId);
    if (!category) {
      return new Response(JSON.stringify({ success: false, message: 'دسترسی غیرمجاز یا شناسه نامعتبر' }), { status: 403 });
    }

    if (action === 'update_status') {
      if (!status || (status !== 'available' && status !== 'unavailable' && status !== 'inactive')) {
        return new Response(JSON.stringify({ success: false, message: 'وضعیت نامعتبر' }), { status: 400 });
      }

      await db
        .update(categoriesTable)
        .set({ status })
        .where(eq(categoriesTable.id, categoryId));

      // Purge CDN cache
      const vendorSlug = await getVendorSlug(category.vendorId);
      if (vendorSlug) purgeVendorCache(vendorSlug).catch(() => {});

      return new Response(JSON.stringify({ success: true, message: 'وضعیت با موفقیت به‌روزرسانی شد' }), { status: 200 });
    }

    if (action === 'rename') {
      if (!name || !name.trim()) {
        return new Response(JSON.stringify({ success: false, message: 'نام نمی‌تواند خالی باشد' }), { status: 400 });
      }

      await db
        .update(categoriesTable)
        .set({ name: name.trim() })
        .where(eq(categoriesTable.id, categoryId));

      // Purge CDN cache
      const vendorSlug = await getVendorSlug(category.vendorId);
      if (vendorSlug) purgeVendorCache(vendorSlug).catch(() => {});

      return new Response(JSON.stringify({ success: true, message: 'نام مجموعه با موفقیت تغییر کرد' }), { status: 200 });
    } 
    
    if (action === 'reorder') {
      if (direction !== 'up' && direction !== 'down') {
        return new Response(JSON.stringify({ success: false, message: 'جهت نامعتبر' }), { status: 400 });
      }

      // Fetch all categories for this vendor, sorted by sortOrder
      const allCats = await db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.vendorId, category.vendorId))
        .orderBy(asc(categoriesTable.sortOrder));

      const currentIndex = allCats.findIndex(c => c.id === categoryId);
      if (currentIndex === -1) {
        return new Response(JSON.stringify({ success: false, message: 'مجموعه یافت نشد' }), { status: 404 });
      }

      let targetIndex = -1;
      if (direction === 'up' && currentIndex > 0) {
        targetIndex = currentIndex - 1;
      } else if (direction === 'down' && currentIndex < allCats.length - 1) {
        targetIndex = currentIndex + 1;
      }

      if (targetIndex !== -1) {
        const currentCategory = allCats[currentIndex];
        const targetCategory = allCats[targetIndex];

        // Swap their sortOrder values
        const tempOrder = currentCategory.sortOrder;
        
        await db
          .update(categoriesTable)
          .set({ sortOrder: targetCategory.sortOrder })
          .where(eq(categoriesTable.id, currentCategory.id));

        await db
          .update(categoriesTable)
          .set({ sortOrder: tempOrder })
          .where(eq(categoriesTable.id, targetCategory.id));

        return new Response(JSON.stringify({ success: true, message: 'ترتیب با موفقیت به‌روزرسانی شد' }), { status: 200 });
      }

      return new Response(JSON.stringify({ success: false, message: 'امکان جابجایی در این جهت وجود ندارد' }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: false, message: 'عملیات نامعتبر' }), { status: 400 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: 'خطای سرور' }), { status: 500 });
  }
};

// DELETE: Remove category
export const DELETE: APIRoute = async ({ request, cookies }) => {
  const session = getSession(cookies);
  if (!session) {
    return new Response(JSON.stringify({ success: false, message: 'عدم احراز هویت' }), { status: 401 });
  }

  try {
    const { id } = await request.json();
    const categoryId = parseInt(id);

    const category = await checkCategoryAccess(session.userId, categoryId);
    if (!category) {
      return new Response(JSON.stringify({ success: false, message: 'دسترسی غیرمجاز یا شناسه نامعتبر' }), { status: 403 });
    }

    await db
      .delete(categoriesTable)
      .where(eq(categoriesTable.id, categoryId));

    // Purge CDN cache
    const vendorSlug = await getVendorSlug(category.vendorId);
    if (vendorSlug) purgeVendorCache(vendorSlug).catch(() => {});

    return new Response(JSON.stringify({ success: true, message: 'مجموعه با موفقیت حذف شد' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: 'خطای سرور' }), { status: 500 });
  }
};
