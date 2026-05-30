export interface ProductSection {
  title?: string;
  description?: string;
  chips?: string[];
}

export interface MenuItem {
  id: string;
  name: string;
  price: string; // Scale 1000 (e.g. 95)
  priceFormatted: string; // Farsi (e.g. ۹۵)
  image?: string; // Optional image URL
  description?: string; // Short summary
  discount?: {
    originalPrice: string; // e.g., "۱۲۰"
    originalPriceRaw: string;
    discountText: string;
  };
  span2?: boolean; // If true, occupies 2 columns in Masonry mode
  sections?: ProductSection[]; // Dynamic sections for the separate product page
}

export interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface Vendor {
  slug: string;
  name: string;
  type: string; // e.g., "کافه گالری"
  slogan: string;
  description: string;
  defaultLayout: 'pinterest' | 'simple';
  logoIcon: string;
  coverImage: string;
  categories: Category[];
}

export const vendors: Vendor[] = [
  {
    slug: 'cafe-lumiere',
    name: 'کافه لومیر',
    type: 'کافه گالری',
    slogan: 'بازتاب هنر در فنجان شما',
    description: 'مکانی آرامش‌بخش برای دوستداران قهوه تخصصی در فضایی سرشار از نور طبیعی و دکوراسیون مدرن و مینیمال.',
    defaultLayout: 'pinterest',
    logoIcon: 'coffee',
    coverImage: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=1200&auto=format&fit=crop',
    categories: [
      {
        id: 'hot-drinks',
        name: 'قهوه‌های گرم',
        items: [
          {
            id: 'espresso',
            name: 'اسپرسو دوبل تک‌خاستگاه',
            price: '95',
            priceFormatted: '۹۵',
            image: 'https://images.unsplash.com/photo-1510972527409-cef6e4a4d6f2?q=80&w=600&auto=format&fit=crop',
            description: 'عصاره‌گیری استاندارد از دانه‌های صد درصد عربیکا با یادداشت‌های طعمی مرکبات و شکلات تلخ.',
            sections: [
              {
                title: 'شناسنامه قهوه',
                description: 'این اسپرسو از دانه‌های زیرگونه کاتورا تهیه شده که در ارتفاع ۱۸۰۰ متری منطقه هویلا کلمبیا کشت گردیده‌اند.',
                chips: ['کلمبیا', 'ارتفاع ۱۸۰۰متر', 'فرآوری شسته']
              },
              {
                title: 'پروفایل طعمی',
                description: 'دارای بادی متوسط رو به بالا، اسیدیته درخشان پرتقالی و پس‌طعم ماندگار کاکائویی.',
                chips: ['شکلات تلخ', 'مرکبات', 'کارامل']
              }
            ]
          },
          {
            id: 'latte',
            name: 'سرو لاته آرت کلاسیک',
            price: '125',
            priceFormatted: '۱۲۵',
            image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop',
            description: 'اسپرسو دوبل به همراه شیر مخملی داغ و لاته آرت ظریف.',
            sections: [
              {
                title: 'ترکیبات اصلی',
                description: 'یک شات دوبل اسپرسو ترکیب پایه لومیر به همراه شیر تازه لبنی پرچرب پاستوریزه که تا دمای ۶۵ درجه فوم‌گیری شده است.',
                chips: ['اسپرسو دوبل', 'شیر فوم‌گیری شده']
              },
              {
                title: 'گزینه‌های سفارشی سازی',
                chips: ['شیر بادام', 'شیر جو دوسر', 'بدون لاکتوز']
              }
            ]
          },
          {
            id: 'cappuccino',
            name: 'کاپوچینو با فوم ابریشمی',
            price: '120',
            priceFormatted: '۱۲۰',
            image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=600&auto=format&fit=crop',
            description: 'ترکیب کلاسیک اسپرسو و شیر با فوم ضخیم و مخملی مجهز به پودر کاکائو خالص.',
            sections: [
              {
                title: 'توضیحات سرو',
                description: 'فوم ضخیم روی این کاپوچینو با استانداردهای باریستای جهانی هماهنگ بوده و با پودر کاکائو غنی اکوادور تزیین می‌شود.'
              }
            ]
          }
        ]
      },
      {
        id: 'cold-drinks',
        name: 'نوشیدنی‌های سرد',
        items: [
          {
            id: 'iced-latte',
            name: 'آیس لاته وانیل ماداگاسکار',
            price: '135',
            priceFormatted: '۱۳۵',
            image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop',
            description: 'شیر سرد، اسپرسو تک‌خاستگاه، یخ و سیروپ وانیل دست‌ساز تهیه شده از غلاف وانیل طبیعی.',
            sections: [
              {
                title: 'سیروپ اختصاصی',
                description: 'سیروپ وانیل این نوشیدنی به صورت روزانه از عصاره‌گیری طولانی غلاف‌های تازه وانیل ماداگاسکار در کارگاه لومیر پخته می‌شود.',
                chips: ['وانیل طبیعی', 'شیرین‌کننده ارگانیک']
              }
            ]
          },
          {
            id: 'cold-brew',
            name: 'کلد برو دم‌سرد ۱۲ ساعته',
            price: '110',
            priceFormatted: '۱۱۰',
            image: 'https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?q=80&w=600&auto=format&fit=crop',
            description: 'قهوه سرد‌دم که با فرآیند عصاره‌گیری قطره‌ای ۱۲ ساعته تهیه شده، با اسیدیته بسیار پایین و طعم ملایم.',
            sections: [
              {
                title: 'مکانیزم عصاره‌گیری',
                description: 'دم‌آوری در دمای ۴ درجه سانتی‌گراد در برج‌های مخصوص شیشه‌ای لومیر انجام می‌شود تا تلخی و اسیدیته آزاردهنده به طور کامل فیلتر شود.',
                chips: ['دم‌آوری سرد', 'اسیدیته ملایم', 'کافئین بالا']
              }
            ]
          },
          {
            id: 'matcha-cold',
            name: 'ماچا لاته سرد ژاپنی',
            price: '140',
            priceFormatted: '۱۴۰',
            image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=600&auto=format&fit=crop',
            description: 'پودر ماچای تشریفاتی گرید A تهیه شده از مزارع اوجی کیوتو ژاپن به همراه شیر سرد و یخ.',
            sections: [
              {
                title: 'درباره ماچا',
                description: 'ماچای تشریفاتی سرشار از آنتی‌اکسیدان بوده و با همزن سنتی بامبو (چاسن) در آب حل شده و سپس روی شیر ریخته می‌شود.',
                chips: ['گرید تشریفاتی', 'مستقیم از ژاپن', 'انرژی پایدار']
              }
            ]
          },
          {
            id: 'pink-lemonade',
            name: 'پینک لموناد رزماری و گریپ‌فروت',
            price: '98',
            priceFormatted: '۹۸',
            image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop',
            description: 'ترکیب تازه گریپ‌فروت، لیمو سنگی، سودا و عصاره رزماری وحشی.',
            sections: [
              {
                title: 'طعم و حس فیزیکی',
                description: 'طعم گس و کمی تلخ گریپ‌فروت صورتی در توازن با ترشی لیمو و عطر علفی رزماری وحشی گریل شده.',
                chips: ['طبیعی', 'بدون مواد نگهدارنده', 'سرشار از ویتامین C']
              }
            ]
          }
        ]
      },
      {
        id: 'desserts',
        name: 'دسرها و مافن‌ها',
        items: [
          {
            id: 'croissant',
            name: 'کرواسان کره فرانسوی',
            price: '98',
            priceFormatted: '۹۸',
            image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop',
            description: 'کرواسان لایه‌ای ترد و کره‌ای، تهیه شده به سبک سنتی نانوایی‌های پاریس.',
            discount: {
              originalPrice: '۱۲۰',
              originalPriceRaw: '120',
              discountText: 'آفر ویژه'
            },
            sections: [
              {
                title: 'روش پخت و خمیر',
                description: 'خمیر هزارلا با استفاده از کره ایزینی فرانسه لمینت شده و به صورت روزانه در ساعت‌های ۷، ۱۱ و ۱۶ به صورت گرم پخت می‌شود.',
                chips: ['پخت روز', 'کره فرانسوی']
              }
            ]
          },
          {
            id: 'raspberry-tart',
            name: 'تارت تمشک وحشی و کرم پسته تازه کوهستان',
            price: '160',
            priceFormatted: '۱۶۰',
            image: 'https://images.unsplash.com/photo-1519869325930-281384150729?q=80&w=600&auto=format&fit=crop',
            description: 'پایه خمیر تارت ترد سابله، کرم فرانجیپان پسته تازه و تمشک‌های وحشی دست‌چین شده با ظاهری هنری.',
            span2: true, // Occupies two columns in Masonry waterfall!
            sections: [
              {
                title: 'اثر هنری قناد',
                description: 'این تارت به عنوان شاهکار شیرینی‌پزی کافه لومیر شناخته می‌شود. پایه تارت بسیار ترد بوده و کرم داخلی آن از بهترین پسته‌های ارگانیک کوهستان تهیه گردیده است.',
                chips: ['شاهکار لومیر', 'پسته ارگانیک', 'تمشک تازه وحشی']
              }
            ]
          },
          {
            id: 'cheesecake',
            name: 'کیک پنیر نیویورکی کلاسیک',
            price: '145',
            priceFormatted: '۱۴۵',
            image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=600&auto=format&fit=crop',
            description: 'چیزکیک پخته‌شده غنی با پایه بیسکویت دایجستیو کره‌ای و سس بلوبری تازه.',
            sections: [
              {
                title: 'بافت و سرو',
                description: 'بافت پنیری فوق‌العاده متراکم و خامه ترش طبیعی به همراه سس دست‌ساز بلوبری ترش و شیرین.'
              }
            ]
          },
          {
            id: 'avocado-toast',
            name: 'تست آووکادو و تخم‌مرغ پوچد روی نان ساوردو',
            price: '210',
            priceFormatted: '۲۱۰',
            image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=600&auto=format&fit=crop',
            description: 'برش‌های نان چاودار تخمیری، پوره آووکادو چاشنی‌خورده با لیمو ترش، تخم‌مرغ پوچد ارگانیک و پرک فلفل قرمز.',
            span2: true, // Occupies two columns in Masonry waterfall!
            sections: [
              {
                title: 'توضیحات صبحانه اختصاصی',
                description: 'نان ساوردوی چاودار با تخمیر طبیعی ۳۶ ساعته در فر سنگی پخته شده است. آووکادو از نژاد هاس درجه یک بوده و با روغن زیتون فرابکر ترکیب می‌گردد.',
                chips: ['نان ساوردو ۳۶ ساعته', 'آووکادو هاس', 'تخم‌مرغ ارگانیک']
              }
            ]
          }
        ]
      }
    ]
  },
  {
    slug: 'bistro-dada',
    name: 'بیسترو دادا',
    type: 'رستوران مدرن فرانسوی-ایرانی',
    slogan: 'تلفیق اصالت و آشپزی مدرن',
    description: 'روایتی نوین از طعم‌های آشنای اصیل ایرانی با بکارگیری تکنیک‌های پیچیده آشپزی کلاسیک فرانسوی در ظروفی مینیمال.',
    defaultLayout: 'simple',
    logoIcon: 'utensils',
    coverImage: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1200&auto=format&fit=crop',
    categories: [
      {
        id: 'starters',
        name: 'پیش‌غذا',
        items: [
          {
            id: 'french-onion-soup',
            name: 'سوپ پیاز با پنیر گرویر آب‌شده',
            price: '185',
            priceFormatted: '۱۸۵',
            image: 'https://images.unsplash.com/photo-1547592165-e1d17fed6005?q=80&w=600&auto=format&fit=crop',
            description: 'عصاره غلیظ گوشت و پیاز کاراملی به همراه نان باگت برشته شده و پنیر گرویر سوئیسی ذوب‌شده.',
            sections: [
              {
                title: 'فرآیند کاراملیزاسیون',
                description: 'پیازها به مدت ۴ ساعت در حرارت بسیار ملایم با کره حیوانی تفت داده می‌شوند تا قند طبیعی پیاز به صورت کامل کاراملی و شیرین شود.',
                chips: ['پنیر گرویر سوئیسی', 'عصاره سنتی گوشت']
              }
            ]
          },
          {
            id: 'beet-salad',
            name: 'سالاد چغندر تنوری و پنیر بز',
            price: '160',
            priceFormatted: '۱۶۰',
            image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&auto=format&fit=crop',
            description: 'برش‌های نازک چغندر پخته‌شده در فر، شاهی تازه، پنیر بز نرم، گردوی کاراملی و سس خردل و عسل.',
            sections: [
              {
                title: 'توضیح مواد ارگانیک',
                description: 'چغندرها در نمک دریا پیچیده شده و تنوری می‌گردند تا طعم شیرین طبیعی آن‌ها متمرکز شود.',
                chips: ['چغندر تنوری', 'پنیر بز فرانسوی']
              }
            ]
          },
          {
            id: 'pumpkin-soup',
            name: 'سوپ کدو حلوایی با شیر نارگیل و زنجبیل',
            price: '150',
            priceFormatted: '۱۵۰',
            image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?q=80&w=600&auto=format&fit=crop',
            description: 'کدو حلوایی تنوری پوره شده با عصاره سبزیجات معطر، زنجبیل تازه و خامه نارگیل سبک.',
            sections: [
              {
                title: 'طعم زمستانی',
                description: 'سوپی گرم و لطیف با نت‌های ملایم تند زنجبیل و چربی ملایم شیر نارگیل طبیعی.',
                chips: ['صد درصد گیاهی', 'بدون گلوتن']
              }
            ]
          }
        ]
      },
      {
        id: 'mains',
        name: 'غذاهای اصلی',
        items: [
          {
            id: 'kabob-filet',
            name: 'فیله کباب با سس خردل دیژون و سبزیجات',
            price: '490',
            priceFormatted: '۴۹۰',
            image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=600&auto=format&fit=crop',
            description: '۲۵۰ گرم فیله گوساله مرینیت شده کباب‌شده روی زغال، همراه با سس خردل دیژون فرانسوی و سبزیجات گریل‌شده.',
            discount: {
              originalPrice: '۵۸۰',
              originalPriceRaw: '580',
              discountText: 'آفر ویژه'
            },
            sections: [
              {
                title: 'آماده‌سازی گوشت',
                description: 'گوشت فیله گوساله جوان به مدت ۴۸ ساعت در روغن زیتون فرابکر، رزماری، و سیر مرینیت می‌شود.',
                chips: ['فیله گوساله', 'سس دیژون دست‌ساز']
              }
            ]
          },
          {
            id: 'steak-ribeye',
            name: 'استیک ریب‌آی با کره سبزیجات',
            price: '620',
            priceFormatted: '۶۲۰',
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop',
            description: '۳۵۰ گرم استیک دنده گوساله، گریل‌شده به میزان دلخواه شما، سرو شده با کره کافه دو پاریس و پوره سیب‌زمینی کره‌ای.',
            sections: [
              {
                title: 'کره کافه دو پاریس',
                description: 'کره ترکیبی ساخته شده در آشپزخانه دادا حاوی ۱۸ قلم سبزی معطر، ادویه و چاشنی اختصاصی.',
                chips: ['ریب‌آی استیک', 'کره دست‌ساز']
              }
            ]
          },
          {
            id: 'salmon-papillote',
            name: 'فیله ماهی سالمون در کاغذ پاپیوت با مارچوبه',
            price: '540',
            priceFormatted: '۵۴۰',
            image: 'https://images.unsplash.com/photo-1485962398705-ef6a13c41e8f?q=80&w=600&auto=format&fit=crop',
            description: 'ماهی سالمون نروژی پخته شده در فر داخل کاغذ مخصوص همراه با مارچوبه، لیمو ترش، کره گیاهی و رازیانه.',
            sections: [
              {
                title: 'تکنیک پخت فرانسوی En Papillote',
                description: 'ماهی در بخار آب و چربی‌های طبیعی خودش به همراه سبزیجات معطر داخل پاکت بسته پخته می‌شود تا بافت آن کاملا نرم و آبدار بماند.',
                chips: ['سالم', 'پخت تحت بخار', 'سالمون نروژی']
              }
            ]
          }
        ]
      },
      {
        id: 'drinks',
        name: 'نوشیدنی‌ها',
        items: [
          {
            id: 'modern-sherbet',
            name: 'شربت سکنجبین و خیار نیتروژنه',
            price: '85',
            priceFormatted: '۸۵',
            image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=600&auto=format&fit=crop',
            description: 'عصاره نعناع و سرکه سنتی، خیار رنده‌شده ظریف، تخم شربتی و حباب‌های سودای گازدار سرد.',
            sections: [
              {
                title: 'بازسازی شربت اصیل',
                description: 'سرکه انگبین با عسل طبیعی شیراز و نعناع تازه ارگانیک فرآوری شده است.'
              }
            ]
          },
          {
            id: 'saffron-chia',
            name: 'اکسیر زعفران خراسان و دانه چیا سرد',
            price: '92',
            priceFormatted: '۹۲',
            image: 'https://images.unsplash.com/photo-1508501168345-15ee04a08d4f?q=80&w=600&auto=format&fit=crop',
            description: 'دم‌کرده زعفران سرگل خراسان، گلاب دوآتیشه کاشان، شربت عسل کوهی و دانه‌های متورم چیا.',
            sections: [
              {
                title: 'توضیح اکسیر',
                description: 'نوشیدنی شاداب‌کننده سنتی با خاصیت ضداسترس طبیعی و عطر بی‌نظیر گل و زعفران.',
                chips: ['زعفران قاینات', 'گلاب کاشان', 'انرژی‌بخش طبیعی']
              }
            ]
          }
        ]
      }
    ]
  },
  {
    slug: 'pastry-atelier',
    name: 'آتلیه شیرینی',
    type: 'بوتیک قنادی فرانسوی',
    slogan: 'طعم لطیف هنر فرانسوی',
    description: 'کارگاه تولید تخصصی و بوتیک قنادی با تمرکز بر تکنیک‌های مدرن فرانسوی و استفاده از کره حیوانی وارداتی اعلا.',
    defaultLayout: 'pinterest',
    logoIcon: 'cake',
    coverImage: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=1200&auto=format&fit=crop',
    categories: [
      {
        id: 'pastries',
        name: 'شیرینی‌های تک‌نفره',
        items: [
          {
            id: 'chocolate-eclair',
            name: 'اکلر شکلات تلخ بلژیکی',
            price: '88',
            priceFormatted: '۸۸',
            image: 'https://images.unsplash.com/photo-1603532648955-036f0396e58f?q=80&w=600&auto=format&fit=crop',
            description: 'نان کلمی فرانسوی کشیده، فیلینگ کرم دیپلمات شکلاتی، روکش گاناش شکلات ۷۰ درصد کالیبوت.',
            sections: [
              {
                title: 'شکلات به کار رفته',
                description: 'گاناش روی اکلر ترکیبی از شکلات تلخ بلژیکی مارک Callebaut با درصد کاکائوی ۷۰.۵ درصد است.',
                chips: ['شکلات بلژیکی', 'نان شو کرم']
              }
            ]
          },
          {
            id: 'salted-caramel-tart',
            name: 'تارت کارامل نمکی و بادام‌زمینی تفت‌داده',
            price: '95',
            priceFormatted: '۹۵',
            image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop',
            description: 'خمیر تارت کاکائویی ترد، لایه سس کارامل نمکی داغ، کرم بادام‌زمینی خرد شده و گاناش بادام‌زمینی.',
            sections: [
              {
                title: 'تضاد نمک و شکر',
                description: 'نمک دریایی گرانول کریستالی به سس کارامل اضافه می‌شود تا شیرینی زننده دسر کنترل گردد.',
                chips: ['نمک دریایی فرانسه', 'کارامل دست‌ساز']
              }
            ]
          },
          {
            id: 'macarons',
            name: 'ماکارون جعبه ۶ عددی میکس ارگانیک',
            price: '190',
            priceFormatted: '۱۹۰',
            image: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=600&auto=format&fit=crop',
            description: 'شش عدد ماکارون بادامی رنگارنگ با طعم‌های وانیل، تمشک، پسته، شکلات تلخ، کارامل نمکی و لیمو سنگی.',
            sections: [
              {
                title: 'فرآوری آرد بادام',
                description: 'پوسته ماکارون‌ها به صورت صد درصد از آرد بادام پوست‌کنده درجه یک و بدون رنگ‌های خوراکی شیمیایی تهیه می‌شود.',
                chips: ['بدون گلوتن', 'رنگ‌های گیاهی طبیعی']
              }
            ]
          },
          {
            id: 'lemon-tart',
            name: 'تارت لیمو سنگی و مرنگ فرانسوی سوخته',
            price: '110',
            priceFormatted: '۱۱۰',
            image: 'https://images.unsplash.com/photo-1519869325930-281384150729?q=80&w=600&auto=format&fit=crop',
            description: 'خمیر تارت شیرین ترد، کرم لیموی ترش تازه تهیه شده از لیموهای سنگی شیراز و لایه مرنگ فرانسوی که با تورچ برشته شده است.',
            span2: true, // Occupies two columns in Masonry waterfall!
            sections: [
              {
                title: 'تعادل ترشی و شیرینی متمایز',
                description: 'کرم لیمویی خنک با کره اعلا و آب لیموی طبیعی فرآوری شده و تضاد بی‌نظیری با مرنگ شیرین و سبک ایجاد می‌کند.',
                chips: ['مرنگ برشته با تورچ', 'کرم لیمو سنگی طبیعی']
              }
            ]
          }
        ]
      },
      {
        id: 'baked-goods',
        name: 'نان و کرواسان',
        items: [
          {
            id: 'almond-croissant',
            name: 'کرواسان بادام و کرم فرانجیپان',
            price: '120',
            priceFormatted: '۱۲۰',
            image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop',
            description: 'کرواسان دو بار پخت پر شده با کرم بادام شیرین فرانسوی و خلال بادام برشته.',
            discount: {
              originalPrice: '۱۴۵',
              originalPriceRaw: '145',
              discountText: 'آفر ویژه'
            },
            sections: [
              {
                title: 'کرم فرانجیپان اختصاصی',
                description: 'این کرم ترکیبی از آرد بادام درختی بو داده، کره حیوانی، تخم‌مرغ و مقدار کمی عصاره بادام تلخ است.',
                chips: ['دو بار پخت', 'خلال بادام برشته']
              }
            ]
          },
          {
            id: 'sourdough-loaf',
            name: 'نان ساوردو کلاسیک فرانسوی (قالب بزرگ)',
            price: '85',
            priceFormatted: '۸۵',
            image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop',
            description: 'نان گندم و چاودار تخمیری با پوسته ترد قهوه‌ای تیره و مغز نرم اسفنجی، تهیه شده با خمیرمایه قدیمی ۳ ساله.',
            sections: [
              {
                title: 'اصالت نان تخمیری',
                description: 'نان ساوردو بوتیک شیرینی با روش هیدراتاسیون ۸۰٪ و پخت مستقیم در فر سنگی سنگین تهیه می‌گردد.',
                chips: ['تخمیر ۳۶ ساعته', 'خمیرمایه ۳ ساله', 'پخت فر سنگی']
              }
            ]
          }
        ]
      },
      {
        id: 'beverages',
        name: 'نان و نوشیدنی',
        items: [
          {
            id: 'earl-grey-tea',
            name: 'چای ارل گری لاهیجان دم‌ساز',
            price: '65',
            priceFormatted: '۶۵',
            image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop',
            description: 'چای بهاره گیلان معطر شده با عصاره طبیعی ترنج، دم شده در قوری سفالی تک‌نفره.',
            sections: [
              {
                title: 'عطرزدایی طبیعی',
                description: 'برگ‌های چای سیاه دست‌چین گیلان که با اسانس خالص میوه ترنج (برگاموت) تازه معطر شده است.',
                chips: ['چای محلی گیلان', 'عصاره ترنج طبیعی']
              }
            ]
          }
        ]
      }
    ]
  }
];

export function getVendorBySlug(slug: string): Vendor | undefined {
  return vendors.find(v => v.slug === slug);
}
