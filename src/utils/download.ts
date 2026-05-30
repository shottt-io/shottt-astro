import { promises as fs } from 'fs';
import path from 'path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

/**
 * Downloads an image from the given URL and saves it to local public/uploads directory or S3 storage.
 * @param imageUrl The URL of the image to download
 * @returns The local path (/uploads/...) or S3 public URL of the saved image, or null if failed
 */
export async function downloadAndSaveImage(imageUrl: string): Promise<string | null> {
  if (!imageUrl) return null;

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Failed to download image from ${imageUrl}: ${response.statusText}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique name as WebP
    const filename = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;

    // S3 configuration check (mirroring src/pages/api/upload.ts)
    const s3Endpoint = process.env.S3_ENDPOINT || import.meta.env.S3_ENDPOINT;
    const s3AccessKeyId = process.env.S3_ACCESS_KEY_ID || import.meta.env.S3_ACCESS_KEY_ID;
    const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY || import.meta.env.S3_SECRET_ACCESS_KEY;
    const s3Bucket = process.env.S3_BUCKET || import.meta.env.S3_BUCKET;
    const s3PublicUrl = process.env.S3_PUBLIC_URL || import.meta.env.S3_PUBLIC_URL;
    const s3Region = process.env.S3_REGION || import.meta.env.S3_REGION || 'us-east-1';

    if (s3Endpoint && s3AccessKeyId && s3SecretAccessKey && s3Bucket) {
      const s3Client = new S3Client({
        endpoint: s3Endpoint,
        region: s3Region,
        credentials: {
          accessKeyId: s3AccessKeyId,
          secretAccessKey: s3SecretAccessKey,
        },
        forcePathStyle: true,
      });

      await s3Client.send(
        new PutObjectCommand({
          Bucket: s3Bucket,
          Key: filename,
          Body: buffer,
          ContentType: 'image/webp',
          ACL: 'public-read',
        })
      );

      const publicUrl = s3PublicUrl
        ? `${s3PublicUrl.replace(/\/$/, '')}/${filename}`
        : `${s3Endpoint.replace(/\/$/, '')}/${s3Bucket}/${filename}`;

      return publicUrl;
    } else {
      // Local fallback
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, filename);
      await fs.writeFile(filePath, buffer);

      return `/uploads/${filename}`;
    }
  } catch (error) {
    console.error(`Error saving downloaded image from ${imageUrl}:`, error);
    return null;
  }
}
