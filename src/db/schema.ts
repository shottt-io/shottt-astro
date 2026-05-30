import { pgTable, serial, varchar, text, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

export interface DBProductSection {
  title?: string;
  description?: string;
  chips?: string[];
}

export interface DBDiscount {
  originalPrice: string;
  discountText: string;
}

// 1. Vendors Table
export const vendors = pgTable('vendors', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 255 }).notNull(),
  slogan: varchar('slogan', { length: 255 }).notNull(),
  description: text('description').notNull(),
  defaultLayout: varchar('default_layout', { length: 50 }).default('pinterest').notNull(),
  logoIcon: varchar('logo_icon', { length: 50 }).notNull(),
  logo: varchar('logo', { length: 2048 }).notNull(),
});

// 2. Categories Table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendors.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  status: varchar('status', { length: 50 }).default('available').notNull(),
});

// 3. Menu Items Table (handles sections & discounts as JSONB)
export const menuItems = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }),
  price: varchar('price', { length: 50 }).notNull(),
  image: varchar('image', { length: 2048 }),
  description: text('description'),
  discount: jsonb('discount').$type<DBDiscount>(),
  span2: boolean('span2').default(false).notNull(),
  sections: jsonb('sections').$type<DBProductSection[]>().default([]).notNull(),
  status: varchar('status', { length: 50 }).default('available').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
});

// 4. Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(), // SHA-256 hash
  name: varchar('name', { length: 255 }),
});

// 5. Vendor Users Table (Join Table)
export const vendorUsers = pgTable('vendor_users', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendors.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
});

