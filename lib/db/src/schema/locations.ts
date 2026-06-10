import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const circuitsTable = pgTable("circuits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  zone: text("zone"),
  usageCount: integer("usage_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jamaatsTable = pgTable("jamaats", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  circuit: text("circuit"),
  usageCount: integer("usage_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCircuitSchema = createInsertSchema(circuitsTable).omit({ id: true, usageCount: true, createdAt: true });
export const insertJamaatSchema = createInsertSchema(jamaatsTable).omit({ id: true, usageCount: true, createdAt: true });

export type InsertCircuit = z.infer<typeof insertCircuitSchema>;
export type InsertJamaat = z.infer<typeof insertJamaatSchema>;
export type Circuit = typeof circuitsTable.$inferSelect;
export type Jamaat = typeof jamaatsTable.$inferSelect;
