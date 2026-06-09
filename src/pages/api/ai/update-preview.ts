import type { APIRoute } from 'astro';
import { previews } from '../../../utils/store';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { id, theme, layout } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'Missing preview ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const vendor = previews.get(id);
    if (!vendor) {
      return new Response(JSON.stringify({ success: false, error: 'Preview not found or expired' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update fields if provided
    if (theme === 'light' || theme === 'dark') {
      vendor.theme = theme;
    }
    if (layout === 'pinterest' || layout === 'simple' || layout === 'card') {
      vendor.defaultLayout = layout;
    }

    previews.set(id, vendor);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
