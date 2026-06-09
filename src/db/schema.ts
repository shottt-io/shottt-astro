import { pgTable, serial, varchar, text, boolean, integer, jsonb, date, primaryKey, timestamp } from 'drizzle-orm/pg-core';

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
  theme: varchar('theme', { length: 50 }).default('light').notNull(),
  logoIcon: varchar('logo_icon', { length: 50 }).notNull(),
  logo: varchar('logo', { length: 2048 }).notNull(),
  city: varchar('city', { length: 255 }),
  country: varchar('country', { length: 255 }),
  locale: varchar('locale', { length: 10 }),
  currency: varchar('currency', { length: 50 }),
  timezone: varchar('timezone', { length: 100 }).default('Asia/Tehran').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }).defaultNow().notNull(),
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
  phone: varchar('phone', { length: 50 }),
});

// 5. Vendor Users Table (Join Table)
export const vendorUsers = pgTable('vendor_users', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendors.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
});

// 6. Analytics Daily Metrics (Page views / unique visits)
export const analyticsDailyMetrics = pgTable('analytics_daily_metrics', {
  vendorId: integer('vendor_id').references(() => vendors.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  pageViews: integer('page_views').default(0).notNull(),
  uniqueVisits: integer('unique_visits').default(0).notNull(),
}, (table) => [
  primaryKey({ columns: [table.vendorId, table.date] }),
]);

// 7. Analytics Daily Items (Item Impressions)
export const analyticsDailyItems = pgTable('analytics_daily_items', {
  vendorId: integer('vendor_id').references(() => vendors.id, { onDelete: 'cascade' }).notNull(),
  itemId: integer('item_id').references(() => menuItems.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  impressions: integer('impressions').default(0).notNull(),
}, (table) => [
  primaryKey({ columns: [table.vendorId, table.itemId, table.date] }),
]);

// 8. DB Ticket Message structure inside JSONB
export interface DBTicketMessage {
  senderId: number;
  senderName: string;
  senderUsername: string;
  message: string;
  attachmentUrl?: string;
  createdAt: string; // ISO String
}

// 9. Homepage Daily Metrics (Landing page visits)
export const homepageDailyMetrics = pgTable('homepage_daily_metrics', {
  date: date('date').notNull().primaryKey(),
  pageViews: integer('page_views').default(0).notNull(),
  uniqueVisits: integer('unique_visits').default(0).notNull(),
});

// 10. Tickets Table
export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendors.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).default('open').notNull(), // 'open', 'answered', 'closed'
  messages: jsonb('messages').$type<DBTicketMessage[]>().default([]).notNull(),
  seenByVendor: boolean('seen_by_vendor').default(true).notNull(),
  seenBySuper: boolean('seen_by_super').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});


