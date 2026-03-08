import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertAccount } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useAccounts() {
  return useQuery({
    queryKey: [api.accounts.list.path],
    queryFn: async () => {
      const res = await fetch(api.accounts.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch accounts");
      return api.accounts.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertAccount) => {
      const res = await fetch(api.accounts.create.path, {
        method: api.accounts.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create account");
      return api.accounts.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.accounts.list.path] });
      toast({ title: "Account registered", description: "Authenticate it to start radar." });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Failed to register account", description: error.message });
    }
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.accounts.delete.path, { id });
      const res = await fetch(url, { method: api.accounts.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete account");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.accounts.list.path] });
      toast({ title: "Account removed" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Failed to remove account", description: error.message });
    }
  });
}

export function useSendCode() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.accounts.sendCode.path, { id });
      const res = await fetch(url, { method: api.accounts.sendCode.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to send verification code");
      return api.accounts.sendCode.responses[200].parse(await res.json());
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Telegram Error", description: error.message });
    }
  });
}

export function useVerifyCode() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, code, password }: { id: number, code: string, password?: string }) => {
      const url = buildUrl(api.accounts.verifyCode.path, { id });
      const res = await fetch(url, {
        method: api.accounts.verifyCode.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, password }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Verification failed. Incorrect code or password.");
      return api.accounts.verifyCode.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.accounts.list.path] });
      toast({ title: "Authentication Successful", description: `Account is now ${data.status}.` });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Authentication Failed", description: error.message });
    }
  });
}
