import { db, client } from './db';
import { vendors as dbVendors, categories as dbCategories, menuItems as dbMenuItems } from './schema';
import { vendors as mockVendors } from '../data/vendors';

async function seed() {
  console.log('⏳ Starting database seeding...');

  try {
    // 1. Clear existing data in reverse dependency order
    console.log('🧹 Clearing old database records...');
    await db.delete(dbMenuItems);
    await db.delete(dbCategories);
    await db.delete(dbVendors);
    console.log('✅ Database cleared.');

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
        coverImage: vendor.coverImage,
      }).returning({ id: dbVendors.id });

      const vendorId = insertedVendor.id;
      let sortOrder = 0;

      for (const category of vendor.categories) {
        console.log(`  📂 Inserting category: ${category.name}...`);
        
        const [insertedCategory] = await db.insert(dbCategories).values({
          vendorId: vendorId,
          name: category.name,
          sortOrder: sortOrder++,
        }).returning({ id: dbCategories.id });

        const categoryId = insertedCategory.id;

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
          });
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
