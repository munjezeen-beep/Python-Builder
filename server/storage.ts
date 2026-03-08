import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  settings,
  keywords,
  telegramAccounts,
  logs,
  type Settings,
  type Keyword,
  type TelegramAccount,
  type Log,
  type InsertAccount
} from "@shared/schema";

export interface IStorage {
  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(updates: Partial<Settings>): Promise<Settings>;

  // Keywords
  getKeywords(): Promise<Keyword[]>;
  createKeyword(word: string): Promise<Keyword>;
  deleteKeyword(id: number): Promise<void>;

  // Accounts
  getAccounts(): Promise<TelegramAccount[]>;
  getAccount(id: number): Promise<TelegramAccount | undefined>;
  createAccount(account: InsertAccount): Promise<TelegramAccount>;
  updateAccountStatus(id: number, status: string, sessionString?: string): Promise<TelegramAccount>;
  deleteAccount(id: number): Promise<void>;

  // Logs
  getLogs(): Promise<Log[]>;
  createLog(log: Omit<Log, "id" | "createdAt">): Promise<Log>;
}

export class DatabaseStorage implements IStorage {
  async getSettings(): Promise<Settings> {
    const [setting] = await db.select().from(settings);
    if (!setting) {
      const [newSetting] = await db.insert(settings).values({}).returning();
      return newSetting;
    }
    return setting;
  }

  async updateSettings(updates: Partial<Settings>): Promise<Settings> {
    const current = await this.getSettings();
    const [updated] = await db.update(settings)
      .set(updates)
      .where(eq(settings.id, current.id))
      .returning();
    return updated;
  }

  async getKeywords(): Promise<Keyword[]> {
    return await db.select().from(keywords);
  }

  async createKeyword(word: string): Promise<Keyword> {
    const [keyword] = await db.insert(keywords).values({ word }).returning();
    return keyword;
  }

  async deleteKeyword(id: number): Promise<void> {
    await db.delete(keywords).where(eq(keywords.id, id));
  }

  async getAccounts(): Promise<TelegramAccount[]> {
    return await db.select().from(telegramAccounts);
  }

  async getAccount(id: number): Promise<TelegramAccount | undefined> {
    const [account] = await db.select().from(telegramAccounts).where(eq(telegramAccounts.id, id));
    return account;
  }

  async createAccount(account: InsertAccount): Promise<TelegramAccount> {
    const [newAccount] = await db.insert(telegramAccounts).values(account).returning();
    return newAccount;
  }

  async updateAccountStatus(id: number, status: string, sessionString?: string): Promise<TelegramAccount> {
    const updateData: Partial<TelegramAccount> = { status };
    if (sessionString) updateData.sessionString = sessionString;
    
    const [updated] = await db.update(telegramAccounts)
      .set(updateData)
      .where(eq(telegramAccounts.id, id))
      .returning();
    return updated;
  }

  async deleteAccount(id: number): Promise<void> {
    await db.delete(telegramAccounts).where(eq(telegramAccounts.id, id));
  }

  async getLogs(): Promise<Log[]> {
    return await db.select().from(logs).orderBy(logs.createdAt); // We might want descending order
  }

  async createLog(log: Omit<Log, "id" | "createdAt">): Promise<Log> {
    const [newLog] = await db.insert(logs).values(log).returning();
    return newLog;
  }
}

export const storage = new DatabaseStorage();
