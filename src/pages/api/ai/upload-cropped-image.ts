import type { APIRoute } from "astro";
import { previews } from "../../../utils/store";
import { uploadImage } from "../../../utils/storage";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { previewId, itemId, dataUrl } = await request.json();

    if (!previewId || !itemId || !dataUrl) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing previewId, itemId, or dataUrl",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const preview = await previews.get(previewId);
    if (!preview) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Preview not found or expired",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const isLogo = itemId === "logo";
    let targetItem: any = null;

    if (!isLogo) {
      // Find the item within preview categories
      for (const cat of preview.categories) {
        const match = cat.items.find((item) => item.id === itemId);
        if (match) {
          targetItem = match;
          break;
        }
      }

      if (!targetItem) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Item not found in preview session",
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }

    // Extract base64 image content
    const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid data URL format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Generate clean unique filename
    const filename = isLogo
      ? `logo-${previewId}-${Date.now()}.webp`
      : `crop-${itemId}-${Date.now()}.webp`;

    // Upload to active storage provider (local, s3, or vercel-blob)
    const publicUrl = await uploadImage({
      buffer,
      filename,
      contentType: "image/webp",
    });

    if (isLogo) {
      preview.logo = publicUrl;
    } else {
      targetItem.image = publicUrl;
    }

    // Save updated preview back to store
    await previews.set(previewId, preview);

    return new Response(JSON.stringify({ success: true, url: publicUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Failed to upload cropped item image:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to upload cropped image",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
