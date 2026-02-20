import { pgTable, uuid, varchar, pgEnum, integer, timestamp, decimal } from 'drizzle-orm/pg-core';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';

const userRoleEnum = pgEnum('user_role', ['mentor', 'student', 'admin']);
const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'cancelled']);

export const users = pgTable('users', {
  id: uuid('user_id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull(),
});


export const profiles = pgTable('profiles', {
    id: uuid('profile_id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .unique(),
    bio: varchar('bio').notNull(),
    linkedinUrl: varchar('linkedin_url', { length: 255 }),
    avatarUrl: varchar('avatar_url', { length: 500 }),
});

export const categories = pgTable('categories', {
    id: uuid('category_id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull().unique(),
});

export const mentorships = pgTable('mentorships', {
    id: uuid('mentorship_id').primaryKey().defaultRandom(),
    mentorId: uuid('mentor_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    categoryId: uuid('category_id')
        .references(() => categories.id, { onDelete: 'cascade' })
        .notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: varchar('description', { length: 255 }).notNull(),
    price: decimal('price').notNull(),
    slots: integer('slots').notNull(),
    duration: integer('duration').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const bookings = pgTable('bookings', {
    id: uuid('booking_id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    mentorshipId: uuid('mentorship_id')
        .references(() => mentorships.id, { onDelete: 'cascade' })
        .notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    status: bookingStatusEnum('status').notNull(),
    scheduledAt: timestamp('scheduled_at').notNull(),
});

// Entity types
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Mentorship = typeof mentorships.$inferSelect;
export type Booking = typeof bookings.$inferSelect;

// Select schemas (para validar respuestas / lectura)
export const selectUserSchema = createSelectSchema(users);
export const selectProfileSchema = createSelectSchema(profiles);
export const selectCategorySchema = createSelectSchema(categories);
export const selectMentorshipSchema = createSelectSchema(mentorships);
export const selectBookingSchema = createSelectSchema(bookings);

// Insert schemas (para validar datos de creación)
export const insertUserSchema = createInsertSchema(users);
export const insertProfileSchema = createInsertSchema(profiles);
export const insertCategorySchema = createInsertSchema(categories);
export const insertMentorshipSchema = createInsertSchema(mentorships);
export const insertBookingSchema = createInsertSchema(bookings);