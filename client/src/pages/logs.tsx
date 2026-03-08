import { useLogs } from "@/hooks/use-logs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Activity, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function Logs() {
  const { data: logs, isLoading, isFetching } = useLogs();

  if (isLoading) return <div className="flex h-40 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between bg-card/40 p-6 rounded-2xl border border-border/50 glass-card shrink-0">
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Live Event Logs
          </h2>
          <p className="text-muted-foreground mt-1">Real-time feed of intercepted messages and AI classifications.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 px-4 py-2 rounded-full border border-border/50">
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-primary' : ''}`} />
          Auto-refreshing (5s)
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden shadow-xl shadow-black/10 flex-1 flex flex-col min-h-0">
        <div className="overflow-auto flex-1">
          <Table className="relative">
            <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-md">
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-[180px] font-semibold text-foreground">Time</TableHead>
                <TableHead className="font-semibold text-foreground">Group</TableHead>
                <TableHead className="font-semibold text-foreground">Sender</TableHead>
                <TableHead className="w-1/3 font-semibold text-foreground">Message Segment</TableHead>
                <TableHead className="font-semibold text-foreground">AI Class</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Result Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-40 text-muted-foreground text-lg">Radar is listening. Waiting for events...</TableCell>
                </TableRow>
              )}
              {logs?.map((log) => (
                <TableRow key={log.id} className="border-border/20 hover:bg-muted/30 transition-colors cursor-default">
                  <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                    {format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{log.groupName || 'Unknown Group'}</TableCell>
                  <TableCell className="text-primary/90">{log.senderName || 'Anonymous'}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate" title={log.messageText}>
                    {log.messageText}
                  </TableCell>
                  <TableCell>
                    {log.classification ? (
                       <Badge variant="outline" className={
                         log.classification === 'Student' ? 'bg-primary/10 border-primary/30 text-primary' :
                         log.classification === 'Advertiser' ? 'bg-destructive/10 border-destructive/30 text-destructive' :
                         'bg-muted text-muted-foreground'
                       }>
                         {log.classification} {log.confidence ? `(${(log.confidence * 100).toFixed(0)}%)` : ''}
                       </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={log.actionTaken === 'forwarded' ? 'default' : 'secondary'} 
                           className={log.actionTaken === 'forwarded' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-none border-none' : 'border-none shadow-none'}>
                      {log.actionTaken.toUpperCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
