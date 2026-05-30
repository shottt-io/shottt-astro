import { db, client } from './db';
import { 
  vendors as dbVendors, 
  categories as dbCategories, 
  menuItems as dbMenuItems,
  users as dbUsers,
  vendorUsers as dbVendorUsers
} from './schema';
import { vendors as mockVendors } from '../data/vendors';
import { createHash } from 'crypto';

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

async function seed() {
  console.log('⏳ Starting database seeding...');

  try {
    // 1. Clear existing data in reverse dependency order
    console.log('🧹 Clearing old database records...');
    await db.delete(dbMenuItems);
    await db.delete(dbCategories);
    await db.delete(dbVendorUsers);
    await db.delete(dbUsers);
    await db.delete(dbVendors);
    console.log('✅ Database cleared.');

    const vendorIdMap = new Map<string, number>();

    // 2. Insert mock vendors, categories, and products
    for (const vendor of mockVendors) {
      console.log(`➕ Inserting vendor: ${vendor.name}...`);
      
      const [insertedVendor] = await db.insert(dbVendors).values({
        slug: vendor.slug,
        name: vendor.name,
        type: vendor.type,
        slogan: vendor.slogan,
        description: vendor.description,
        defaultLayout: vendor.defaultLayout,
        logoIcon: vendor.logoIcon,
        logo: vendor.logo,
      }).returning({ id: dbVendors.id });

      const vendorId = insertedVendor.id;
      vendorIdMap.set(vendor.slug, vendorId);
      
      let sortOrder = 0;

      for (const category of vendor.categories) {
        console.log(`  📂 Inserting category: ${category.name}...`);
        
        const [insertedCategory] = await db.insert(dbCategories).values({
          vendorId: vendorId,
          name: category.name,
          sortOrder: sortOrder++,
          status: 'available',
        }).returning({ id: dbCategories.id });

        const categoryId = insertedCategory.id;

        let itemSortOrder = 0;

        for (const item of category.items) {
          console.log(`    🍔 Inserting item: ${item.name}...`);
          
          await db.insert(dbMenuItems).values({
            categoryId: categoryId,
            name: item.name,
            slug: item.id,
            price: item.price,
            image: item.image,
            description: item.description,
            discount: item.discount ? {
              originalPrice: item.discount.originalPrice,
              discountText: item.discount.discountText,
            } : undefined,
            span2: item.span2 || false,
            sections: item.sections || [],
            status: 'available',
            sortOrder: itemSortOrder++,
          });
        }
      }
    }

    // 3. Insert admin users and map permissions
    console.log('👤 Inserting admin users...');
    const usersData = [
      { name: 'مدیر کافه لومیر', username: 'lumiere', password: hashPassword('lumiere123'), targetSlugs: ['cafe-lumiere'] },
      { name: 'مدیر بیسترو دادا', username: 'dada', password: hashPassword('dada123'), targetSlugs: ['bistro-dada'] },
      { name: 'مدیر آتلیه شیرینی', username: 'pastry', password: hashPassword('pastry123'), targetSlugs: ['pastry-atelier'] },
      { name: 'مدیر کل مجموعه‌ها', username: 'super', password: hashPassword('super123'), targetSlugs: ['cafe-lumiere', 'bistro-dada', 'pastry-atelier'] },
    ];

    for (const u of usersData) {
      console.log(`➕ Inserting user: ${u.username}...`);
      const [insertedUser] = await db.insert(dbUsers).values({
        username: u.username,
        password: u.password,
        name: u.name,
      }).returning({ id: dbUsers.id });

      for (const slug of u.targetSlugs) {
        const vendorId = vendorIdMap.get(slug);
        if (vendorId) {
          await db.insert(dbVendorUsers).values({
            userId: insertedUser.id,
            vendorId: vendorId,
          });
          console.log(`  🔗 Linked user ${u.username} to vendor: ${slug}`);
        }
      }
    }

    console.log('🎉 Database seeding completed successfully.');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close the postgres database client connection to exit the process
    console.log('🔌 Closing database connection...');
    await client.end();
    console.log('👋 Finished.');
  }
}

seed();
