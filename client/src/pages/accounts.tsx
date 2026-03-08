import { useState } from "react";
import { useAccounts, useCreateAccount, useDeleteAccount, useSendCode, useVerifyCode } from "@/hooks/use-accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Smartphone, Trash2, Key, Loader2, Plus, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Accounts() {
  const { data: accounts, isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const deleteAccount = useDeleteAccount();
  const sendCode = useSendCode();
  const verifyCode = useVerifyCode();

  const [addOpen, setAddOpen] = useState(false);
  const [formData, setFormData] = useState({ phone: '', apiId: '', apiHash: '', targetGroup: '' });

  const [verifyState, setVerifyState] = useState<{ open: boolean, accountId: number | null }>({ open: false, accountId: null });
  const [verifyData, setVerifyData] = useState({ code: '', password: '' });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAccount.mutate({
      phone: formData.phone,
      apiId: Number(formData.apiId),
      apiHash: formData.apiHash,
      targetGroup: formData.targetGroup
    }, {
      onSuccess: () => {
        setAddOpen(false);
        setFormData({ phone: '', apiId: '', apiHash: '', targetGroup: '' });
      }
    });
  };

  const handleSendCodeClick = (id: number) => {
    sendCode.mutate(id, {
      onSuccess: () => {
        setVerifyState({ open: true, accountId: id });
      }
    });
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyState.accountId) return;
    verifyCode.mutate({
      id: verifyState.accountId,
      code: verifyData.code,
      password: verifyData.password || undefined
    }, {
      onSuccess: () => {
        setVerifyState({ open: false, accountId: null });
        setVerifyData({ code: '', password: '' });
      }
    });
  };

  if (isLoading) return <div className="flex h-40 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card/40 p-6 rounded-2xl border border-border/50 glass-card">
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-primary" />
            Watchers (Telegram Accounts)
          </h2>
          <p className="text-muted-foreground mt-1">Manage the Telegram accounts used to monitor target groups.</p>
        </div>
        
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/30 transition-all font-semibold rounded-xl px-6">
              <Plus className="w-4 h-4 mr-2" /> Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card border-border/50 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Register New Account</DialogTitle>
              <DialogDescription>
                Provide the Telegram API details. You'll authenticate in the next step.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Phone Number (Intl format)</Label>
                <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1234567890" className="bg-background/50 border-border focus:ring-primary/20" />
              </div>
              <div className="space-y-2">
                <Label>API ID</Label>
                <Input required type="number" value={formData.apiId} onChange={e => setFormData({...formData, apiId: e.target.value})} placeholder="1234567" className="bg-background/50 border-border" />
              </div>
              <div className="space-y-2">
                <Label>API Hash</Label>
                <Input required value={formData.apiHash} onChange={e => setFormData({...formData, apiHash: e.target.value})} placeholder="abcdef123456" className="bg-background/50 border-border" />
              </div>
              <div className="space-y-2">
                <Label>Forwarding Target Group (Username or ID)</Label>
                <Input required value={formData.targetGroup} onChange={e => setFormData({...formData, targetGroup: e.target.value})} placeholder="@MyAdminGroup" className="bg-background/50 border-border" />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" disabled={createAccount.isPending} className="w-full">
                  {createAccount.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save Details"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Verify Code Dialog */}
      <Dialog open={verifyState.open} onOpenChange={(open) => !open && setVerifyState({open: false, accountId: null})}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" /> Authenticate Telegram</DialogTitle>
            <DialogDescription>A code has been sent to your Telegram app. Enter it below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleVerifySubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Telegram Code</Label>
              <Input required value={verifyData.code} onChange={e => setVerifyData({...verifyData, code: e.target.value})} placeholder="12345" className="text-center tracking-[0.5em] font-mono text-lg" />
            </div>
            <div className="space-y-2">
              <Label>2FA Password (If enabled)</Label>
              <Input type="password" value={verifyData.password} onChange={e => setVerifyData({...verifyData, password: e.target.value})} placeholder="Leave blank if none" />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={verifyCode.isPending} className="w-full mt-4">
                {verifyCode.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Verify & Connect"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden shadow-xl shadow-black/10">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="font-semibold text-foreground">Phone</TableHead>
              <TableHead className="font-semibold text-foreground">Target</TableHead>
              <TableHead className="font-semibold text-foreground">Status</TableHead>
              <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">No accounts configured yet.</TableCell>
              </TableRow>
            )}
            {accounts?.map((account) => (
              <TableRow key={account.id} className="border-border/20 group hover:bg-muted/20 transition-colors">
                <TableCell className="font-medium">{account.phone}</TableCell>
                <TableCell className="text-muted-foreground">{account.targetGroup}</TableCell>
                <TableCell>
                  <Badge variant={account.status === 'active' ? 'default' : account.status === 'pending' ? 'secondary' : 'destructive'} 
                         className={account.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : ''}>
                    {account.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {account.status === 'pending' && (
                      <Button size="sm" variant="outline" onClick={() => handleSendCodeClick(account.id)} disabled={sendCode.isPending}
                        className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                        <Key className="w-4 h-4 mr-2" />
                        Auth Code
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => deleteAccount.mutate(account.id)} disabled={deleteAccount.isPending}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
