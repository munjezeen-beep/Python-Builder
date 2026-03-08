import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { useLogs } from "@/hooks/use-logs";
import { useAccounts } from "@/hooks/use-accounts";
import { useKeywords } from "@/hooks/use-keywords";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Activity, ShieldAlert, CheckCircle2, Users, KeySquare, Loader2, Radar } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: settings, isLoading: loadingSettings } = useSettings();
  const { data: logs, isLoading: loadingLogs } = useLogs();
  const { data: accounts, isLoading: loadingAccounts } = useAccounts();
  const { data: keywords, isLoading: loadingKeywords } = useKeywords();
  
  const updateSettings = useUpdateSettings();

  const isRadarActive = settings?.radarEnabled ?? false;
  
  const totalIntercepts = logs?.length || 0;
  const targetMatches = logs?.filter(l => l.classification === 'Student').length || 0;
  const activeAccounts = accounts?.filter(a => a.status === 'active').length || 0;
  
  const stats = [
    { title: "Total Logs", value: totalIntercepts, icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Valuable Matches", value: targetMatches, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Active Watchers", value: activeAccounts, icon: Users, color: "text-violet-500", bg: "bg-violet-500/10" },
    { title: "Keywords Armed", value: keywords?.length || 0, icon: KeySquare, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  if (loadingSettings || loadingLogs || loadingAccounts || loadingKeywords) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Control Section */}
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`relative overflow-hidden rounded-3xl p-8 border ${isRadarActive ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'} transition-colors duration-500 shadow-2xl shadow-black/10`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-full ${isRadarActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <Radar className={`w-6 h-6 ${isRadarActive ? 'animate-pulse' : ''}`} />
              </div>
              <h2 className="text-3xl font-display font-bold text-foreground">
                Radar Engine is {isRadarActive ? 'Online' : 'Offline'}
              </h2>
            </div>
            <p className="text-muted-foreground max-w-xl text-lg">
              {isRadarActive 
                ? "The system is actively monitoring all connected groups in real-time."
                : "Monitoring is paused. No messages are being intercepted or forwarded."}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-background/50 p-4 rounded-2xl border border-border/50 backdrop-blur-md">
            <span className="font-semibold text-foreground">Global Switch</span>
            <Switch 
              checked={isRadarActive}
              onCheckedChange={(checked) => updateSettings.mutate({ radarEnabled: checked })}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-card hover-elevate border-0 bg-card/40 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-display font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* System Health */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              AI Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">OpenRouter Classification</span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${settings?.aiEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {settings?.aiEnabled ? 'Active' : 'Disabled'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Intercepts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs?.slice(0, 3).map(log => (
                <div key={log.id} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                  <span className="truncate w-1/2 text-muted-foreground">{log.messageText}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${log.classification === 'Student' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {log.classification || 'Unknown'}
                  </span>
                </div>
              ))}
              {(!logs || logs.length === 0) && (
                <div className="text-center text-muted-foreground py-4">No recent activity</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
