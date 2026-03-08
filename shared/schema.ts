import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  radarEnabled: boolean("radar_enabled").default(false).notNull(),
  aiEnabled: boolean("ai_enabled").default(true).notNull(),
  openRouterApiKey: text("openrouter_api_key"),
});

export const keywords = pgTable("keywords", {
  id: serial("id").primaryKey(),
  word: text("word").notNull().unique(),
});

export const telegramAccounts = pgTable("telegram_accounts", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  apiId: integer("api_id").notNull(),
  apiHash: text("api_hash").notNull(),
  sessionString: text("session_string"),
  targetGroup: text("target_group").notNull(),
  status: text("status").notNull().default("pending"), // pending, active, error
});

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id"),
  messageText: text("message_text").notNull(),
  groupName: text("group_name"),
  senderName: text("sender_name"),
  classification: text("classification"), 
  confidence: doublePrecision("confidence"),
  actionTaken: text("action_taken").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export const insertKeywordSchema = createInsertSchema(keywords).omit({ id: true });
export const insertAccountSchema = createInsertSchema(telegramAccounts).omit({ 
  id: true, 
  sessionString: true, 
  status: true, 
});
export const insertLogSchema = createInsertSchema(logs).omit({ id: true, createdAt: true });

export type Settings = typeof settings.$inferSelect;
export type Keyword = typeof keywords.$inferSelect;
export type TelegramAccount = typeof telegramAccounts.$inferSelect;
export type Log = typeof logs.$inferSelect;

export type InsertAccount = z.infer<typeof insertAccountSchema>;