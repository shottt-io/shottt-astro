import type { APIRoute } from "astro";
import { previews } from "../../../utils/store";
import { uploadImage } from "../../../utils/storage";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { previewId, itemId, dataUrl, batch } = body;

    if (!previewId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing previewId",
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

    if (batch && Array.isArray(batch)) {
      // Process batch uploads sequentially to update a single preview session object
      for (const uploadItem of batch) {
        const { itemId: bItemId, dataUrl: bDataUrl } = uploadItem;
        if (!bItemId || !bDataUrl) continue;

        const isLogo = bItemId === "logo";
        let targetItem: any = null;

        if (!isLogo) {
          for (const cat of preview.categories) {
            const match = cat.items.find((item) => item.id === bItemId);
            if (match) {
              targetItem = match;
              break;
            }
          }
          if (!targetItem) continue; // Skip if item not found
        }

        const match = bDataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
        if (!match) continue; // Skip invalid format

        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, "base64");

        const randomSuffix = Math.random().toString(36).substring(2, 6);
        const filename = isLogo
          ? `logo-${previewId}-${Date.now()}-${randomSuffix}.webp`
          : `crop-${bItemId}-${Date.now()}-${randomSuffix}.webp`;

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
      }

      // Save updated preview back to store once for the whole batch
      await previews.set(previewId, preview);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Single upload mode (fallback)
      if (!itemId || !dataUrl) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Missing itemId or dataUrl",
          }),
          {
            status: 400,
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

      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, "base64");

      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const filename = isLogo
        ? `logo-${previewId}-${Date.now()}-${randomSuffix}.webp`
        : `crop-${itemId}-${Date.now()}-${randomSuffix}.webp`;

      // Upload to active storage provider
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
    }
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
