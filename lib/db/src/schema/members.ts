import { pgTable, serial, text, date, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const wingEnum = pgEnum("wing", ["atfal_sughir", "atfal_kabir", "khuddam"]);

export const membersTable = pgTable("members", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  wing: wingEnum("wing").notNull(),
  sector: text("sector").notNull(),
  region: text("region").notNull(),
  zone: text("zone").notNull(),
  circuit: text("circuit").notNull(),
  jamaat: text("jamaat").notNull(),
  photoUrl: text("photo_url"),
  guardianName: text("guardian_name"),
  guardianType: text("guardian_type"),
  guardianPhone: text("guardian_phone"),
  guardianEmail: text("guardian_email"),
  guardianAddress: text("guardian_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const memberHistoryTable = pgTable("member_history", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => membersTable.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  description: text("description").notNull(),
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMemberSchema = createInsertSchema(membersTable).omit({ id: true, wing: true, createdAt: true, updatedAt: true });
export const insertMemberHistorySchema = createInsertSchema(memberHistoryTable).omit({ id: true, createdAt: true });

export type InsertMember = z.infer<typeof insertMemberSchema>;
export type InsertMemberHistory = z.infer<typeof insertMemberHistorySchema>;
export type Member = typeof membersTable.$inferSelect;
export type MemberHistory = typeof memberHistoryTable.$inferSelect;
