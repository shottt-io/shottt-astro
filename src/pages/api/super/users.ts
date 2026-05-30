import type { APIRoute } from 'astro';
import { db } from '../../../db/db';
import { 
  users as usersTable, 
  vendorUsers as vendorUsersTable 
} from '../../../db/schema';
import { getSession, hashPassword } from '../../../utils/auth';
import { eq, and, ne } from 'drizzle-orm';

// GET: List all users with their linked vendor IDs
export const GET: APIRoute = async ({ cookies }) => {
  const session = getSession(cookies);
  if (!session || session.username !== 'super') {
    return new Response(JSON.stringify({ success: false, message: 'عدم دسترسی به پنل سازمانی' }), { status: 403 });
  }

  try {
    const allUsers = await db.select().from(usersTable).orderBy(usersTable.id);
    const usersWithVendors = await Promise.all(
      allUsers.map(async (user) => {
        const links = await db
          .select({ vendorId: vendorUsersTable.vendorId })
          .from(vendorUsersTable)
          .where(eq(vendorUsersTable.userId, user.id));

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          vendorIds: links.map((l) => l.vendorId),
        };
      })
    );

    return new Response(JSON.stringify({ success: true, users: usersWithVendors }), { status: 200 });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: error.message || 'خطای سرور' }), { status: 500 });
  }
};

// POST: Create a new user
export const POST: APIRoute = async ({ request, cookies }) => {
  const session = getSession(cookies);
  if (!session || session.username !== 'super') {
    return new Response(JSON.stringify({ success: false, message: 'عدم دسترسی به پنل سازمانی' }), { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, username, password, vendorIds } = body;

    if (!name || !username || !password) {
      return new Response(JSON.stringify({ success: false, message: 'پر کردن فیلدهای ستاره‌دار الزامی است' }), { status: 400 });
    }

    // Check if username is taken
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      return new Response(JSON.stringify({ success: false, message: 'نام کاربری قبلاً انتخاب شده است' }), { status: 400 });
    }

    // Hash password and insert user
    const hashedPassword = hashPassword(password);
    const [newUser] = await db.insert(usersTable).values({
      name,
      username: username.toLowerCase().trim(),
      password: hashedPassword,
    }).returning({ id: usersTable.id });

    // Link user to selected vendors
    if (vendorIds && Array.isArray(vendorIds)) {
      for (const vendorId of vendorIds) {
        await db.insert(vendorUsersTable).values({
          userId: newUser.id,
          vendorId: vendorId,
        });
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'کاربر جدید با موفقیت ایجاد شد' }), { status: 201 });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: error.message || 'خطای سرور' }), { status: 500 });
  }
};

// PATCH: Update user details
export const PATCH: APIRoute = async ({ request, cookies }) => {
  const session = getSession(cookies);
  if (!session || session.username !== 'super') {
    return new Response(JSON.stringify({ success: false, message: 'عدم دسترسی به پنل سازمانی' }), { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, name, username, password, vendorIds } = body;

    if (!id || !name || !username) {
      return new Response(JSON.stringify({ success: false, message: 'شناسه، نام و نام کاربری الزامی هستند' }), { status: 400 });
    }

    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return new Response(JSON.stringify({ success: false, message: 'شناسه نامعتبر است' }), { status: 400 });
    }

    // Verify username is not taken by another user
    const existing = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.username, username.toLowerCase().trim()), ne(usersTable.id, userId)))
      .limit(1);

    if (existing.length > 0) {
      return new Response(JSON.stringify({ success: false, message: 'نام کاربری قبلاً انتخاب شده است' }), { status: 400 });
    }

    // Prepare fields to update
    const updateFields: any = {
      name,
      username: username.toLowerCase().trim(),
    };

    if (password && password.trim().length > 0) {
      updateFields.password = hashPassword(password);
    }

    // Update user profile
    await db.update(usersTable).set(updateFields).where(eq(usersTable.id, userId));

    // Update vendor permissions (delete old links, write new links)
    await db.delete(vendorUsersTable).where(eq(vendorUsersTable.userId, userId));

    if (vendorIds && Array.isArray(vendorIds)) {
      for (const vendorId of vendorIds) {
        await db.insert(vendorUsersTable).values({
          userId: userId,
          vendorId: vendorId,
        });
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'اطلاعات کاربر با موفقیت به‌روزرسانی شد' }), { status: 200 });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: error.message || 'خطای سرور' }), { status: 500 });
  }
};

// DELETE: Delete a user
export const DELETE: APIRoute = async ({ request, cookies }) => {
  const session = getSession(cookies);
  if (!session || session.username !== 'super') {
    return new Response(JSON.stringify({ success: false, message: 'عدم دسترسی به پنل سازمانی' }), { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const idStr = url.searchParams.get('id');
    if (!idStr) {
      return new Response(JSON.stringify({ success: false, message: 'شناسه کاربر الزامی است' }), { status: 400 });
    }

    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ success: false, message: 'شناسه نامعتبر است' }), { status: 400 });
    }

    // Prevent deleting oneself
    if (id === session.userId) {
      return new Response(JSON.stringify({ success: false, message: 'شما نمی‌توانید حساب کاربری خودتان را حذف کنید' }), { status: 400 });
    }

    // Perform deletion
    const result = await db.delete(usersTable).where(eq(usersTable.id, id)).returning();

    if (result.length === 0) {
      return new Response(JSON.stringify({ success: false, message: 'کاربر یافت نشد' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, message: 'کاربر با موفقیت حذف شد' }), { status: 200 });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: error.message || 'خطای سرور' }), { status: 500 });
  }
};
