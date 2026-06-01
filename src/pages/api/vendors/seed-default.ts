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
            { name: 'سیب‌زمینی تنوری با پنیر', price: '140', description: 'سیب‌زمینی تنوری به همراه سس قارچ و پنیر موزارلا ذوب شده', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'سالاد سزار با مرغ سوخاری', price: '240', description: 'کاهو رسمی، فیله مرغ سوخاری، نان کروتان، سس سزار دست‌ساز و پنیر پارمزان', image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'سالاد فتوش مدیترانه‌ای', price: '190', description: 'ترکیب سبزیجات تازه، نان تست سماقی، زیتون سیاه و سس روغن زیتون بکر', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&auto=format&fit=crop&ar=3:4' },
            { name: 'سوپ جو خامه‌ای مخصوص', price: '110', description: 'سوپ جو غلیظ به همراه خامه تازه، مرغ ریش‌شده و قارچ اسلایس', image: 'https://images.unsplash.com/photo-1547592165-e1d17f97a15a?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'نان سیر پنیری', price: '130', description: 'خمیر تازه نان به همراه کره سیر مخصوص، سبزیجات معطر و پنیر موزارلا فراوان', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop&ar=1:1' }
          ]
        },
        {
          name: 'غذای اصلی',
          items: [
            { name: 'پیتزا دیاولو (تند)', price: '290', description: 'سس گوجه‌فرنگی مخصوص، پنیر موزارلا، سالامی تند، فلفل هالوپینو', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'برگر کلاسیک با پنیر', price: '260', description: '۱۵۰ گرم گوشت گوساله خالص، پنیر چدار، کاهو، گوجه، خیارشور و سس مخصوص', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'پاستا آلفردو با مرغ', price: '280', description: 'پاستا پنه، فیله مرغ گریل شده، سس خامه و قارچ مخصوص، پنیر پارمزان', image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'فیله استیک مرغ گریل', price: '310', description: 'دو تکه فیله مرغ مرینت شده گریل به همراه دورچین سبزیجات بخارپز و سس قارچ', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'پیتزا مارگاریتا کلاسیک', price: '210', description: 'سس گوجه‌فرنگی ریحان، پنیر موزارلا تازه، گوجه گیلاسی و روغن زیتون', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'لازانیا گوشت و قارچ', price: '290', description: 'لایه‌های پاستا، گوشت چرخ‌کرده مغز پخت، قارچ، سس بشامل و پنیر پیتزای تنوری', image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=600&auto=format&fit=crop&ar=4:3' }
          ]
        },
        {
          name: 'نوشیدنی و دسر',
          items: [
            { name: 'موهیتو کلاسیک', price: '95', description: 'نعناع تازه، لیمو ترش، شکر قهوه‌ای، سودا', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'لیموناد نعناع', price: '85', description: 'آب لیمو تازه، عصاره نعناع، شربت شکر و آب گازدار', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop&ar=16:10' },
            { name: 'آب پرتقال طبیعی', price: '90', description: 'آب پرتقال تازه و طبیعی تهیه شده به صورت روزانه', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'شیک نوتلا و خامه', price: '120', description: 'بستنی وانیل، شکلات نوتلا اصل، شیر محلی و خامه زده‌شده', image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?q=80&w=600&auto=format&fit=crop&ar=3:4' },
            { name: 'اسموتی بری بری', price: '110', description: 'ترکیب توت فرنگی، تمشک، شاتوت به همراه یخ خرد شده شیرین ملایم', image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=600&auto=format&fit=crop&ar=4:3' }
          ]
        }
      ];
    } else if (typeLower.includes('کافه') || typeLower.includes('قهوه')) {
      // Cafe / Coffee shop
      defaultCategories = [
        {
          name: 'نوشیدنی‌های گرم',
          items: [
            { name: 'اسپرسو دبل ریسترتو', price: '70', description: 'تهیه شده از ۱۰۰٪ قهوه عربیکا تخصصی، با طعم‌یادهای شکلاتی', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d37043?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'لته آرت', price: '95', description: 'یک شات اسپرسو به همراه شیر بخار داده شده و فوم نرم شیر', image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'کاپوچینو کلاسیک', price: '95', description: 'اسپرسو دبل، شیر فوم‌دار داغ به همراه پودر کاکائو یا دارچین', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'کارامل ماکیاتو گرم', price: '110', description: 'شیر فوم دار داغ، شربت کارامل و عصاره غلیظ اسپرسو تک شات', image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=600&auto=format&fit=crop&ar=3:4' },
            { name: 'هات چاکلت فوم‌دار', price: '95', description: 'پودر کاکائو غنی بلژیکی، شیر داغ و لایه فوم خامه فرم گرفته', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=600&auto=format&fit=crop&ar=4:3' }
          ]
        },
        {
          name: 'نوشیدنی‌های سرد',
          items: [
            { name: 'آیس لته', price: '98', description: 'دبل شات اسپرسو، شیر سرد و تکه‌های یخ', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop&ar=3:4' },
            { name: 'کولد برو (دم‌سرد)', price: '90', description: 'عصاره‌گیری سرد به مدت ۱۸ ساعت، شفاف و با اسیدیته ملایم', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop&ar=16:10' },
            { name: 'آیس آمریکانو', price: '80', description: 'شات‌های غلیظ اسپرسو مخلوط با آب خنک و یخ فراوان', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'فراپه وانیل شکلات', price: '110', description: 'عصاره اسپرسو، شیر، سس شکلات تیره، سیروپ وانیل بلند شده با یخ', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600&auto=format&fit=crop&ar=2:3' }
          ]
        },
        {
          name: 'کیک و دسر',
          items: [
            { name: 'چیزکیک نیویورکی با سس توت‌فرنگی', price: '120', description: 'چیزکیک پخته‌شده کلاسیک به همراه سس توت‌فرنگی تازه', image: 'https://images.unsplash.com/photo-1524351199679-46cddf530c04?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'کرواسان ساده فرانسوی', price: '85', description: 'کرواسان کره‌ای لایه‌لایه و ترد، پخت روزانه', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'کیک شکلاتی دبل چاکلت', price: '110', description: 'کیک اسفنجی شکلاتی مرطوب، گاناش کاکائویی و چیپس شکلات بلژیکی', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'تارت میوه‌های فصل', price: '95', description: 'تارت بیسکویتی ترد، خامه قنادی سبک و اسلایس‌های هلو، کیوی و توت‌فرنگی تازه', image: 'https://images.unsplash.com/photo-1519869325930-281384150729?q=80&w=600&auto=format&fit=crop&ar=3:4' },
            { name: 'وافل موز و نوتلا', price: '130', description: 'وافل بلژیکی داغ، تکه‌های موز، خامه و روکش سس شکلات نوتلا', image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=600&auto=format&fit=crop&ar=2:3' }
          ]
        }
      ];
    } else if (typeLower.includes('رستوران') || typeLower.includes('فست فود') || typeLower.includes('برگر') || typeLower.includes('پیتزا')) {
      // Restaurant
      defaultCategories = [
        {
          name: 'پیش‌غذا',
          items: [
            { name: 'سیب‌زمینی سرخ‌کرده کلاسیک', price: '110', description: 'سیب‌زمینی خلال درشت به همراه ادویه مخصوص و سس کچاپ', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'قارچ سوخاری کریسپی', price: '130', description: 'قارچ‌های تازه سوخاری شده با روکش پانکو به همراه سس تارتار', image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'پیاز حلقه‌ای سوخاری', price: '95', description: 'حلقه‌های پیاز شیرین آغشته به خمیر بنیه و پودر سوخاری', image: 'https://images.unsplash.com/photo-1639024471283-2bc7b3c6a267?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'بال سوخاری اسپایسی', price: '160', description: 'بال مرغ تند و کریسپی مزه‌دار شده با سس چیلی و کنجد', image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=600&auto=format&fit=crop&ar=2:3' }
          ]
        },
        {
          name: 'پیتزا و برگر',
          items: [
            { name: 'پیتزا پپرونی ویژه شات', price: '280', description: 'پپرونی گوساله فراوان، فلفل دلمه‌ای، پنیر موزارلا، سس مخصوص', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'دبل چیزبرگر', price: '320', description: 'دو عدد پتی گوشت گوساله گریل شده، دو لایه پنیر چدار، سس باربیکیو', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'پیتزا مخلوط مخصوص', price: '290', description: 'ترکیب ژامبون گوساله، قارچ، زیتون سیاه، فلفل دلمه‌ای، ذرت و موزارلا', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'ماشروم برگر', price: '280', description: 'گوشت گوساله خالص، سس قارچ و خامه فراوان، پنیر آب شده سوئیسی', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'پیتزا سیر و استیک', price: '340', description: 'فیله گوساله نازک، سس سیر کاراملی، پنیر پروولون و موزارلا، سبزیجات معطر', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'چیکن برگر زغالی', price: '250', description: 'سینه مرغ مرینت شده گریل زغالی، کاهو، گوجه، خیارشور و سس خردل عسل', image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?q=80&w=600&auto=format&fit=crop&ar=3:4' }
          ]
        },
        {
          name: 'ساندویچ و پاستا',
          items: [
            { name: 'ساندویچ فیله مرغ گریل', price: '210', description: 'فیله مرغ مرینت شده، قارچ، پنیر، کاهو و سس مایونز خردل', image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=600&auto=format&fit=crop&ar=16:10' },
            { name: 'ساندویچ هات‌داگ پنیری', price: '180', description: 'هات‌داگ تنوری درجه یک، پنیر پیتزا ذوب شده، سس چیلی و پیاز ترد', image: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'پاستا چیکن آلفردو پنه', price: '260', description: 'پاستا پنه، فیله مرغ گریل شده، سس خامه و قارچ مخصوص، پنیر پارمزان', image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'ساندویچ ژامبون تنوری', price: '190', description: 'ژامبون گوشت و مرغ، پنیر ذوب‌شده چدار، سس مخصوص با نان باگت داغ', image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=600&auto=format&fit=crop&ar=1:1' }
          ]
        }
      ];
    } else if (typeLower.includes('پوشاک') || typeLower.includes('لباس') || typeLower.includes('مزون') || typeLower.includes('بوتیک')) {
      // Clothing Store
      defaultCategories = [
        {
          name: 'پوشاک مردانه',
          items: [
            { name: 'تی‌شرت نخی اورسایز کتان', price: '450', description: 'تهیه شده از پارچه ۱۰۰٪ پنبه دورو، با تن‌خور آزاد و خنک مناسب تابستان', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'شلوار جین راسته کلاسیک', price: '850', description: 'جین ضخیم سنگ‌شور شده، دوخت دوبل مقاوم', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop&ar=3:4' },
            { name: 'هودی کلاه‌دار پاییزه', price: '950', description: 'هودی گرم دورس تو کرک، جیب کانگورویی بنددار مناسب پاییز و زمستان', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'کت تک اسپرت پشمی', price: '1450', description: 'برش اسلیم فیت، آستر دوزی داخلی مناسب استایل نیمه‌رسمی', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'پیراهن چهارخانه آستین بلند', price: '490', description: 'نخی و خنک، یقه دکمه‌دار، رنگ‌بندی‌های متنوع پاییزی', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600&auto=format&fit=crop&ar=3:4' }
          ]
        },
        {
          name: 'پوشاک زنانه',
          items: [
            { name: 'کراپ تاپ بافت ظریف', price: '320', description: 'بافت نرم و کشسانی، موجود در رنگ‌های سفید، مشکی و کرم', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'شلوار مامی فیت جین', price: '780', description: 'جین مام‌استایل فاق بلند، با پارچه کشسانی ملایم و راحت', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'بارانی بلند ضدآب زنانه', price: '1200', description: 'پارچه مموری ضد آب، کمربند دار و کلاه‌دار مناسب استایل روزمره بارانی', image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'شومیز ابریشم مجلسی', price: '690', description: 'پارچه ساتن ابریشم فوق‌العاده نرم، آستین مچ‌دار و یقه پاپیونی شیک', image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'دامن پلیسه بلند بهاره', price: '450', description: 'پارچه حریر پلیسه‌دار سبک و راحت، کمربند کشی راحت', image: 'https://images.unsplash.com/photo-1583496661160-fb4886a0edf6?q=80&w=600&auto=format&fit=crop&ar=3:4' }
          ]
        }
      ];
    } else {
      // Default Generic Shop (Others)
      defaultCategories = [
        {
          name: 'محصولات پرفروش',
          items: [
            { name: 'محصول نمونه طلایی شات', price: '190', description: 'یک نمونه محصول با کیفیت و مشخصات کامل جهت بررسی چیدمان کاتالوگ شما.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'محصول نمونه نقره‌ای شات', price: '140', description: 'محصول نمونه پایه دوم با قیمت و توضیحات اقتصادی جهت چیدمان', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'محصول دکوراتیو لوکس', price: '350', description: 'طراحی مینیمال و زیبا، هماهنگ با انواع سبک‌های چیدمان داخلی', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'ساعت مچی هوشمند دیجیتال', price: '850', description: 'صفحه نمایش آمولد رنگی، سنسورهای سلامتی و باتری بادوام ۷ روزه', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600&auto=format&fit=crop&ar=3:4' },
            { name: 'هدفون بی‌سیم نویز کنسلینگ', price: '1200', description: 'تکنولوژی ANC فعال، درایورهای صوتی قدرتمند و بالشتک‌های چرمی ارگونومیک', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop&ar=2:3' }
          ]
        },
        {
          name: 'کالای پایه شات',
          items: [
            { name: 'کالای پایه شات', price: '95', description: 'محصول نمونه پایه با قیمت و توضیحات اقتصادی', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'کیف دستی مسافرتی برزنتی', price: '390', description: 'برزنتی ضخیم و ضدآب، جیب‌های متعدد جانبی و بند رودوشی پهن و مقاوم', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'عینک آفتابی کلاسیک مدل خلبانی', price: '450', description: 'شیشه سنگ نشکن با فیلتر کامل UV400، فریم فلزی بسیار سبک و ضد حساسیت', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'کفش کتانی اسپرت پیاده‌روی', price: '690', description: 'زیره پیو کاملاً ارگونومیک، رویه بافت مش تنفس‌پذیر مناسب استفاده طولانی', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop&ar=1:1' }
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
