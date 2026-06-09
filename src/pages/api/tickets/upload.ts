import type { APIRoute } from 'astro';
import { getSession } from '../../../utils/auth';
import { useTranslations } from '../../../utils/i18n';
import { uploadImage } from '../../../utils/storage';

export const POST: APIRoute = async ({ request, cookies }) => {
  const { t } = useTranslations(cookies, request);
  // Authenticate user before allowing upload
  const session = getSession(cookies);
  if (!session) {
    return new Response(JSON.stringify({ success: false, message: t('unauthorized') }), { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return new Response(JSON.stringify({ success: false, message: t('fileNotFound') }), { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique name as WebP
    const filename = `ticket-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;
    
    const publicUrl = await uploadImage({
      buffer,
      filename,
      folder: 'tickets',
      contentType: 'image/webp',
    });

    return new Response(JSON.stringify({ success: true, url: publicUrl }), { status: 200 });
  } catch (error: any) {
    console.error('Ticket upload error:', error);
    return new Response(JSON.stringify({ success: false, message: error.message || t('uploadErrorApi') }), { status: 500 });
  }
};
