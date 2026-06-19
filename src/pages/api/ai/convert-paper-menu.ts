import type { APIRoute } from "astro";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { previews } from "../../../utils/store";
import { foodDatabase } from "../../../utils/food-database";

// Helper to provide a beautiful high-quality logo based on the store type
function getDecentLogo(type: string): string {
  const t = type.toLowerCase();
  if (
    t.includes("cafe") ||
    t.includes("coffee") ||
    t.includes("کافه") ||
    t.includes("قهوه") ||
    t.includes("کافی")
  ) {
    return "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&h=150&q=80"; // Premium Coffee Cup
  }
  if (t.includes("pizza") || t.includes("پیتزا")) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=150&h=150&q=80"; // Pizza Box/Slices
  }
  if (
    t.includes("burger") ||
    t.includes("همبرگر") ||
    t.includes("برگر") ||
    t.includes("fast") ||
    t.includes("فست")
  ) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&h=150&q=80"; // Burger
  }
  if (
    t.includes("bakery") ||
    t.includes("قنادی") ||
    t.includes("شیرینی") ||
    t.includes("نان")
  ) {
    return "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=150&h=150&q=80"; // Bakery Bread/Pastry
  }
  // Default decent restaurant photo
  return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&h=150&q=80";
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { images, locale } = await request.json();
    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid or empty images array",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const apiKey = process.env.AI_API_KEY || import.meta.env.AI_API_KEY;
    const baseURL =
      process.env.AI_BASE_URL ||
      import.meta.env.AI_BASE_URL ||
      "https://openrouter.ai/api/v1";
    const modelName =
      process.env.AI_MODEL ||
      import.meta.env.AI_MODEL ||
      "google/gemini-2.5-flash";

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "AI API Key is not configured",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // 1. Configure Vercel AI SDK custom OpenAI provider
    const openai = createOpenAI({
      apiKey,
      baseURL,
    });

    // 2. Prepare multimodal image inputs for the AI SDK message content
    const messageContent: any[] = [
      {
        type: "text",
        text: "Extract the menu categories, products, prices, and descriptions from these menu images. Also detect the store name, type, slogan, currency, and locale.",
      },
    ];

    for (const image of images) {
      const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
      let mimeType = "image/jpeg";
      let base64Data = image;

      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }

      messageContent.push({
        type: "image",
        image: base64Data,
        mimeType: mimeType,
      });
    }

    // 3. Generate structured food database list in compact CSV-like format to guide the AI model
    const foodGuide = foodDatabase.map((f) => `${f.id},${f.name}`).join("\n");

    const targetLocale = locale || "en";
    const localeInstruction = `CRITICAL LANGUAGE REQUIREMENT: You MUST extract/translate and return all output text fields (including "name", "type", "slogan", "currency", category names, product names, and descriptions) in the requested locale's language. The requested locale is "${targetLocale}".
- If the requested locale is "en", the language of all texts must be English. For example, "type" must be "Restaurant", "Cafe", etc., not "رستوران" or "کافه".
- If the requested locale is "fa", the language of all texts must be Persian. For example, "type" must be "رستوران", "کافه", etc., not "Restaurant" or "Cafe".
- If the requested locale is "tr", the language of all texts must be Turkish. For example, "type" must be "Restoran", "Kafe", etc.
Always match the "locale" field in the output JSON with this requested locale: "${targetLocale}".`;

    // 4. Generate structured menu JSON text using AI SDK generateText (more robust for OpenRouter)
    const { text } = await generateText({
      model: openai(modelName),
      maxTokens: 4000,
      messages: [
        {
          role: "user",
          content: messageContent,
        },
      ],
      system: `You are an expert menu extraction agent. Parse physical paper menus or menu images and return a cleanly structured digital menu configuration in JSON format.
You must return ONLY a raw JSON object. Do NOT wrap it in markdown code blocks (like \`\`\`json). Do NOT add any extra text or explanations.

${localeInstruction}

CRITICAL: For every item, you MUST match it to the closest corresponding item from this predefined whitelist database and assign its exact ID to the "foodDatabaseId" field. If the item does not match anything in the database, set "foodDatabaseId" to null. Do NOT make up new IDs.

Predefined Whitelist Database:
${foodGuide}

JSON Schema to match:
{
  "name": "Store name",
  "type": "Store type (e.g. Restaurant, Cafe)",
  "slogan": "Store slogan",
  "currency": "Currency symbol, e.g. $, تومان",
  "theme": "light or dark",
  "locale": "fa, en, or tr",
  "defaultLayout": "pinterest, simple, or card",
  "brandStyle": "A short, concise description of the store's visual identity, dominant colors, and aesthetic style detected from the paper menu images (e.g., 'Starbucks green branding, modern cozy theme with wooden elements').",
  "photoConcepts": [
    "A list of up to 35 unique, descriptive food/drink photo concepts representing the menu items (in English). Group exactly identical food/drink items that are size/volume/price variants (e.g., 'Iced Caramelised Banana Latte - Tall' and 'Iced Caramelised Banana Latte - Venti' should both map to a single concept: 'Iced Caramelised Banana Latte'). Prioritize the most important, highest-margin, or popular items to fit within 35 slots."
  ],
  "categories": [
    {
      "name": "Category name",
      "status": "active",
      "items": [
        {
          "name": "Product name",
          "price": 120.5,
          "description": "Product description",
          "discount": {
            "originalPrice": 150.0,
            "discountText": "20% off"
          },
          "span2": false,
          "status": "active",
          "foodDatabaseId": "One of the IDs from the list above, e.g. 'pizza_pepperoni' or null",
          "photoConceptIndex": "The 0-based index of the matching concept inside the 'photoConcepts' array, or null if no concept matches or is appropriate for this item."
        }
      ]
    }
  ]
}`,
    });

    // 5. Parse output text safely
    const cleanText = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/```$/, "")
      .trim();
    const menuData = JSON.parse(cleanText);

    // 6. Select a beautiful fallback logo based on the extracted store type
    const storeType = menuData.type || "Restaurant";
    const logoUrl = getDecentLogo(storeType);

    // Keep track of assigned URLs in this request session to guarantee uniqueness
    const assignedUrls = new Set<string>();

    // 7. Map extracted schema to PreviewData schema
    const categoriesWithIds = menuData.categories.map(
      (cat: any, catIdx: number) => ({
        id: `cat-${catIdx}`,
        name: cat.name,
        status: cat.status || "active",
        items: cat.items.map((item: any, itemIdx: number) => {
          const imageUrl = "";

          // Assign gridIndex based on photoConceptIndex from first prompt
          const hasConceptIndex = item.photoConceptIndex !== undefined && item.photoConceptIndex !== null;
          const gridIndex = hasConceptIndex ? Number(item.photoConceptIndex) + 1 : null;

          return {
            id: `item-${catIdx}-${itemIdx}`,
            name: item.name,
            price: Number(item.price) || 0,
            image: imageUrl,
            description: item.description,
            discount: item.discount,
            span2: !!item.span2,
            status: item.status || "active",
            gridIndex: gridIndex,
          };
        }),
      }),
    );

    const id = crypto.randomUUID();

    previews.set(id, {
      name: menuData.name || "Menu Preview",
      type: storeType,
      slogan: menuData.slogan || "",
      logo: logoUrl,
      logoIcon: menuData.logoIcon,
      currency: menuData.currency || "$",
      theme: menuData.theme || "light",
      locale: menuData.locale || "en",
      defaultLayout: menuData.defaultLayout || "simple",
      categories: categoriesWithIds,
      brandStyle: menuData.brandStyle || "",
      photoConcepts: menuData.photoConcepts || [],
    });

    // Launch grid image and index generation task in the background
    generateGridImageAndIndex(id, menuData, apiKey, baseURL, images).catch(
      (err) => {
        console.error(
          "Failed to start grid image generation in background:",
          err,
        );
      },
    );

    return new Response(JSON.stringify({ success: true, id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("AI Menu extraction failed:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Menu extraction failed",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

// Background generator for 8x8 grid image and text index
async function generateGridImageAndIndex(
  id: string,
  menuData: any,
  apiKey: string,
  baseURL: string,
  images: string[],
) {
  try {
    // 1. Retrieve the preview from the store
    const preview = previews.get(id);
    if (!preview) {
      console.error(
        `Preview ${id} not found in store at start of background generation`,
      );
      return;
    }



    const storeType = preview.type || "Restaurant";
    const photoConcepts: string[] = (preview as any).photoConcepts || [];
    const brandStyle = (preview as any).brandStyle || "";

    const tilesInstructions: string[] = [];
    // Tile 1 at Row 1, Col 1 (Position 1,1) is the venue logo
    tilesInstructions.push(
      `- Tile 1 at Row 1, Col 1 (Position 1,1): Strictly the graphic logo/icon of the venue. The style should be modern and minimalist (matching this visual theme: ${brandStyle || storeType}). Do not include any text or name on the logo tile.`,
    );

    // Menu photo concepts
    photoConcepts.forEach((concept, idx) => {
      const slotIndex = idx + 1; // 1 to 35
      const row = Math.floor(slotIndex / 6) + 1;
      const col = (slotIndex % 6) + 1;
      tilesInstructions.push(
        `- Tile ${slotIndex + 1} at Row ${row}, Col ${col} (Position ${row},${col}): Distinct professional food/drink photo representing: "${concept}"`,
      );
    });

    // Blank white tiles for remaining slots
    for (let idx = photoConcepts.length + 1; idx < 36; idx++) {
      const row = Math.floor(idx / 6) + 1;
      const col = (idx % 6) + 1;
      tilesInstructions.push(
        `- Tile ${idx + 1} at Row ${row}, Col ${col} (Position ${row},${col}): MUST be a solid, completely blank white square with no graphics, borders, or details (pure white background).`,
      );
    }

    // 3. Construct prompt exactly as requested by user
    const prompt = `You must perform two tasks simultaneously: generate a 1:1 square image and provide a corresponding text index.

TASK 1: IMAGE GENERATION
Create a perfectly flat, direct 2D digital graphic layout consisting of a seamless 6x6 grid with exactly 36 square tiles.
- CRUCIAL: The overall output image must have a strict 1:1 square aspect ratio.
- There must be absolutely NO gaps, borders, lines, margins, spaces, or padding between the tiles. They must touch each other seamlessly, edge to edge (0 pixels gap).
- NO white borders, NO gray lines, NO grids, and NO borders surrounding the tiles or the overall image.
- The overall grid must have zero perspective distortion or tilt (looks like a direct digital UI export, perfect for easy cropping).
- The 36 tiles are defined as follows:
${tilesInstructions.join("\n")}
- Food Photography Style: For tiles containing food/drink items, the items must be captured in a professional, commercial style for a website. Visual Theme: ${brandStyle || 'A cohesive color palette matching the theme'}. The backgrounds of food tiles should NOT be plain white; use a cohesive color palette matching this style.
- Strict Restrictions: ABSOLUTELY NO text, labels, prices, or watermarks inside any tile. No hands, no paper textures, and no logo text (except for Tile 1, which is a graphic logo icon).

TASK 2: TEXT OUTPUT (The Index)
In your text response, provide a clear 6x6 text index mapping out exactly which menu item or logo is placed in which tile position, formatted like this:
Row 1: (1,1) Logo | (1,2) [Item Name] | (1,3) [Item Name] ...
Row 2: (2,1) [Item Name] ...`;

    const messageContent: any[] = [
      {
        type: "text",
        text: prompt,
      },
    ];

    for (const image of images) {
      let formattedUrl = image;
      if (!formattedUrl.startsWith("data:image")) {
        formattedUrl = `data:image/jpeg;base64,${image}`;
      }
      messageContent.push({
        type: "image_url",
        image_url: {
          url: formattedUrl,
        },
      });
    }

    // 4. Call OpenRouter using the custom OpenAI provider and Gemini image model
    const imageModelName =
      process.env.AI_IMAGE_MODEL || "google/gemini-3.1-flash-image-preview";

    const res = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: imageModelName,
        messages: [
          {
            role: "user",
            content: messageContent,
          },
        ],
        modalities: ["image", "text"],
        image_config: {
          aspect_ratio: "1:1",
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(
        `OpenRouter image generation failed: status ${res.status}, body: ${errText}`,
      );
    }

    const resJson = await res.json();
    if (!resJson.choices || !resJson.choices[0]) {
      throw new Error("Invalid response structure from OpenRouter");
    }

    const choice = resJson.choices[0];
    const imagesArray = choice.message?.images || [];

    if (imagesArray.length === 0) {
      throw new Error("No image was returned by the model");
    }

    const gridImageUrlData = imagesArray[0].image_url?.url || "";
    if (!gridImageUrlData.startsWith("data:image")) {
      throw new Error("Invalid image data URL format returned");
    }

    // 5. Decode and upload the grid image to storage
    const match = gridImageUrlData.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      throw new Error("Could not parse image data URL");
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, "base64");

    const filename = `grid-${id}-${Date.now()}.png`;
    const { uploadImage } = await import("../../../utils/storage");
    const gridPublicUrl = await uploadImage({
      buffer,
      filename,
      contentType: mimeType,
    });

    // Save final properties to preview session
    preview.gridImage = gridPublicUrl;
    preview.gridSize = 6;
    previews.set(id, preview);

    console.log(
      `Successfully completed grid image generation for preview ${id}`,
    );
  } catch (err) {
    console.error(`Background grid generation failed for preview ${id}:`, err);
  }
}
