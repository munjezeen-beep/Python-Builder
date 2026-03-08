import { z } from 'zod';
import { insertSettingsSchema, insertKeywordSchema, insertAccountSchema, settings, keywords, telegramAccounts, logs } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings' as const,
      responses: { 200: z.custom<typeof settings.$inferSelect>() },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/settings' as const,
      input: insertSettingsSchema.partial(),
      responses: { 200: z.custom<typeof settings.$inferSelect>() },
    },
  },
  keywords: {
    list: {
      method: 'GET' as const,
      path: '/api/keywords' as const,
      responses: { 200: z.array(z.custom<typeof keywords.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/keywords' as const,
      input: insertKeywordSchema,
      responses: { 201: z.custom<typeof keywords.$inferSelect>() },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/keywords/:id' as const,
      responses: { 204: z.void() },
    },
  },
  accounts: {
    list: {
      method: 'GET' as const,
      path: '/api/accounts' as const,
      responses: { 200: z.array(z.custom<typeof telegramAccounts.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/accounts' as const,
      input: insertAccountSchema,
      responses: { 201: z.custom<typeof telegramAccounts.$inferSelect>() },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/accounts/:id' as const,
      responses: { 204: z.void() },
    },
    sendCode: {
      method: 'POST' as const,
      path: '/api/accounts/:id/send-code' as const,
      responses: { 200: z.object({ success: z.boolean() }), 400: errorSchemas.validation },
    },
    verifyCode: {
      method: 'POST' as const,
      path: '/api/accounts/:id/verify-code' as const,
      input: z.object({ code: z.string(), password: z.string().optional() }),
      responses: { 200: z.object({ success: z.boolean(), status: z.string() }), 400: errorSchemas.validation },
    }
  },
  logs: {
    list: {
      method: 'GET' as const,
      path: '/api/logs' as const,
      responses: { 200: z.array(z.custom<typeof logs.$inferSelect>()) },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
