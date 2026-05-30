import type { APIRoute } from 'astro';
import { promises as fs } from 'fs';
import path from 'path';

export const GET: APIRoute = async ({ params }) => {
  const { filename } = params;
  if (!filename) {
    return new Response('Not Found', { status: 404 });
  }

  // Resolve file path from the local uploads folder
  const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

  try {
    const fileBuffer = await fs.readFile(filePath);
    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    return new Response('File Not Found', { status: 404 });
  }
};
