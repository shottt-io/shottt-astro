import type { APIRoute } from 'astro';
import { previews } from '../../../utils/store';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ success: false, error: 'Missing preview ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const preview = await previews.get(id);
  if (!preview) {
    return new Response(JSON.stringify({ success: false, error: 'Preview not found or expired' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Map preview items to include their current gridIndex mappings
  const items = preview.categories.flatMap(cat => 
    cat.items.map(item => ({
      id: item.id,
      name: item.name,
      image: item.image || null,
      gridIndex: item.gridIndex !== undefined ? item.gridIndex : null
    }))
  );

  return new Response(JSON.stringify({
    success: true,
    ready: !!preview.gridImage,
    gridImage: preview.gridImage || null,
    gridSize: preview.gridSize || 6,
    items
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
