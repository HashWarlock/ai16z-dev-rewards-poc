import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  github_id: text("github_id").unique(),
  github_username: text("github_username"),
  github_avatar_url: text("github_avatar_url"),
  discord_id: text("discord_id").unique(),
  discord_username: text("discord_username"),
  discord_avatar_url: text("discord_avatar_url"),
  github_created_at: timestamp("github_created_at"),
  discord_created_at: timestamp("discord_created_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
