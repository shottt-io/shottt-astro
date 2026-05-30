import type { APIRoute } from 'astro';
import { db } from '../../../db/db';
import { users as dbUsers } from '../../../db/schema';
import { hashPassword, signSession } from '../../../utils/auth';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ success: false, message: 'لطفاً نام کاربری و رمز عبور را وارد کنید.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Lookup user in DB
    const userList = await db
      .select()
      .from(dbUsers)
      .where(eq(dbUsers.username, username.trim().toLowerCase()))
      .limit(1);

    if (userList.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'نام کاربری یا رمز عبور اشتباه است.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = userList[0];
    const incomingHash = hashPassword(password);

    if (user.password !== incomingHash) {
      return new Response(
        JSON.stringify({ success: false, message: 'نام کاربری یا رمز عبور اشتباه است.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create secure signed session cookie
    const token = signSession({
      userId: user.id,
      username: user.username,
      name: user.name || user.username,
    });

    // Set cookie
    cookies.set('admin_session', token, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD, // secure in production
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return new Response(
      JSON.stringify({ success: true, message: 'ورود با موفقیت انجام شد.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Login API error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'خطای سرور رخ داده است.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
