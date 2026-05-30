import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ cookies }) => {
  cookies.delete('admin_session', { path: '/' });
  return new Response(null, {
    status: 302,
    headers: { Location: '/admin/login' },
  });
};

export const POST: APIRoute = async ({ cookies }) => {
  cookies.delete('admin_session', { path: '/' });
  return new Response(
    JSON.stringify({ success: true, message: 'خروج با موفقیت انجام شد.' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
