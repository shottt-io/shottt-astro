import { uploadImage } from './storage';

/**
 * Downloads an image from the given URL and saves it to local public/uploads directory or S3 storage.
 * @param imageUrl The URL of the image to download
 * @returns The local path (/uploads/...) or S3 public URL of the saved image, or null if failed
 */
export async function downloadAndSaveImage(imageUrl: string, vendorSlug?: string): Promise<string | null> {
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

    const publicUrl = await uploadImage({
      buffer,
      filename,
      folder: vendorSlug || undefined,
      contentType: 'image/webp',
    });

    return publicUrl;
  } catch (error) {
    console.error(`Error saving downloaded image from ${imageUrl}:`, error);
    return null;
  }
}
