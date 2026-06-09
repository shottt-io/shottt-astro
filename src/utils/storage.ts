import { promises as fs } from 'fs';
import path from 'path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { put } from '@vercel/blob';

export interface UploadOptions {
  buffer: Buffer;
  filename: string;
  folder?: string;
  contentType?: string;
}

/**
 * Gets the current storage provider based on environment variables.
 * Prioritizes STORAGE_PROVIDER, then auto-detects vercel-blob, then s3, then falls back to local.
 */
export function getStorageProvider(): 'vercel-blob' | 's3' | 'local' {
  const provider = process.env.STORAGE_PROVIDER || import.meta.env.STORAGE_PROVIDER;
  if (provider === 'vercel-blob' || provider === 's3' || provider === 'local') {
    return provider;
  }

  // Auto-detect Vercel Blob
  const hasVercelBlob = !!(process.env.BLOB_READ_WRITE_TOKEN || import.meta.env.BLOB_READ_WRITE_TOKEN);
  if (hasVercelBlob) {
    return 'vercel-blob';
  }

  // Auto-detect S3
  const s3Endpoint = process.env.S3_ENDPOINT || import.meta.env.S3_ENDPOINT;
  const s3AccessKeyId = process.env.S3_ACCESS_KEY_ID || import.meta.env.S3_ACCESS_KEY_ID;
  const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY || import.meta.env.S3_SECRET_ACCESS_KEY;
  const s3Bucket = process.env.S3_BUCKET || import.meta.env.S3_BUCKET;

  if (s3Endpoint && s3AccessKeyId && s3SecretAccessKey && s3Bucket) {
    return 's3';
  }

  return 'local';
}

/**
 * Uploads an image/file to the active storage provider.
 * 
 * @param options Upload options including the buffer, target filename, folder structure, and optional content-type.
 * @returns The public URL of the uploaded file.
 */
export async function uploadImage(options: UploadOptions): Promise<string> {
  const provider = getStorageProvider();
  const folder = options.folder || '';
  const contentType = options.contentType || 'image/webp';
  const objectKey = folder ? `${folder}/${options.filename}` : options.filename;

  if (provider === 'vercel-blob') {
    // Vercel Blob storage
    const blob = await put(objectKey, options.buffer, {
      access: 'public',
      contentType,
    });

    const customPublicUrl = process.env.BLOB_PUBLIC_URL || import.meta.env.BLOB_PUBLIC_URL;
    if (customPublicUrl) {
      let formattedUrl = customPublicUrl;
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }
      try {
        const parsedBlobUrl = new URL(blob.url);
        const parsedCustomUrl = new URL(formattedUrl);
        return `${parsedCustomUrl.origin}${parsedBlobUrl.pathname}`;
      } catch (e) {
        return blob.url;
      }
    }

    return blob.url;
  } else if (provider === 's3') {
    // S3 storage configuration
    const s3Endpoint = process.env.S3_ENDPOINT || import.meta.env.S3_ENDPOINT || '';
    const s3AccessKeyId = process.env.S3_ACCESS_KEY_ID || import.meta.env.S3_ACCESS_KEY_ID || '';
    const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY || import.meta.env.S3_SECRET_ACCESS_KEY || '';
    const s3Bucket = process.env.S3_BUCKET || import.meta.env.S3_BUCKET || '';
    const s3PublicUrl = process.env.S3_PUBLIC_URL || import.meta.env.S3_PUBLIC_URL;
    const s3Region = process.env.S3_REGION || import.meta.env.S3_REGION || 'us-east-1';

    let formattedEndpoint = s3Endpoint;
    if (!/^https?:\/\//i.test(formattedEndpoint)) {
      formattedEndpoint = `https://${formattedEndpoint}`;
    }

    let formattedPublicUrl = s3PublicUrl;
    if (formattedPublicUrl && !/^https?:\/\//i.test(formattedPublicUrl)) {
      formattedPublicUrl = `https://${formattedPublicUrl}`;
    }

    const s3Client = new S3Client({
      endpoint: formattedEndpoint,
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
        Key: objectKey,
        Body: options.buffer,
        ContentType: contentType,
        ACL: 'public-read',
      })
    );

    return formattedPublicUrl
      ? `${formattedPublicUrl.replace(/\/$/, '')}/${objectKey}`
      : `${formattedEndpoint.replace(/\/$/, '')}/${s3Bucket}/${objectKey}`;
  } else {
    // Local fallback
    const uploadsDir = folder
      ? path.join(process.cwd(), 'public', 'uploads', folder)
      : path.join(process.cwd(), 'public', 'uploads');
    
    await fs.mkdir(uploadsDir, { recursive: true });
    
    const filePath = path.join(uploadsDir, options.filename);
    await fs.writeFile(filePath, options.buffer);

    return folder ? `/uploads/${folder}/${options.filename}` : `/uploads/${options.filename}`;
  }
}
