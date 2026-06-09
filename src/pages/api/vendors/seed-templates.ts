export interface MockItem {
  name: string;
  price: string;
  description: string;
  image: string;
}

export interface MockCategory {
  name: string;
  items: MockItem[];
}

export function getSeedTemplates(locale: string, typeLower: string): MockCategory[] {
  const isEn = locale === 'en';
  const isTr = locale === 'tr';

  if (typeLower.includes('کافه') && typeLower.includes('رستوران')) {
    // Cafe Restaurant
    if (isEn) {
      return [
        {
          name: 'Appetizers & Salads',
          items: [
            { name: 'Baked Potatoes with Cheese', price: '140', description: 'Baked potatoes with special mushroom sauce and melted mozzarella cheese', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Caesar Salad with Crispy Chicken', price: '240', description: 'Romaine lettuce, crispy chicken fillet, croutons, homemade Caesar dressing, and parmesan cheese', image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Fattoush Salad', price: '190', description: 'Combination of fresh vegetables, sumac toasted bread, black olives, and virgin olive oil dressing', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&auto=format&fit=crop&ar=3:4' },
            { name: 'Special Creamy Barley Soup', price: '110', description: 'Thick barley soup with fresh cream, shredded chicken, and sliced mushrooms', image: 'https://images.unsplash.com/photo-1547592165-e1d17f97a15a?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Garlic Bread with Cheese', price: '130', description: 'Fresh bread dough with special garlic butter, aromatic herbs, and plenty of mozzarella cheese', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop&ar=1:1' }
          ]
        },
        {
          name: 'Main Courses',
          items: [
            { name: 'Diavola Pizza (Spicy)', price: '290', description: 'Special tomato sauce, mozzarella cheese, spicy salami, jalapeno pepper', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'Classic Cheeseburger', price: '260', description: '150g pure beef patty, cheddar cheese, lettuce, tomato, pickles, and special sauce', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Chicken Alfredo Pasta', price: '280', description: 'Penne pasta, grilled chicken fillet, special cream and mushroom sauce, parmesan cheese', image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Grilled Chicken Fillet Steak', price: '310', description: 'Two pieces of grilled marinated chicken fillet with steamed vegetables and mushroom sauce', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Classic Margherita Pizza', price: '210', description: 'Tomato basil sauce, fresh mozzarella cheese, cherry tomatoes, and olive oil', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'Meat & Mushroom Lasagna', price: '290', description: 'Pasta layers, well-cooked minced meat, mushrooms, bechamel sauce, and baked pizza cheese', image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=600&auto=format&fit=crop&ar=4:3' }
          ]
        },
        {
          name: 'Drinks & Desserts',
          items: [
            { name: 'Classic Mojito', price: '95', description: 'Fresh mint, lime, brown sugar, soda', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Mint Lemonade', price: '85', description: 'Fresh lemon juice, mint extract, sugar syrup, and sparkling water', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop&ar=16:10' },
            { name: 'Fresh Orange Juice', price: '90', description: 'Fresh and natural orange juice prepared daily', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Nutella & Cream Shake', price: '120', description: 'Vanilla ice cream, original Nutella chocolate, local milk, and whipped cream', image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?q=80&w=600&auto=format&fit=crop&ar=3:4' },
            { name: 'Very Berry Smoothie', price: '110', description: 'A blend of strawberry, raspberry, blackberry with crushed ice, mildly sweet', image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=600&auto=format&fit=crop&ar=4:3' }
          ]
        }
      ];
    } else if (isTr) {
      return [
        {
          name: 'Meze & Salatalar',
          items: [
            { name: 'Fırınlanmış Peynirli Patates', price: '140', description: 'Mantar soslu ve eritilmiş mozarella peynirli fırın patates', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Çıtır Tavuklu Sezar Salata', price: '240', description: 'Marul, çıtır tavuk fileto, kruton, ev yapımı Sezar sos ve parmesan peyniri', image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Akdeniz Fettuş Salatası', price: '190', description: 'Taze sebzeler, sumaklı kızarmış ekmek, siyah zeytin ve sızma zeytinyağı sosu', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&auto=format&fit=crop&ar=3:4' },
            { name: 'Özel Kremalı Arpa Çorbası', price: '110', description: 'Taze krema, tiftiklenmiş tavuk ve dilimlenmiş mantar ile koyu kıvamlı arpa çorbası', image: 'https://images.unsplash.com/photo-1547592165-e1d17f97a15a?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Peynirli Sarımsaklı Ekmek', price: '130', description: 'Özel sarımsaklı tereyağı, taze otlar ve bol mozarella peynirli taze ekmek hamuru', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop&ar=1:1' }
          ]
        },
        {
          name: 'Ana Yemekler',
          items: [
            { name: 'Acılı Diavola Pizza', price: '290', description: 'Özel domates sosu, mozarella peyniri, acı salam, jalapeno biberi', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'Klasik Peynirli Burger', price: '260', description: '150 gr saf dana köftesi, çedar peyniri, marul, domates, turşu ve özel sos', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Tavuklu Alfredo Makarna', price: '280', description: 'Penne makarna, ızgara tavuk fileto, özel krema ve mantar sosu, parmesan peyniri', image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Izgara Tavuk Fileto Biftek', price: '310', description: 'Mantar soslu ve buharda pişmiş sebzeli iki adet ızgara marine tavuk fileto', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Klasik Margherita Pizza', price: '210', description: 'Domates soslu fesleğen, taze mozarella peyniri, çeri domates ve zeytinyağı', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'Etli ve Mantarlı Lazanya', price: '290', description: 'Makarna katları, iyi pişmiş kıyma, mantar, beşamel sos ve fırınlanmış pizza peyniri', image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=600&auto=format&fit=crop&ar=4:3' }
          ]
        },
        {
          name: 'İçecekler & Tatlılar',
          items: [
            { name: 'Klasik Mojito', price: '95', description: 'Taze nane, misket limonu, esmer şeker, soda', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Naneli Limonata', price: '85', description: 'Taze limon suyu, nane özü, şeker şurubu ve gazlı su', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop&ar=16:10' },
            { name: 'Doğal Taze Portakal Suyu', price: '90', description: 'Günlük olarak hazırlanan taze ve doğal portakal suyu', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Nutellalı ve Kremalı Shake', price: '120', description: 'Vanilyalı dondurma, orijinal Nutella çikolata, yerel süt ve çırpılmış krema', image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?q=80&w=600&auto=format&fit=crop&ar=3:4' },
            { name: 'Orman Meyveli Smoothie', price: '110', description: 'Çilek, ahududu, karadut ve kırık buz karışımı, hafif tatlı', image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=600&auto=format&fit=crop&ar=4:3' }
          ]
        }
      ];
    }
    // Fallback/Persian
    return [
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
    if (isEn) {
      return [
        {
          name: 'Hot Drinks',
          items: [
            { name: 'Double Ristretto Espresso', price: '70', description: 'Brewed from 100% specialty Arabica coffee, with chocolate notes', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d37043?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'Latte Art', price: '95', description: 'A shot of espresso with steamed milk and silky milk foam', image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Classic Cappuccino', price: '95', description: 'Double espresso, hot frothed milk with cocoa powder or cinnamon', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Hot Caramel Macchiato', price: '110', description: 'Hot frothed milk, caramel syrup, and a single shot of rich espresso extract', image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=600&auto=format&fit=crop&ar=3:4' },
            { name: 'Hot Chocolate with Foam', price: '95', description: 'Rich Belgian cocoa powder, hot milk, and a layer of whipped cream foam', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=600&auto=format&fit=crop&ar=4:3' }
          ]
        },
        {
          name: 'Cold Drinks',
          items: [
            { name: 'Ice Latte', price: '98', description: 'Double shot of espresso, cold milk, and ice cubes', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop&ar=3:4' },
            { name: 'Cold Brew', price: '90', description: 'Cold-extracted for 18 hours, clean and with mild acidity', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop&ar=16:10' },
            { name: 'Ice Americano', price: '80', description: 'Rich espresso shots mixed with cold water and plenty of ice', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'Vanilla Chocolate Frappe', price: '110', description: 'Espresso extract, milk, dark chocolate sauce, vanilla syrup blended with ice', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600&auto=format&fit=crop&ar=2:3' }
          ]
        },
        {
          name: 'Cakes & Desserts',
          items: [
            { name: 'New York Cheesecake with Strawberry Sauce', price: '120', description: 'Classic baked cheesecake with fresh strawberry sauce', image: 'https://images.unsplash.com/photo-1524351199679-46cddf530c04?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Plain French Croissant', price: '85', description: 'Flaky and buttery layered croissant, baked daily', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'Double Chocolate Cake', price: '110', description: 'Moist chocolate sponge cake, cocoa ganache, and Belgian chocolate chips', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Seasonal Fruit Tart', price: '95', description: 'Crispy biscuit tart, light pastry cream, and fresh slices of peach, kiwi, and strawberry', image: 'https://images.unsplash.com/photo-1519869325930-281384150729?q=80&w=600&auto=format&fit=crop&ar=3:4' },
            { name: 'Banana & Nutella Waffle', price: '130', description: 'Warm Belgian waffle, banana slices, whipped cream, and Nutella chocolate sauce topping', image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=600&auto=format&fit=crop&ar=2:3' }
          ]
        }
      ];
    } else if (isTr) {
      return [
        {
          name: 'Sıcak İçecekler',
          items: [
            { name: 'Double Ristretto Espresso', price: '70', description: '%100 nitelikli Arabica kahvesinden demlenmiş, çikolata aromalı espresso', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d37043?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'Fincan Latte Art', price: '95', description: 'Sıcak buharla krema kıvamına getirilmiş süt ve espresso', image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Klasik Kapuçino', price: '95', description: 'Çift shot espresso, sıcak köpüklü süt, üzerinde kakao tozu veya tarçın', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Sıcak Karamel Makiyato', price: '110', description: 'Sıcak köpüklü süt, karamel şurubu ve zengin lezzetli tek shot espresso', image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=600&auto=format&fit=crop&ar=3:4' },
            { name: 'Köpüklü Sıcak Çikolata', price: '95', description: 'Zengin Belçika kakao tozu, sıcak süt ve çırpılmış krema köpüğü katmanı', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=600&auto=format&fit=crop&ar=4:3' }
          ]
        },
        {
          name: 'Soğuk İçecekler',
          items: [
            { name: 'Buzlu Latte', price: '98', description: 'Çift shot espresso, soğuk süt ve buz küpleri', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop&ar=3:4' },
            { name: 'Cold Brew (Soğuk Demleme)', price: '90', description: '18 saat boyunca soğuk suyla demlenmiş, hafif asiditeli berrak kahve', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop&ar=16:10' },
            { name: 'Buzlu Amerikano', price: '80', description: 'Soğuk su ve bol buz ile karıştırılmış yoğun espresso shotları', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'Vanilyalı Çikolatalı Frappe', price: '110', description: 'Espresso özü, süt, bitter çikolata sosu, vanilya şurubu ve kırık buz', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600&auto=format&fit=crop&ar=2:3' }
          ]
        },
        {
          name: 'Kekler & Tatlılar',
          items: [
            { name: 'Çilek Soslu New York Cheesecake', price: '120', description: 'Taze çilek sosu eşliğinde sunulan klasik fırınlanmış cheesecake', image: 'https://images.unsplash.com/photo-1524351199679-46cddf530c04?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Sade Fransız Kruvasanı', price: '85', description: 'Günlük pişirilen, kat kat tereyağlı çıtır kruvasan', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'Çift Çikolatalı Kek', price: '110', description: 'Nemli çikolatalı sünger kek, kakao ganajı ve Belçika çikolata parçacıkları', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Mevsim Meyveli Tart', price: '95', description: 'Çıtır bisküvi tartı, hafif krema, üzerinde taze şeftali, kivi ve çilek dilimleri', image: 'https://images.unsplash.com/photo-1519869325930-281384150729?q=80&w=600&auto=format&fit=crop&ar=3:4' },
            { name: 'Muzlu Nutellalı Waffle', price: '130', description: 'Sıcak Belçika waffleı, muz dilimleri, çırpılmış krema ve Nutella sosu kaplaması', image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=600&auto=format&fit=crop&ar=2:3' }
          ]
        }
      ];
    }
    // Fallback/Persian
    return [
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
    if (isEn) {
      return [
        {
          name: 'Appetizers',
          items: [
            { name: 'Classic French Fries', price: '110', description: 'Thick cut french fries with special seasoning and ketchup', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Crispy Fried Mushrooms', price: '130', description: 'Fresh mushrooms breaded in panko and fried, served with tartar sauce', image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Crispy Onion Rings', price: '95', description: 'Sweet onion rings dipped in batter and breadcrumbs', image: 'https://images.unsplash.com/photo-1639024471283-2bc7b3c6a267?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Spicy Chicken Wings', price: '160', description: 'Spicy and crispy chicken wings seasoned with chili sauce and sesame', image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=600&auto=format&fit=crop&ar=2:3' }
          ]
        },
        {
          name: 'Pizza & Burgers',
          items: [
            { name: 'Shottt Special Pepperoni Pizza', price: '280', description: 'Abundant beef pepperoni, bell pepper, mozzarella cheese, special sauce', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'Double Cheeseburger', price: '320', description: 'Two grilled beef patties, two layers of cheddar cheese, BBQ sauce', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Special Mixed Pizza', price: '290', description: 'Combination of beef ham, mushroom, black olives, bell pepper, corn, and mozzarella', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'Mushroom Burger', price: '280', description: 'Pure beef patty, abundant mushroom and cream sauce, melted Swiss cheese', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Garlic Steak Pizza', price: '340', description: 'Thin beef fillet, caramelized garlic sauce, provolone and mozzarella, aromatic herbs', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Charcoal Grilled Chicken Burger', price: '250', description: 'Grilled marinated chicken breast, lettuce, tomato, pickles, and honey mustard sauce', image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?q=80&w=600&auto=format&fit=crop&ar=3:4' }
          ]
        },
        {
          name: 'Sandwiches & Pasta',
          items: [
            { name: 'Grilled Chicken Fillet Sandwich', price: '210', description: 'Marinated chicken fillet, mushrooms, cheese, lettuce, and mustard mayo', image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=600&auto=format&fit=crop&ar=16:10' },
            { name: 'Cheesy Hot Dog Sandwich', price: '180', description: 'Premium baked hot dog, melted pizza cheese, chili sauce, and crispy onion', image: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Chicken Alfredo Penne Pasta', price: '260', description: 'Penne pasta, grilled chicken fillet, special cream and mushroom sauce, parmesan cheese', image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Oven-Baked Ham Sandwich', price: '190', description: 'Beef and chicken ham, melted cheddar cheese, special sauce on warm baguette', image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=600&auto=format&fit=crop&ar=1:1' }
          ]
        }
      ];
    } else if (isTr) {
      return [
        {
          name: 'Mezeler',
          items: [
            { name: 'Klasik Patates Kızartması', price: '110', description: 'Özel baharatlı ve ketçaplı kalın dilim patates kızartması', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Çıtır Panelene Mantar', price: '130', description: 'Panko kaplı ve kızartılmış taze mantarlar, tartar sosu ile', image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Çıtır Soğan Halkaları', price: '95', description: 'Sıvı hamur ve galeta ununa batırılmış tatlı soğan halkaları', image: 'https://images.unsplash.com/photo-1639024471283-2bc7b3c6a267?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Acılı Çıtır Tavuk Kanatları', price: '160', description: 'Acı sos ve susam ile marine edilmiş acılı çıtır tavuk kanatları', image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=600&auto=format&fit=crop&ar=2:3' }
          ]
        },
        {
          name: 'Pizza & Burgerler',
          items: [
            { name: 'Shottt Özel Pepperoni Pizza', price: '280', description: 'Bol dana pepperoni, yeşil biber, mozarella peyniri ve özel sos', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'Double Cheeseburger', price: '320', description: 'Çift dana köftesi, çift çedar peyniri, barbekü sosu', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Özel Karışık Pizza', price: '290', description: 'Dana jambon, mantar, siyah zeytin, yeşil biber, mısır ve mozarella kombinasyonu', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'Mantarlı Burger', price: '280', description: 'Saf dana eti, bol mantarlı kremalı sos, eritilmiş İsviçre peyniri', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Sarımsaklı Biftekli Pizza', price: '340', description: 'İnce dilimlenmiş dana fileto, karamelize sarımsak sosu, provolone ve mozarella, taze otlar', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Kömür Ateşinde Tavuk Burger', price: '250', description: 'Izgara marine edilmiş tavuk göğsü, marul, domates, turşu ve ballı hardal sosu', image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?q=80&w=600&auto=format&fit=crop&ar=3:4' }
          ]
        },
        {
          name: 'Sandviçler & Makarnalar',
          items: [
            { name: 'Izgara Tavuk Fileto Sandviç', price: '210', description: 'Marine tavuk fileto, mantar, peynir, marul ve ballı hardallı mayonez', image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=600&auto=format&fit=crop&ar=16:10' },
            { name: 'Eritilmiş Peynirli Hot Dog', price: '180', description: 'Fırınlanmış kaliteli sosis, eritilmiş pizza peyniri, acı sos ve çıtır soğan', image: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Tavuklu Alfredo Penne', price: '260', description: 'Penne makarna, ızgara tavuk fileto, özel krema ve mantar sosu, parmesan peyniri', image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Fırınlanmış Sıcak Jambonlu Sandviç', price: '190', description: 'Dana ve tavuk jambon, eritilmiş çedar peyniri, sıcak baget ekmeğinde özel sos', image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=600&auto=format&fit=crop&ar=1:1' }
          ]
        }
      ];
    }
    // Fallback/Persian
    return [
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
    if (isEn) {
      return [
        {
          name: "Men's Clothing",
          items: [
            { name: 'Oversized Cotton T-Shirt', price: '450', description: 'Made of 100% double-faced cotton fabric, loose and cool fit suitable for summer', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Classic Straight Jeans', price: '850', description: 'Thick stone-washed denim, durable double stitching', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop&ar=3:4' },
            { name: 'Autumn Hooded Hoodie', price: '950', description: 'Warm 3-thread brushed fleece hoodie, kangaroo pocket with drawstring, suitable for autumn and winter', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Wool Sport Blazer', price: '1450', description: 'Slim fit cut, fully lined inside, suitable for semi-formal styles', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Long Sleeve Plaid Shirt', price: '490', description: 'Cotton and cool, button-down collar, various autumn colors', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600&auto=format&fit=crop&ar=3:4' }
          ]
        },
        {
          name: "Women's Clothing",
          items: [
            { name: 'Fine Knit Crop Top', price: '320', description: 'Soft and stretchy knit, available in white, black, and beige', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Mom Fit Jeans', price: '780', description: 'High-waist mom-style jeans, with mild and comfortable stretch', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Women\'s Long Waterproof Trench Coat', price: '1200', description: 'Waterproof memory fabric, belted and hooded, suitable for rainy days', image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Elegant Silk Blouse', price: '690', description: 'Ultra-soft satin silk fabric, stylish cuffed sleeves and bow-tie collar', image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Spring Long Pleated Skirt', price: '450', description: 'Light and comfortable pleated chiffon fabric, comfortable elastic waistband', image: 'https://images.unsplash.com/photo-1583496661160-fb4886a0edf6?q=80&w=600&auto=format&fit=crop&ar=3:4' }
          ]
        }
      ];
    } else if (isTr) {
      return [
        {
          name: 'Erkek Giyim',
          items: [
            { name: 'Pamuklu Oversize Tişört', price: '450', description: '%100 çift iplik pamuklu kumaş, yaz için rahat ve serin kalıp', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Klasik Düz Kesim Jean Pantolon', price: '850', description: 'Taşlanmış kalın kot kumaş, dayanıklı çift dikiş', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop&ar=3:4' },
            { name: 'Sonbahar Kapüşonlu Sweatshirt', price: '950', description: 'Üç iplik şardonlu sıcak tutan kapüşonlu, bağcıklı kanguru cep', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Yün Karışımlı Blazer Ceket', price: '1450', description: 'Slim fit kesim, iç astarlı, yarı resmi kombinler için ideal', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Uzun Kollu Ekose Gömlek', price: '490', description: 'Pamuklu ve serin tutan doku, düğmeli yaka, çeşitli sonbahar renkleri', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600&auto=format&fit=crop&ar=3:4' }
          ]
        },
        {
          name: 'Kadın Giyim',
          items: [
            { name: 'İnce Örgü Crop Top', price: '320', description: 'Yumuşak ve esnek örgü doku; beyaz, siyah ve bej renk seçenekleriyle', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Mom Fit Jean Pantolon', price: '780', description: 'Yüksek bel mom fit kesim, hafif esnek ve konforlu kumaş', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Kadın Uzun Su Geçirmez Trençkot', price: '1200', description: 'Su geçirmez memory kumaş, kuşaklı ve kapüşonlu, yağmurlu günler için', image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Şık İpek Bluz', price: '690', description: 'Yumuşacık saten ipek kumaş, şık manşetli kollar ve fiyonk yaka detayı', image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Uzun Pileli Baharlık Etek', price: '450', description: 'Hafif ve rahat şifon pileli kumaş, konforlu elastik bel bandı', image: 'https://images.unsplash.com/photo-1583496661160-fb4886a0edf6?q=80&w=600&auto=format&fit=crop&ar=3:4' }
          ]
        }
      ];
    }
    // Fallback/Persian
    return [
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
    if (isEn) {
      return [
        {
          name: 'Best Sellers',
          items: [
            { name: 'Shottt Golden Sample Product', price: '190', description: 'A sample product with premium details and description to test your catalog layout.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Shottt Silver Sample Product', price: '140', description: 'Second-tier sample product with economical price and description for layout testing.', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Luxury Decorative Item', price: '350', description: 'Minimal and beautiful design, matching various home decor styles.', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Digital Smartwatch', price: '850', description: 'Color AMOLED screen, health sensors, and 7-day long battery life.', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600&auto=format&fit=crop&ar=3:4' },
            { name: 'Wireless Noise Cancelling Headphones', price: '1200', description: 'Active ANC technology, powerful audio drivers, and ergonomic leather cushions', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop&ar=2:3' }
          ]
        },
        {
          name: 'Base Items',
          items: [
            { name: 'Base Item', price: '95', description: 'A sample base product with economical price and description.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'Canvas Travel Duffel Bag', price: '390', description: 'Thick and waterproof canvas, multiple side pockets, and wide, durable shoulder strap', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Classic Aviator Sunglasses', price: '450', description: 'Unbreakable glass lenses with full UV400 filter, ultra-light and hypoallergenic metal frame', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Sport Walking Sneakers', price: '690', description: 'Fully ergonomic PU sole, breathable mesh knit upper suitable for long wear', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop&ar=1:1' }
          ]
        }
      ];
    } else if (isTr) {
      return [
        {
          name: 'Çok Satanlar',
          items: [
            { name: 'Shottt Altın Örnek Ürün', price: '190', description: 'Katalog düzeninizi test etmeniz için premium detaylara ve açıklamalara sahip örnek ürün.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Shottt Gümüş Örnek Ürün', price: '140', description: 'Düzen testi için ekonomik fiyat ve açıklamaya sahip ikinci seviye örnek ürün.', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Lüks Dekoratif Ürün', price: '350', description: 'Çeşitli iç dekorasyon tarzlarıyla uyumlu, minimalist ve güzel tasarım.', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Dijital Akıllı Saat', price: '850', description: 'Renkli AMOLED ekran, sağlık sensörleri ve 7 günlük uzun pil ömrü.', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600&auto=format&fit=crop&ar=3:4' },
            { name: 'Kablosuz Gürültü Önleyici Kulaklık', price: '1200', description: 'Aktif ANC teknolojisi, güçlü ses sürücüleri ve ergonomik deri yastıklar', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop&ar=2:3' }
          ]
        },
        {
          name: 'Temel Ürünler',
          items: [
            { name: 'Temel Ürün', price: '95', description: 'Ekonomik fiyat ve açıklamaya sahip örnek temel ürün.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop&ar=1:1' },
            { name: 'Kanvas Seyahat Çantası', price: '390', description: 'Kalın ve su geçirmez kanvas, çok sayıda yan cep ve geniş, dayanıklı omuz askısı', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop&ar=4:3' },
            { name: 'Klasik Aviator Güneş Gözlüğü', price: '450', description: 'Tam UV400 filtreye sahip kırılmaz cam lensler, ultra hafif metal çerçeve', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop&ar=2:3' },
            { name: 'Spor Yürüyüş Ayakkabısı', price: '690', description: 'Ergonomik PU taban, uzun süreli kullanıma uygun nefes alabilen file örgü saya', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop&ar=1:1' }
          ]
        }
      ];
    }
    // Fallback/Persian
    return [
      {
        name: 'محصولات پرفروش',
        items: [
          { name: 'محصول نمونه طلایی شات', price: '190', description: 'یک نمونه محصول با کیفیت و مشخصات کامل جهت بررسی چیدمان کاتالوگ شما.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop&ar=4:3' },
          { name: 'محصول نمونه نقره‌ای شات', price: '140', description: 'محصول نمونه پایه دوم با قیمت و توضیحات اقتصادی جهت چیدمان', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop&ar=4:3' },
          { name: 'محصول دکوراتیو لوکس', price: '350', description: 'طراحی مینیمال و زیبا، هماهنگ با انواع سبک‌های چیدمان داخلی', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop&ar=2:3' },
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
}
