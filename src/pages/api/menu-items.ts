import type { APIRoute } from 'astro';
import { db } from '../../db/db';
import { 
  menuItems as menuItemsTable, 
  categories as categoriesTable, 
  vendorUsers as vendorUsersTable 
} from '../../db/schema';
import { getSession } from '../../utils/auth';
import { eq, and } from 'drizzle-orm';

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
    const { categoryId, name, price, image, description, span2, discount, sections } = data;

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
    });

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
    const { id, categoryId, name, price, image, description, span2, discount, sections } = data;
    const itemId = parseInt(id);

    if (!itemId || !categoryId || !name || !price) {
      return new Response(JSON.stringify({ success: false, message: 'فیلدهای اجباری ناقص هستند' }), { status: 400 });
    }

    // Check access to existing item
    const item = await checkMenuItemAccess(session.userId, itemId);
    if (!item) {
      return new Response(JSON.stringify({ success: false, message: 'دسترسی غیرمجاز یا شناسه نامعتبر' }), { status: 403 });
    }

    // Check access to new category (in case they changed it)
    if (categoryId !== item.categoryId) {
      const hasNewAccess = await checkCategoryAccess(session.userId, categoryId);
      if (!hasNewAccess) {
        return new Response(JSON.stringify({ success: false, message: 'عدم دسترسی به دسته‌بندی جدید' }), { status: 403 });
      }
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
      })
      .where(eq(menuItemsTable.id, itemId));

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

    return new Response(JSON.stringify({ success: true, message: 'آیتم با موفقیت حذف شد' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: 'خطای سرور' }), { status: 500 });
  }
};
