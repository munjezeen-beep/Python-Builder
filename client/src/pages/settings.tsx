import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Settings as SettingsIcon, Bot } from "lucide-react";

const formSchema = z.object({
  openRouterApiKey: z.string().optional(),
  aiEnabled: z.boolean().default(true),
});

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      openRouterApiKey: "",
      aiEnabled: true,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        openRouterApiKey: settings.openRouterApiKey || "",
        aiEnabled: settings.aiEnabled,
      });
    }
  }, [settings, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateSettings.mutate(values);
  }

  if (isLoading) return <div className="flex h-40 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-primary" />
          System Preferences
        </h2>
        <p className="text-muted-foreground mt-2">Configure AI engines and core application behaviors.</p>
      </div>

      <Card className="glass-card bg-card/40 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-xl">
            <Bot className="w-5 h-5 text-primary" /> Artificial Intelligence
          </CardTitle>
          <CardDescription>
            RadarBot uses an LLM to distinguish real student requests from annoying ad spam.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="aiEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border/50 bg-background/30 p-5 backdrop-blur-sm shadow-inner">
                    <div className="space-y-1">
                      <FormLabel className="text-base font-semibold">Enable AI Classification</FormLabel>
                      <FormDescription className="text-muted-foreground">
                        When disabled, all intercepted messages are forwarded blindly.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="openRouterApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OpenRouter API Key</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="sk-or-v1-..." {...field} className="bg-background/50 font-mono text-sm h-12 rounded-xl" />
                    </FormControl>
                    <FormDescription>
                      Used to classify messages. Supports high-end models for Gulf dialect.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={updateSettings.isPending} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-semibold shadow-lg hover:shadow-primary/25 transition-all text-base">
                {updateSettings.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Save AI Settings
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
