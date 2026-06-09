import type { APIRoute } from 'astro';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { previews } from '../../../utils/store';
import { foodDatabase } from '../../../utils/food-database';

// Helper to provide a beautiful high-quality logo based on the store type
function getDecentLogo(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('cafe') || t.includes('coffee') || t.includes('کافه') || t.includes('قهوه') || t.includes('کافی')) {
    return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&h=150&q=80'; // Premium Coffee Cup
  }
  if (t.includes('pizza') || t.includes('پیتزا')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=150&h=150&q=80'; // Pizza Box/Slices
  }
  if (t.includes('burger') || t.includes('همبرگر') || t.includes('برگر') || t.includes('fast') || t.includes('فست')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&h=150&q=80'; // Burger
  }
  if (t.includes('bakery') || t.includes('قنادی') || t.includes('شیرینی') || t.includes('نان')) {
    return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=150&h=150&q=80'; // Bakery Bread/Pastry
  }
  // Default decent restaurant photo
  return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&h=150&q=80';
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { images, locale } = await request.json();
    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid or empty images array' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.AI_API_KEY || import.meta.env.AI_API_KEY;
    const baseURL = process.env.AI_BASE_URL || import.meta.env.AI_BASE_URL || 'https://openrouter.ai/api/v1';
    const modelName = process.env.AI_MODEL || import.meta.env.AI_MODEL || 'google/gemini-2.5-flash';

    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, error: 'AI API Key is not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Configure Vercel AI SDK custom OpenAI provider
    const openai = createOpenAI({
      apiKey,
      baseURL,
    });

    // 2. Prepare multimodal image inputs for the AI SDK message content
    const messageContent: any[] = [
      {
        type: 'text',
        text: 'Extract the menu categories, products, prices, and descriptions from these menu images. Also detect the store name, type, slogan, currency, and locale.',
      }
    ];

    for (const image of images) {
      const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
      let mimeType = 'image/jpeg';
      let base64Data = image;
      
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }

      messageContent.push({
        type: 'image',
        image: base64Data,
        mimeType: mimeType,
      });
    }

    // 3. Generate structured food database list in compact CSV-like format to guide the AI model
    const foodGuide = foodDatabase.map(f => `${f.id},${f.name}`).join('\n');

    const targetLocale = locale || 'en';
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
          role: 'user',
          content: messageContent,
        }
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
          "foodDatabaseId": "One of the IDs from the list above, e.g. 'pizza_pepperoni' or null"
        }
      ]
    }
  ]
}`,
    });

    // 5. Parse output text safely
    const cleanText = text.trim().replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    const menuData = JSON.parse(cleanText);

    // 6. Select a beautiful fallback logo based on the extracted store type
    const storeType = menuData.type || 'Restaurant';
    const logoUrl = getDecentLogo(storeType);

    // Keep track of assigned URLs in this request session to guarantee uniqueness
    const assignedUrls = new Set<string>();

    // 7. Map extracted schema to PreviewData schema and attach dynamic Unsplash food photo URLs
    const categoriesWithIds = menuData.categories.map((cat: any, catIdx: number) => ({
      id: `cat-${catIdx}`,
      name: cat.name,
      status: cat.status || 'active',
      items: cat.items.map((item: any, itemIdx: number) => {
        const name = (item.name || '').toLowerCase();
        const foodDatabaseId = (item.foodDatabaseId || '').trim();
        
        let imageUrl = '';
        
        // 1. Look up image in the database using the AI-provided ID
        const dbMatch = foodDatabase.find(f => f.id === foodDatabaseId);
        
        if (dbMatch) {
          imageUrl = dbMatch.url;
        } else {
          // Fallback keyword-based matching if AI failed to match an ID
          let targetCategory = 'food';
          
          if (name.includes('پیتزا')) {
            targetCategory = 'pizza';
          } else if (name.includes('برگر') || name.includes('همبرگر')) {
            targetCategory = 'burger';
          } else if (name.includes('پاستا') || name.includes('ماکارونی') || name.includes('اسپاگتی')) {
            targetCategory = 'pasta';
          } else if (name.includes('سالاد')) {
            targetCategory = 'salad';
          } else if (name.includes('ساندویچ') || name.includes('هات')) {
            targetCategory = 'sandwich';
          } else if (name.includes('قهوه') || name.includes('لاته') || name.includes('اسپرسو') || name.includes('کاپوچینو')) {
            targetCategory = 'coffee';
          } else if (name.includes('چای') || name.includes('دمنوش')) {
            targetCategory = 'tea';
          } else if (name.includes('آبمیوه') || name.includes('شربت') || name.includes('اسموتی') || name.includes('کوکتل')) {
            targetCategory = 'juice';
          } else if (name.includes('نوشابه') || name.includes('سودا')) {
            targetCategory = 'soda';
          } else if (name.includes('کیک') || name.includes('چیزکیک') || name.includes('دسر')) {
            targetCategory = 'cake';
          } else if (name.includes('کرواسان') || name.includes('شیرینی')) {
            targetCategory = 'pastry';
          } else if (name.includes('کباب') || name.includes('جوجه')) {
            targetCategory = 'kebab';
          } else if (name.includes('استیک')) {
            targetCategory = 'steak';
          } else if (name.includes('گوشت') || name.includes('مرغ')) {
            targetCategory = 'meat';
          } else if (name.includes('سوپ')) {
            targetCategory = 'soup';
          } else if (name.includes('سیب زمینی')) {
            targetCategory = 'fries';
          }

          // Fetch list of matching food items from DB
          const matches = foodDatabase.filter(f => f.id.startsWith(targetCategory) || f.id.includes(targetCategory));
          const pool = matches.length > 0 ? matches.map(m => m.url) : foodDatabase.map(m => m.url);
          
          // Find first image in the pool that hasn't been used yet
          const unusedImage = pool.find(url => !assignedUrls.has(url));
          imageUrl = unusedImage || pool[Math.floor(Math.random() * pool.length)];
        }

        assignedUrls.add(imageUrl);

        return {
          id: `item-${catIdx}-${itemIdx}`,
          name: item.name,
          price: Number(item.price) || 0,
          image: imageUrl,
          description: item.description,
          discount: item.discount,
          span2: !!item.span2,
          status: item.status || 'active',
        };
      }),
    }));

    const id = crypto.randomUUID();
    
    previews.set(id, {
      name: menuData.name || 'Menu Preview',
      type: storeType,
      slogan: menuData.slogan || '',
      logo: logoUrl,
      logoIcon: menuData.logoIcon,
      currency: menuData.currency || '$',
      theme: menuData.theme || 'light',
      locale: menuData.locale || 'en',
      defaultLayout: menuData.defaultLayout || 'simple',
      categories: categoriesWithIds,
    });

    return new Response(JSON.stringify({ success: true, id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('AI Menu extraction failed:', error);
    return new Response(JSON.stringify({ success: false, error: error.message || 'Menu extraction failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
