import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { membersTable } from "./members";

export const graduationsTable = pgTable("graduations", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => membersTable.id, { onDelete: "cascade" }),
  previousWing: text("previous_wing").notNull(),
  newWing: text("new_wing").notNull(),
  graduatedAt: timestamp("graduated_at").defaultNow().notNull(),
});

export const insertGraduationSchema = createInsertSchema(graduationsTable).omit({ id: true, graduatedAt: true });

export type InsertGraduation = z.infer<typeof insertGraduationSchema>;
export type Graduation = typeof graduationsTable.$inferSelect;
