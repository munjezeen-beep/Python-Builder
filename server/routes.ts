import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Settings
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

  // Keywords
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

  // Accounts
  app.get(api.accounts.list.path, async (req, res) => {
    const accs = await storage.getAccounts();
    res.json(accs);
  });

  app.post(api.accounts.create.path, async (req, res) => {
    try {
      const accountData = api.accounts.create.input.parse(req.body);
      const account = await storage.createAccount(accountData);
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

  // Telegram Mock Auth Endpoints
  app.post(api.accounts.sendCode.path, async (req, res) => {
    const id = Number(req.params.id);
    const account = await storage.getAccount(id);
    if (!account) {
      return res.status(400).json({ message: "Account not found" });
    }
    // Mock sending code logic
    res.json({ success: true });
  });

  app.post(api.accounts.verifyCode.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { code, password } = api.accounts.verifyCode.input.parse(req.body);
      const account = await storage.getAccount(id);
      
      if (!account) {
        return res.status(400).json({ message: "Account not found" });
      }

      // Mock verify code and generating session string
      const fakeSessionString = "session_mock_" + Math.random().toString(36).substring(7);
      await storage.updateAccountStatus(id, "active", fakeSessionString);
      
      res.json({ success: true, status: "active" });
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to verify code" });
    }
  });

  // Logs
  app.get(api.logs.list.path, async (req, res) => {
    const allLogs = await storage.getLogs();
    res.json(allLogs);
  });

  return httpServer;
}
