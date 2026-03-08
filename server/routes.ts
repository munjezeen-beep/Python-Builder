import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { sendCode, verifyCode, setTelegramCredentials } from "./telegram";

const pendingCodes = new Map<number, { phoneCodeHash: string, phone: string }>();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.settings.get.path, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (e) {
      res.status(500).json({ message: "Failed to get settings" });
    }
  });

  app.put(api.settings.update.path, async (req, res) => {
    try {
      const updates = api.settings.update.input.parse(req.body);
      const settings = await storage.updateSettings(updates);
      res.json(settings);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  app.get(api.keywords.list.path, async (req, res) => {
    const kws = await storage.getKeywords();
    res.json(kws);
  });

  app.post(api.keywords.create.path, async (req, res) => {
    try {
      const { word } = api.keywords.create.input.parse(req.body);
      const keyword = await storage.createKeyword(word);
      res.status(201).json(keyword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create keyword" });
    }
  });

  app.delete(api.keywords.delete.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteKeyword(id);
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete keyword" });
    }
  });

  app.get(api.accounts.list.path, async (req, res) => {
    const accs = await storage.getAccounts();
    res.json(accs);
  });

  app.post(api.accounts.create.path, async (req, res) => {
    try {
      const accountData = api.accounts.create.input.parse(req.body);
      setTelegramCredentials(accountData.apiId, accountData.apiHash);
      const account = await storage.createAccount({
        ...accountData,
        status: "pending"
      });
      res.status(201).json(account);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.delete(api.accounts.delete.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteAccount(id);
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Telegram Real Auth Endpoints - Railway Optimized
app.post(api.accounts.sendCode.path, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const account = await storage.getAccount(id);
    
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // إعداد بيانات API للتليجرام
    setTelegramCredentials(account.apiId, account.apiHash);

    // إرسال الكود
    await sendCode(account.phone, id);
    
    res.json({ success: true });
    
  } catch (error: any) {
    console.error("Send code error:", error);
    res.status(500).json({ 
      message: error.message || "Failed to send code. Please check your API credentials and try again." 
    });
  }
});

app.post(api.accounts.verifyCode.path, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { code, password } = api.accounts.verifyCode.input.parse(req.body);
    
    const account = await storage.getAccount(id);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // إعداد بيانات API للتليجرام
    setTelegramCredentials(account.apiId, account.apiHash);

    // التحقق من الكود
    const sessionString = await verifyCode(id, code, password);

    // تحديث الحالة إلى active مع session string الحقيقي
    await storage.updateAccountStatus(id, "active", sessionString);
    
    res.json({ success: true, status: "active" });
    
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    
    console.error("Verify code error:", error);
    
    // رسائل خطأ مخصصة
    if (error.message === "2FA_PASSWORD_REQUIRED") {
      return res.status(400).json({ 
        message: "This account requires a 2FA password. Please enter it.",
        requiresPassword: true 
      });
    }
    
    if (error.message === "INVALID_CODE") {
      return res.status(400).json({ 
        message: "The code you entered is incorrect. Please check and try again." 
      });
    }
    
    if (error.message === "CODE_EXPIRED") {
      return res.status(400).json({ 
        message: "The code has expired. Please request a new code." 
      });
    }
    
    res.status(500).json({ 
      message: error.message || "Verification failed. Please try again." 
    });
  }
});

  app.get(api.logs.list.path, async (req, res) => {
    const allLogs = await storage.getLogs();
    res.json(allLogs);
  });

  return httpServer;
}
