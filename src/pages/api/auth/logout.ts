import type { APIRoute } from 'astro';
import { useTranslations } from '../../../utils/i18n';

export const GET: APIRoute = async ({ cookies }) => {
  cookies.delete('admin_session', { path: '/' });
  return new Response(null, {
    status: 302,
    headers: { Location: '/admin/login' },
  });
};

export const POST: APIRoute = async ({ cookies, request }) => {
  const { t } = useTranslations(cookies, request);
  cookies.delete('admin_session', { path: '/' });
  return new Response(
    JSON.stringify({ success: true, message: t('logoutSuccess') }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
