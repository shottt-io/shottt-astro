import type { APIRoute } from 'astro';
import { db } from '../../../db/db';
import { vendors as vendorsTable, categories as categoriesTable, menuItems as menuItemsTable, vendorUsers as vendorUsersTable } from '../../../db/schema';
import { getSession } from '../../../utils/auth';
import { eq, and } from 'drizzle-orm';
import { purgeVendorCache } from '../../../utils/purge';

// Helper to check user access to a vendor ID
async function checkVendorAccess(userId: number, vendorId: number): Promise<boolean> {
  const access = await db
    .select()
    .from(vendorUsersTable)
    .where(and(eq(vendorUsersTable.userId, userId), eq(vendorUsersTable.vendorId, vendorId)))
    .limit(1);
  return access.length > 0;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = getSession(cookies);
  if (!session) {
    return new Response(JSON.stringify({ success: false, message: 'عدم احراز هویت' }), { status: 401 });
  }

  try {
    const { vendorSlug } = await request.json();
    if (!vendorSlug) {
      return new Response(JSON.stringify({ success: false, message: 'شناسه مجموعه الزامی است.' }), { status: 400 });
    }

    // Lookup vendor
    const vendorList = await db
      .select()
      .from(vendorsTable)
      .where(eq(vendorsTable.slug, vendorSlug))
      .limit(1);

    if (vendorList.length === 0) {
      return new Response(JSON.stringify({ success: false, message: 'مجموعه یافت نشد.' }), { status: 404 });
    }
    const vendor = vendorList[0];

    // Check access
    const hasAccess = await checkVendorAccess(session.userId, vendor.id);
    if (!hasAccess) {
      return new Response(JSON.stringify({ success: false, message: 'عدم دسترسی به این مجموعه.' }), { status: 403 });
    }

    // Define mock data templates based on vendor type
    const typeLower = (vendor.type || 'سایر').toLowerCase();
    
    let defaultCategories: { name: string; items: { name: string; price: string; description: string; image: string }[] }[] = [];

    if (typeLower.includes('کافه') && typeLower.includes('رستوران')) {
      // Cafe Restaurant
      defaultCategories = [
        {
          name: 'پیش‌غذا و سالاد',
          items: [
            { name: 'سیب‌زمینی تنوری با پنیر', price: '140', description: 'سیب‌زمینی تنوری به همراه سس قارچ و پنیر موزارلا ذوب شده', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop' },
            { name: 'سالاد سزار با مرغ سوخاری', price: '240', description: 'کاهو رسمی، فیله مرغ سوخاری، نان کروتان، سس سزار دست‌ساز و پنیر پارمزان', image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=600&auto=format&fit=crop' }
          ]
        },
        {
          name: 'غذای اصلی',
          items: [
            { name: 'پیتزا دیاولو (تند)', price: '290', description: 'سس گوجه‌فرنگی مخصوص، پنیر موزارلا، سالامی تند، فلفل هالوپینو', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop' },
            { name: 'برگر کلاسیک با پنیر', price: '260', description: '۱۵۰ گرم گوشت گوساله خالص، پنیر چدار، کاهو، گوجه، خیارشور و سس مخصوص', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop' },
            { name: 'پاستا آلفردو با مرغ', price: '280', description: 'پاستا پنه، فیله مرغ گریل شده، سس خامه و قارچ مخصوص، پنیر پارمزان', image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=600&auto=format&fit=crop' }
          ]
        },
        {
          name: 'نوشیدنی',
          items: [
            { name: 'موهیتو کلاسیک', price: '95', description: 'نعناع تازه، لیمو ترش، شکر قهوه‌ای، سودا', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop' },
            { name: 'لیموناد نعناع', price: '85', description: 'آب لیمو تازه، عصاره نعناع، شربت شکر و آب گازدار', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop' }
          ]
        }
      ];
    } else if (typeLower.includes('کافه') || typeLower.includes('قهوه')) {
      // Cafe / Coffee shop
      defaultCategories = [
        {
          name: 'نوشیدنی‌های گرم',
          items: [
            { name: 'اسپرسو دبل ریسترتو', price: '70', description: 'تهیه شده از ۱۰۰٪ قهوه عربیکا تخصصی، با طعم‌یادهای شکلاتی', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d37043?q=80&w=600&auto=format&fit=crop' },
            { name: 'لته آرت', price: '95', description: 'یک شات اسپرسو به همراه شیر بخار داده شده و فوم نرم شیر', image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=600&auto=format&fit=crop' },
            { name: 'کاپوچینو کلاسیک', price: '95', description: 'اسپرسو دبل، شیر فوم‌دار داغ به همراه پودر کاکائو یا دارچین', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=600&auto=format&fit=crop' }
          ]
        },
        {
          name: 'نوشیدنی‌های سرد',
          items: [
            { name: 'آیس لته', price: '98', description: 'دبل شات اسپرسو، شیر سرد و تکه‌های یخ', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop' },
            { name: 'کولد برو (دم‌سرد)', price: '90', description: 'عصاره‌گیری سرد به مدت ۱۸ ساعت، شفاف و با اسیدیته ملایم', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop' }
          ]
        },
        {
          name: 'کیک و دسر',
          items: [
            { name: 'چیزکیک نیویورکی با سس توت‌فرنگی', price: '120', description: 'چیزکیک پخته‌شده کلاسیک به همراه سس توت‌فرنگی تازه', image: 'https://images.unsplash.com/photo-1524351199679-46cddf530c04?q=80&w=600&auto=format&fit=crop' },
            { name: 'کرواسان ساده فرانسوی', price: '85', description: 'کرواسان کره‌ای لایه‌لایه و ترد، پخت روزانه', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop' }
          ]
        }
      ];
    } else if (typeLower.includes('رستوران') || typeLower.includes('فست فود') || typeLower.includes('برگر') || typeLower.includes('پیتزا')) {
      // Restaurant
      defaultCategories = [
        {
          name: 'پیش‌غذا',
          items: [
            { name: 'سیب‌زمینی سرخ‌کرده کلاسیک', price: '110', description: 'سیب‌زمینی خلال درشت به همراه ادویه مخصوص و سس کچاپ', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop' },
            { name: 'قارچ سوخاری کریسپی', price: '130', description: 'قارچ‌های تازه سوخاری شده با روکش پانکو به همراه سس تارتار', image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?q=80&w=600&auto=format&fit=crop' }
          ]
        },
        {
          name: 'پیتزا و برگر',
          items: [
            { name: 'پیتزا پپرونی ویژه شات', price: '280', description: 'پپرونی گوساله فراوان، فلفل دلمه‌ای، پنیر موزارلا، سس مخصوص', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop' },
            { name: 'دبل چیزبرگر', price: '320', description: 'دو عدد پتی گوشت گوساله گریل شده، دو لایه پنیر چدار، سس باربیکیو', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop' }
          ]
        },
        {
          name: 'ساندویچ و پاستا',
          items: [
            { name: 'ساندویچ فیله مرغ گریل', price: '210', description: 'فیله مرغ مرینت شده، قارچ، پنیر، کاهو و سس مایونز خردل', image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=600&auto=format&fit=crop' }
          ]
        }
      ];
    } else if (typeLower.includes('پوشاک') || typeLower.includes('لباس') || typeLower.includes('مزون') || typeLower.includes('بوتیک')) {
      // Clothing Store
      defaultCategories = [
        {
          name: 'پوشاک مردانه',
          items: [
            { name: 'تی‌شرت نخی اورسایز کتان', price: '450', description: 'تهیه شده از پارچه ۱۰۰٪ پنبه دورو، با تن‌خور آزاد و خنک مناسب تابستان', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop' },
            { name: 'شلوار جین راسته کلاسیک', price: '850', description: 'جین ضخیم سنگ‌شور شده، دوخت دوبل مقاوم', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop' }
          ]
        },
        {
          name: 'پوشاک زنانه',
          items: [
            { name: 'کراپ تاپ بافت ظریف', price: '320', description: 'بافت نرم و کشسانی، موجود در رنگ‌های سفید، مشکی و کرم', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600&auto=format&fit=crop' },
            { name: 'شلوار مامی فیت جین', price: '780', description: 'جین مام‌استایل فاق بلند، با پارچه کشسانی ملایم و راحت', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop' }
          ]
        }
      ];
    } else {
      // Default Generic Shop (Others)
      defaultCategories = [
        {
          name: 'محصولات پرفروش',
          items: [
            { name: 'محصول نمونه طلایی شات', price: '190', description: 'یک نمونه محصول با کیفیت و مشخصات کامل جهت بررسی چیدمان کاتالوگ شما.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop' },
            { name: 'محصول دکوراتیو لوکس', price: '350', description: 'طراحی مینیمال و زیبا، هماهنگ با انواع سبک‌های چیدمان داخلی', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop' }
          ]
        },
        {
          name: 'دسته جدید',
          items: [
            { name: 'کالای پایه شات', price: '95', description: 'محصول نمونه پایه با قیمت و توضیحات اقتصادی', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop' }
          ]
        }
      ];
    }

    // Determine brand logo based on type
    let seededLogo = '/logo.png';
    if (typeLower.includes('کافه') && typeLower.includes('رستوران')) {
      seededLogo = 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=300&auto=format&fit=crop';
    } else if (typeLower.includes('کافه') || typeLower.includes('قهوه')) {
      seededLogo = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=300&auto=format&fit=crop';
    } else if (typeLower.includes('رستوران') || typeLower.includes('فست فود') || typeLower.includes('برگر') || typeLower.includes('پیتزا')) {
      seededLogo = 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=300&auto=format&fit=crop';
    } else if (typeLower.includes('پوشاک') || typeLower.includes('لباس') || typeLower.includes('مزون') || typeLower.includes('بوتیک')) {
      seededLogo = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=300&auto=format&fit=crop';
    } else {
      seededLogo = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=300&auto=format&fit=crop';
    }

    // Insert to DB using a transaction
    await db.transaction(async (tx) => {
      // Update vendor logo
      await tx
        .update(vendorsTable)
        .set({ logo: seededLogo })
        .where(eq(vendorsTable.id, vendor.id));

      let sortOrder = 0;
      for (const catData of defaultCategories) {
        // Insert category
        const [insertedCat] = await tx
          .insert(categoriesTable)
          .values({
            vendorId: vendor.id,
            name: catData.name,
            sortOrder: sortOrder++,
            status: 'available'
          })
          .returning();

        // Insert items
        let itemSortOrder = 0;
        for (const itemData of catData.items) {
          await tx
            .insert(menuItemsTable)
            .values({
              categoryId: insertedCat.id,
              name: itemData.name,
              price: itemData.price,
              description: itemData.description,
              image: itemData.image,
              sortOrder: itemSortOrder++,
              status: 'available',
              span2: false
            });
        }
      }
    });

    // Purge CDN Cache
    purgeVendorCache(vendorSlug).catch(() => {});

    return new Response(JSON.stringify({ success: true, message: 'کاتالوگ نمونه با موفقیت ساخته شد.' }), { status: 200 });
  } catch (error: any) {
    console.error('Seed Default Data Error:', error);
    return new Response(JSON.stringify({ success: false, message: 'خطای سرور در ایجاد منوی نمونه.' }), { status: 500 });
  }
};
