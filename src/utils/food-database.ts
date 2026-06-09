export interface FoodDatabaseItem {
  id: string;
  name: string; // Combined Farsi/English keyword name for the AI to match
  url: string;  // Verified working Unsplash URL
}

export const foodDatabase: FoodDatabaseItem[] = [
  // --- PIZZAS ---
  { id: "pizza_pepperoni", name: "پیتزا پپرونی Pepperoni Pizza", url: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop" },
  { id: "pizza_margherita", name: "پیتزا مارگاریتا Margherita Pizza", url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop" },
  { id: "pizza_supreme", name: "پیتزا مخلوط مخصوص Supreme Mixed Pizza", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop" },
  { id: "pizza_chicken_mushroom", name: "پیتزا مرغ و قارچ Chicken Mushroom Pizza", url: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=600&auto=format&fit=crop" },
  { id: "pizza_steak_beef", name: "پیتزا استیک گوشت Steak Beef Pizza", url: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=600&auto=format&fit=crop" },
  { id: "pizza_vegetable", name: "پیتزا سبزیجات Vegetarian Veggie Pizza", url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop" },
  { id: "pizza_garlic", name: "پیتزا سیر و استیک Garlic Steak Pizza", url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop" },
  { id: "pizza_four_cheese", name: "پیتزا چهار پنیر Four Cheese Pizza Quattro Formaggi", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop" },
  { id: "pizza_barbecue", name: "پیتزا باربیکیو چیکن BBQ Chicken Pizza", url: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=600&auto=format&fit=crop" },
  { id: "pizza_calzone", name: "پیتزا کالزونه Calzone Pizza", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop" },

  // --- BURGERS ---
  { id: "burger_classic", name: "همبرگر کلاسیک Classic Beef Burger", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop" },
  { id: "burger_cheese", name: "چیزبرگر Cheeseburger", url: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop" },
  { id: "burger_double", name: "دبل چیزبرگر Double Cheeseburger", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop" },
  { id: "burger_mushroom", name: "ماشروم برگر قارچ برگر Mushroom Swiss Burger", url: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=600&auto=format&fit=crop" },
  { id: "burger_chicken", name: "چیکن برگر برگر مرغ Chicken Burger Zinger Crispy", url: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?q=80&w=600&auto=format&fit=crop" },
  { id: "burger_smokey", name: "اسموکی برگر Smokey BBQ Burger", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop" },
  { id: "burger_jalapeno", name: "هالوپینو برگر تند Spicy Jalapeno Burger", url: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=600&auto=format&fit=crop" },

  // --- SANDWICHES ---
  { id: "sandwich_hotdog", name: "هات داگ Hot Dog Sausage", url: "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?q=80&w=600&auto=format&fit=crop" },
  { id: "sandwich_hotdog_cheese", name: "هات داگ پنیری Cheesy Hot Dog", url: "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?q=80&w=600&auto=format&fit=crop" },
  { id: "sandwich_club", name: "کلاب ساندویچ Club Sandwich", url: "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?q=80&w=600&auto=format&fit=crop" },
  { id: "sandwich_chicken_fillet", name: "ساندویچ فیله مرغ مرغ گریل Grilled Chicken Fillet Sandwich", url: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=600&auto=format&fit=crop" },
  { id: "sandwich_steak", name: "ساندویچ استیک گوشت Steak Sandwich Roast Beef", url: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=600&auto=format&fit=crop" },
  { id: "sandwich_panini_chicken", name: "پانینی مرغ Chicken Panini Toast", url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=600&auto=format&fit=crop" },
  { id: "sandwich_panini_meat", name: "پانینی گوشت Beef Panini Toast", url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=600&auto=format&fit=crop" },
  { id: "sandwich_wrap", name: "رپ مرغ گوشت Tortilla Wrap Burrito Shawarma", url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=600&auto=format&fit=crop" },

  // --- PASTA & ITALIAN ---
  { id: "pasta_alfredo_chicken", name: "پاستا آلفردو مرغ چیکن آلفردو Penne Alfredo Chicken", url: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=600&auto=format&fit=crop" },
  { id: "pasta_bolognese", name: "اسپاگتی بلونز ماکارونی گوشت Spaghetti Bolognese Meat Pasta", url: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?q=80&w=600&auto=format&fit=crop" },
  { id: "pasta_pesto", name: "پاستا پستو Pesto Pasta Penne", url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop" },
  { id: "pasta_lasagna", name: "لازانیا گوشت قارچ Lasagna Beef Mushroom", url: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=600&auto=format&fit=crop" },
  { id: "pasta_carbonara", name: "پاستا کاربونارا Pasta Carbonara", url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop" },

  // --- SALADS ---
  { id: "salad_caesar_chicken", name: "سالاد سزار مرغ سوخاری گریل Caesar Salad Chicken", url: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=600&auto=format&fit=crop" },
  { id: "salad_green_garden", name: "سالاد سبز فصل Garden Green Salad Fresh", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop" },
  { id: "salad_greek", name: "سالاد یونانی فتوش Greek Salad Feta Olive", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&auto=format&fit=crop" },
  { id: "salad_pasta", name: "سالاد ماکارونی پاستا Pasta Salad", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&auto=format&fit=crop" },

  // --- APPETIZERS & SOUPS ---
  { id: "appetizer_fries_classic", name: "سیب زمینی سرخ کرده خلال سیب زمینی French Fries Chips Potato", url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop" },
  { id: "appetizer_fries_cheese", name: "سیب زمینی سرخ کرده با پنیر سیب زمینی ویژه Cheesy Loaded French Fries", url: "https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=600&auto=format&fit=crop" },
  { id: "appetizer_onion_rings", name: "پیاز حلقه ای سوخاری Onion Rings Crispy", url: "https://images.unsplash.com/photo-1639024471283-2bc7b3c6a267?q=80&w=600&auto=format&fit=crop" },
  { id: "appetizer_garlic_bread", name: "نان سیر Garlic Bread Toast", url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop" },
  { id: "appetizer_wings_spicy", name: "بال مرغ سوخاری اسپایسی تند Spicy Chicken Wings Buffalo Fried", url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=600&auto=format&fit=crop" },
  { id: "appetizer_soup_mushroom", name: "سوپ قارچ سوپ جو Creamy Mushroom Barley Soup Warm", url: "https://images.unsplash.com/photo-1547592165-e1d17fed6005?q=80&w=600&auto=format&fit=crop" },
  { id: "appetizer_nuggets", name: "ناگت مرغ فیله استریپس سوخاری Chicken Nuggets Strips Fried", url: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?q=80&w=600&auto=format&fit=crop" },

  // --- TRADITIONAL PERSIAN (STEWS & KEBABS) ---
  { id: "persian_kebab_koobideh", name: "کباب کوبیده کوبیده چلوکباب Kebab Koobideh Minced Beef Skewer Rice", url: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=600&auto=format&fit=crop" },
  { id: "persian_joojeh_kebab", name: "جوجه کباب جوجه چلو جوجه Joojeh Kebab Saffron Grilled Chicken Rice", url: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=600&auto=format&fit=crop" },
  { id: "persian_kebab_barg_chenje", name: "کباب برگ چنجه کباب سلطانی Kebab Barg Chenjeh Saffron Meat Skewer", url: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop" },
  { id: "persian_stew_ghormeh", name: "خورشت قرمه سبزی قورمه سبزی چلو قرمه Ghormeh Sabzi Herb Stew Rice", url: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=600&auto=format&fit=crop" },
  { id: "persian_stew_gheyme", name: "خورشت قیمه قیمه بادمجان قیمه سیب زمینی Gheyme Split Pea Stew Rice", url: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=600&auto=format&fit=crop" },
  { id: "persian_stew_fesenjan", name: "خورشت فسنجان فسنجون Fesenjan Pomegranate Walnut Stew Chicken", url: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?q=80&w=600&auto=format&fit=crop" },
  { id: "persian_tahchin", name: "ته چین مرغ ته چین گوشت Tahchin Saffron Rice Cake Chicken", url: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?q=80&w=600&auto=format&fit=crop" },
  { id: "persian_kashk_bademjan", name: "کشک بادمجان کشک بادنجان Kashk Bademjan Eggplant Dip Whey", url: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=600&auto=format&fit=crop" },
  { id: "persian_dizi", name: "دیزی آبگوشت Dizi Abgoosht Traditional Mutton Stew", url: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=600&auto=format&fit=crop" },

  // --- TURKISH FOOD ---
  { id: "turkish_doner_meat", name: "دونر کباب گوشت کباب ترکی گوشت Beef Doner Kebab Shawarma Gyro", url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=600&auto=format&fit=crop" },
  { id: "turkish_doner_chicken", name: "دونر کباب مرغ کباب ترکی مرغ Chicken Doner Kebab Shawarma Gyro", url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=600&auto=format&fit=crop" },
  { id: "turkish_lahmacun", name: "لاهماجون پیتزا ترکی Lahmacun Turkish Pizza Flatbread", url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=600&auto=format&fit=crop" },
  { id: "turkish_kofte", name: "کوفته ترکی کباب کوفته Kofte Turkish Meatballs Grilled", url: "https://images.unsplash.com/photo-1529042410759-befb1204b468?q=80&w=600&auto=format&fit=crop" },
  { id: "turkish_pide", name: "پیده گوشت پیده پنیری Pide Turkish Flatbread Boat Shaped", url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=600&auto=format&fit=crop" },

  // --- SEAFOOD ---
  { id: "seafood_salmon_steak", name: "استیک سالمون فیله سالمون Salmon Steak Fish Fillet Grilled", url: "https://images.unsplash.com/photo-1485962398705-ef6a13c41e8f?q=80&w=600&auto=format&fit=crop" },
  { id: "seafood_shrimp_fried", name: "میگو سوخاری میگو پفکی Fried Shrimp Tempura Prawns Crispy", url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=600&auto=format&fit=crop" },
  { id: "seafood_sushi_rolls", name: "سوشی رول سوشی مکی Sushi Maki Rolls Sashimi Japanese Platter", url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&auto=format&fit=crop" },
  { id: "seafood_fish_chips", name: "فیله ماهی سوخاری ماهی و چیپس Fish and Chips Crispy Cod", url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=600&auto=format&fit=crop" },

  // --- BAKERY & BREAKFAST ---
  { id: "bakery_croissant_butter", name: "کرواسان کره‌ای ساده Butter Croissant French Pastry", url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop" },
  { id: "bakery_pancakes_syrup", name: "پنیکیک عسل شکلات Pancakes Honey Syrup Breakfast", url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=600&auto=format&fit=crop" },
  { id: "bakery_waffle_nutella", name: "وافل نوتلا شکلاتی Waffle Nutella Chocolate Banana", url: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=600&auto=format&fit=crop" },
  { id: "bakery_avocado_toast", name: "تست آووکادو صبحانه Avocado Toast Poached Egg", url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=600&auto=format&fit=crop" },
  { id: "bakery_scrambled_eggs", name: "املت صبحانه نیمرو سوسیس تخم مرغ Scrambled Eggs Omelette Sausage", url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=600&auto=format&fit=crop" },

  // --- CAKES & DESSERTS ---
  { id: "dessert_cheesecake_strawberry", name: "چیزکیک توت فرنگی چیزکیک نیویورکی Strawberry Cheesecake Slice", url: "https://images.unsplash.com/photo-1524351199679-46cddf530c04?q=80&w=600&auto=format&fit=crop" },
  { id: "dessert_chocolate_cake", name: "کیک شکلاتی دبل چاکلت Chocolate Fudge Cake Ganache Slice", url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop" },
  { id: "dessert_tiramisu", name: "تیرامیسو Tiramisu Italian Sweet Coffee Cocoa", url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=600&auto=format&fit=crop" },
  { id: "dessert_icecream_sundae", name: "بستنی اسکوپی بستنی شکلاتی میوه ای Ice Cream Bowl Scoops Sundae", url: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=600&auto=format&fit=crop" },
  { id: "dessert_muffin", name: "مافن کیک فنجانی شکلاتی زغال اخته Chocolate Blueberry Cupcake Muffin", url: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=600&auto=format&fit=crop" },
  { id: "dessert_fruit_tart", name: "تارت میوه تارت توت فرنگی پسته Fruit Strawberry Tart Custard", url: "https://images.unsplash.com/photo-1519869325930-281384150729?q=80&w=600&auto=format&fit=crop" },
  { id: "dessert_brownie", name: "براونی شکلاتی Brownie Fudge Hot Chocolate Sauce", url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop" },

  // --- COFFEE & HOT DRINKS ---
  { id: "drink_espresso_double", name: "اسپرسو دبل اسپرسو شات Double Espresso Shot Arabica Coffee", url: "https://images.unsplash.com/photo-1510591509098-f4fdc6d37043?q=80&w=600&auto=format&fit=crop" },
  { id: "drink_latte_art", name: "قهوه لته لاته آرت Caffe Latte Art Steamed Milk Foam", url: "https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=600&auto=format&fit=crop" },
  { id: "drink_cappuccino_foam", name: "کاپوچینو Cappuccino Double Espresso Frothed Milk Cocoa", url: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=600&auto=format&fit=crop" },
  { id: "drink_americano_hot", name: "قهوه آمریکانو قهوه سیاه Caffe Americano Hot Black Coffee", url: "https://images.unsplash.com/photo-1510972527409-cef6e4a4d6f2?q=80&w=600&auto=format&fit=crop" },
  { id: "drink_hot_chocolate_foam", name: "هات چاکلت شکلات داغ با خامه Hot Chocolate Whipped Cream Marshmallow", url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=600&auto=format&fit=crop" },
  { id: "drink_turkish_coffee", name: "قهوه ترکی Turkish Coffee Traditional Pot Cup", url: "https://images.unsplash.com/photo-1510972527409-cef6e4a4d6f2?q=80&w=600&auto=format&fit=crop" },
  { id: "drink_mocha_hot", name: "قهوه موکا شکلات Mocha Caffe Hot Chocolate Espresso", url: "https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=600&auto=format&fit=crop" },

  // --- JUICE & COLD DRINKS ---
  { id: "drink_mojito_mint", name: "موهیتو موهیتو نعناع لیمو Mojito Mint Lime Cocktail Soda Ice", url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop" },
  { id: "drink_lemonade_fresh", name: "لیموناد لیموناد طبیعی Fresh Lemonade Lemon Juice Sparkling", url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop" },
  { id: "drink_orange_juice_fresh", name: "آب پرتقال طبیعی آب پرتقال Orange Juice Fresh Squeezed Citrus", url: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=600&auto=format&fit=crop" },
  { id: "drink_cola_soda", name: "نوشابه کولا پپسی کوکاکولا نوشابه مشکی زرد Coca Cola Pepsi Soda Can Bottle Ice", url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop" },
  { id: "drink_milkshake_chocolate", name: "میلک شیک شکلات شیک شکلاتی Chocolate Milkshake Whipped Cream", url: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?q=80&w=600&auto=format&fit=crop" },
  { id: "drink_milkshake_strawberry", name: "شیک توت فرنگی میلک شیک توت فرنگی Strawberry Milkshake Ice Cream", url: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?q=80&w=600&auto=format&fit=crop" },
  { id: "drink_iced_latte", name: "آیس لته آیس قهوه Iced Caffe Latte Ice Milk Espresso", url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop" },
  { id: "drink_iced_americano", name: "آیس آمریکانو Iced Americano Ice Black Coffee Espresso", url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop" },
  { id: "drink_cold_brew", name: "کولد برو قهوه دم سرد Cold Brew Bottle Ice Specialty Coffee", url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop" },
  { id: "drink_smoothie_berry", name: "اسموتی توت فرنگی اسموتی بری Mixed Berry Smoothie Strawberry Raspberry", url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=600&auto=format&fit=crop" },
  { id: "drink_iced_tea", name: "آیس تی چای یخ Iced Tea Lemon Mint Peach Peach", url: "https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=600&auto=format&fit=crop" },

  // --- TRADITIONAL DRINKS & SIDES ---
  { id: "drink_traditional_doogh", name: "دوغ پارچ دوغ Doogh Yogurt Drink Mint Salted Persian", url: "https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=600&auto=format&fit=crop" },
  { id: "drink_traditional_sherbet", name: "شربت زعفران شربت بیدمشک خاکشیر Saffron Chia Seed Sherbet Rosewater", url: "https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=600&auto=format&fit=crop" }
];
