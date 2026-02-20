import { relations } from 'drizzle-orm'
import { users, profiles, mentorships, bookings, categories } from './schema.js'

export const userRelations = relations(users, ({ one, many }) => ({
    profile: one(profiles, {
        fields: [users.id],
        references: [profiles.userId],
    }),
    mentorships: many(mentorships),
    bookings: many(bookings),
}))

export const profileRelations = relations(profiles, ({ one }) => ({
    user: one(users, {
        fields: [profiles.userId],
        references: [users.id],
    }),
}))

export const mentorshipRelations = relations(mentorships, ({ one, many }) => ({
    mentor: one(users, {
        fields: [mentorships.mentorId],
        references: [users.id],
    }),
    category: one(categories, {
        fields: [mentorships.categoryId],
        references: [categories.id],
    }),
    bookings: many(bookings),
}))

export const bookingRelations = relations(bookings, ({ one }) => ({
    student: one(users, {
        fields: [bookings.studentId],
        references: [users.id],
    }),
    mentorship: one(mentorships, {
        fields: [bookings.mentorshipId],
        references: [mentorships.id],
    }),
}))

export const categoryRelations = relations(categories, ({ many }) => ({
    mentorships: many(mentorships),
}))
