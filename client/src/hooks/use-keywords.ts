import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Keyword } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useKeywords() {
  return useQuery({
    queryKey: [api.keywords.list.path],
    queryFn: async () => {
      const res = await fetch(api.keywords.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch keywords");
      return api.keywords.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateKeyword() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { word: string }) => {
      const res = await fetch(api.keywords.create.path, {
        method: api.keywords.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create keyword");
      return api.keywords.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.keywords.list.path] });
      toast({ title: "Keyword added" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Failed to add keyword", description: error.message });
    }
  });
}

export function useDeleteKeyword() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.keywords.delete.path, { id });
      const res = await fetch(url, { method: api.keywords.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete keyword");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.keywords.list.path] });
      toast({ title: "Keyword deleted" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Failed to delete keyword", description: error.message });
    }
  });
}
