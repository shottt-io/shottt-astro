import type { APIRoute } from 'astro';
import { promises as fs } from 'fs';
import path from 'path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSession } from '../../../utils/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  // Authenticate user before allowing upload
  const session = getSession(cookies);
  if (!session) {
    return new Response(JSON.stringify({ success: false, message: 'عدم احراز هویت' }), { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return new Response(JSON.stringify({ success: false, message: 'فایلی یافت نشد' }), { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique name as WebP
    const filename = `ticket-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;
    
    // Save tickets under a separate folder: 'tickets'
    const objectKey = `tickets/${filename}`;

    // S3 configuration check
    const s3Endpoint = process.env.S3_ENDPOINT || import.meta.env.S3_ENDPOINT;
    const s3AccessKeyId = process.env.S3_ACCESS_KEY_ID || import.meta.env.S3_ACCESS_KEY_ID;
    const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY || import.meta.env.S3_SECRET_ACCESS_KEY;
    const s3Bucket = process.env.S3_BUCKET || import.meta.env.S3_BUCKET;
    const s3PublicUrl = process.env.S3_PUBLIC_URL || import.meta.env.S3_PUBLIC_URL;
    const s3Region = process.env.S3_REGION || import.meta.env.S3_REGION || 'us-east-1';

    if (s3Endpoint && s3AccessKeyId && s3SecretAccessKey && s3Bucket) {
      let formattedEndpoint = s3Endpoint;
      if (!/^https?:\/\//i.test(formattedEndpoint)) {
        formattedEndpoint = `https://${formattedEndpoint}`;
      }

      let formattedPublicUrl = s3PublicUrl;
      if (formattedPublicUrl && !/^https?:\/\//i.test(formattedPublicUrl)) {
        formattedPublicUrl = `https://${formattedPublicUrl}`;
      }

      // S3 Client configuration
      const s3Client = new S3Client({
        endpoint: formattedEndpoint,
        region: s3Region,
        credentials: {
          accessKeyId: s3AccessKeyId,
          secretAccessKey: s3SecretAccessKey,
        },
        forcePathStyle: true,
      });

      // Upload object to S3
      await s3Client.send(
        new PutObjectCommand({
          Bucket: s3Bucket,
          Key: objectKey,
          Body: buffer,
          ContentType: 'image/webp',
          ACL: 'public-read',
        })
      );

      // Construct public URL
      const publicUrl = formattedPublicUrl
        ? `${formattedPublicUrl.replace(/\/$/, '')}/${objectKey}`
        : `${formattedEndpoint.replace(/\/$/, '')}/${s3Bucket}/${objectKey}`;

      return new Response(JSON.stringify({ success: true, url: publicUrl }), { status: 200 });
    } else {
      // Local fallback
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'tickets');
      await fs.mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, filename);
      await fs.writeFile(filePath, buffer);

      const publicUrl = `/uploads/tickets/${filename}`;
      return new Response(JSON.stringify({ success: true, url: publicUrl }), { status: 200 });
    }
  } catch (error: any) {
    console.error('Ticket upload error:', error);
    return new Response(JSON.stringify({ success: false, message: error.message || 'خطا در آپلود فایل' }), { status: 500 });
  }
};
