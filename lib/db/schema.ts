import { pgTable, text, serial, timestamp, jsonb, boolean, integer, decimal } from 'drizzle-orm/pg-core';

// Users table (admin users)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: text('role').default('admin'),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Website content sections
export const content = pgTable('content', {
  id: serial('id').primaryKey(),
  section: text('section').notNull().unique(), // 'hero', 'about', 'footer', etc.
  data: jsonb('data').notNull(), // Flexible JSON structure for each section
  published: boolean('published').default(false),
  publishedAt: timestamp('published_at'),
  updatedBy: integer('updated_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Coaching packages
export const packages = pgTable('packages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }),
  duration: text('duration'), // "12 weeks", "6 months", etc.
  features: jsonb('features'), // Array of features
  ctaText: text('cta_text').default('Apply Now'),
  ctaLink: text('cta_link').default('/apply'),
  order: integer('order').default(0),
  active: boolean('active').default(true),
  recommended: boolean('recommended').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Branding settings
export const branding = pgTable('branding', {
  id: serial('id').primaryKey(),
  logo: text('logo'),
  logoDark: text('logo_dark'),
  favicon: text('favicon'),
  primaryColor: text('primary_color').default('#0ea5e9'),
  secondaryColor: text('secondary_color').default('#14b8a6'),
  accentColor: text('accent_color').default('#0ea5e9'),
  fontHeading: text('font_heading').default('Archivo'),
  fontBody: text('font_body').default('Inter'),
  theme: text('theme').default('dark'), // 'light' | 'dark' | 'auto'
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Testimonials
export const testimonials = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role'),
  company: text('company'),
  content: text('content').notNull(),
  avatar: text('avatar'),
  rating: integer('rating').default(5),
  featured: boolean('featured').default(false),
  order: integer('order').default(0),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Applications (from apply form)
export const applications = pgTable('applications', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  data: jsonb('data').notNull(), // All form data
  status: text('status').default('new'), // 'new', 'reviewed', 'accepted', 'rejected'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Newsletter subscribers
export const subscribers = pgTable('subscribers', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  subscribed: boolean('subscribed').default(true),
  source: text('source'), // 'homepage', 'footer', 'apply-page', etc.
  subscribedAt: timestamp('subscribed_at').defaultNow(),
  unsubscribedAt: timestamp('unsubscribed_at'),
});

// Messages (from contact form)
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  service: text('service'),
  message: text('message').notNull(),
  read: boolean('read').default(false),
  replied: boolean('replied').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Analytics (simple tracking)
export const analytics = pgTable('analytics', {
  id: serial('id').primaryKey(),
  date: timestamp('date').notNull(),
  pageViews: integer('page_views').default(0),
  uniqueVisitors: integer('unique_visitors').default(0),
  applications: integer('applications').default(0),
  subscriptions: integer('subscriptions').default(0),
  messages: integer('messages').default(0),
});

// Activity log
export const activityLog = pgTable('activity_log', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(), // 'content_updated', 'package_created', etc.
  resource: text('resource'), // 'hero', 'package', 'branding', etc.
  resourceId: integer('resource_id'),
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Types
export type User = typeof users.$inferSelect;
export type Content = typeof content.$inferSelect;
export type Package = typeof packages.$inferSelect;
export type Branding = typeof branding.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type ActivityLog = typeof activityLog.$inferSelect;
