import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Wallet, Plus, Pencil, Trash2, ArrowLeft, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAccount } from "@/contexts/AccountContext";
import { accountService } from "@/lib/api";
import { AccountListItem, TradingAccount } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const typeBadge = (t: string) =>
  t === "prop_firm"
    ? <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30">Prop Firm</Badge>
    : <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30">Personal</Badge>;

const statusBadge = (s: string) => {
  if (s === "active") return <Badge className="bg-profit/20 text-profit border-profit/30">Activa</Badge>;
  if (s === "completed") return <Badge className="bg-gold/20 text-gold border-gold/30">Completada</Badge>;
  return <Badge className="bg-loss/20 text-loss border-loss/30">Perdida</Badge>;
};

const fmt = (n: string) => parseFloat(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });


type CreateForm = {
  name: string; broker: string; account_type: string;
  initial_balance: number; profit_target?: number; max_drawdown_limit?: number;
};
type EditForm = {
  name: string; broker: string; status: string;
  profit_target?: number; max_drawdown_limit?: number;
};

interface AccountFormSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: TradingAccount | null;
  onSuccess: () => void;
}

function AccountFormSheet({ open, onOpenChange, editing, onSuccess }: AccountFormSheetProps) {
  const [submitting, setSubmitting] = useState(false);
  const [accType, setAccType] = useState<string>(editing?.account_type ?? "prop_firm");

  const { register: regCreate, handleSubmit: handleCreate, reset: resetCreate, setValue: setValCreate } = useForm<CreateForm>();
  const { register: regEdit, handleSubmit: handleEdit, reset: resetEdit, setValue: setValEdit } = useForm<EditForm>({
    defaultValues: editing ? {
      name: editing.name, broker: editing.broker, status: editing.status,
      profit_target: editing.profit_target ? parseFloat(editing.profit_target) : undefined,
      max_drawdown_limit: editing.max_drawdown_limit ? parseFloat(editing.max_drawdown_limit) : undefined,
    } : undefined,
  });

  const onCreateSubmit = async (data: CreateForm) => {
    setSubmitting(true);
    try {
      await accountService.create({
        ...data,
        initial_balance: Number(data.initial_balance),
        profit_target: data.profit_target ? Number(data.profit_target) : undefined,
        max_drawdown_limit: data.max_drawdown_limit ? Number(data.max_drawdown_limit) : undefined,
        account_type: accType,
      });
      toast.success("Cuenta creada exitosamente");
      resetCreate();
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error("Error al crear la cuenta");
    } finally { setSubmitting(false); }
  };

  const onEditSubmit = async (data: EditForm) => {
    if (!editing) return;
    setSubmitting(true);
    try {
      await accountService.update(editing.id, {
        ...data,
        profit_target: data.profit_target ? Number(data.profit_target) : undefined,
        max_drawdown_limit: data.max_drawdown_limit ? Number(data.max_drawdown_limit) : undefined,
      });
      toast.success("Cuenta actualizada");
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error("Error al actualizar la cuenta");
    } finally { setSubmitting(false); }
  };

  const isPropFirm = editing ? editing.account_type === "prop_firm" : accType === "prop_firm";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-card border-l border-border text-foreground">
        <SheetHeader>
          <SheetTitle className="text-xl font-display font-bold">
            {editing ? "Editar Cuenta" : "Nueva Cuenta"}
          </SheetTitle>
        </SheetHeader>

        {/* CREATE FORM */}
        {!editing && (
          <form onSubmit={handleCreate(onCreateSubmit)} className="space-y-5 py-6">
            <div className="space-y-2">
              <Label>Nombre de la cuenta</Label>
              <Input {...regCreate("name", { required: true })} placeholder="FTMO 100K" className="bg-black/20" />
            </div>
            <div className="space-y-2">
              <Label>Broker / Firma</Label>
              <Input {...regCreate("broker", { required: true })} placeholder="FTMO, Topstep…" className="bg-black/20" />
            </div>
            <div className="space-y-2">
              <Label>Tipo de cuenta</Label>
              <Select defaultValue="prop_firm" onValueChange={(v) => { setAccType(v); setValCreate("account_type", v); }}>
                <SelectTrigger className="bg-black/20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="prop_firm">Prop Firm</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Balance inicial ($)</Label>
              <Input type="number" step="0.01" {...regCreate("initial_balance", { required: true })} placeholder="100000" className="bg-black/20" />
            </div>
            {isPropFirm && (
              <>
                <div className="space-y-2">
                  <Label>Objetivo de ganancia ($) <span className="text-muted-foreground text-xs">opcional</span></Label>
                  <Input type="number" step="0.01" {...regCreate("profit_target")} placeholder="10000" className="bg-black/20" />
                </div>
                <div className="space-y-2">
                  <Label>Drawdown máximo ($) <span className="text-muted-foreground text-xs">opcional</span></Label>
                  <Input type="number" step="0.01" {...regCreate("max_drawdown_limit")} placeholder="5000" className="bg-black/20" />
                </div>
              </>
            )}
            <SheetFooter className="pt-2">
              <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/90">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Cuenta
              </Button>
            </SheetFooter>
          </form>
        )}

        {/* EDIT FORM */}
        {editing && (
          <form onSubmit={handleEdit(onEditSubmit)} className="space-y-5 py-6">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input {...regEdit("name", { required: true })} className="bg-black/20" />
            </div>
            <div className="space-y-2">
              <Label>Broker</Label>
              <Input {...regEdit("broker", { required: true })} className="bg-black/20" />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select defaultValue={editing.status} onValueChange={(v) => setValEdit("status", v)}>
                <SelectTrigger className="bg-black/20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activa</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="lost">Perdida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isPropFirm && (
              <>
                <div className="space-y-2">
                  <Label>Objetivo de ganancia ($)</Label>
                  <Input type="number" step="0.01" {...regEdit("profit_target")} className="bg-black/20" />
                </div>
                <div className="space-y-2">
                  <Label>Drawdown máximo ($)</Label>
                  <Input type="number" step="0.01" {...regEdit("max_drawdown_limit")} className="bg-black/20" />
                </div>
              </>
            )}
            <SheetFooter className="pt-2">
              <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/90">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ── Página principal ────────────────────────────────────────────────────────

export default function Accounts() {
  const navigate = useNavigate();
  const { accounts, isLoading, refetchAccounts, selectedAccount, setSelectedAccount } = useAccount();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<TradingAccount | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState<string | null>(null);

  const handleNew = () => { setEditing(null); setSheetOpen(true); };

  const handleEdit = async (id: string) => {
    setLoadingEdit(id);
    try {
      const res = await accountService.getById(id);
      setEditing(res.data.account);
      setSheetOpen(true);
    } catch {
      toast.error("Error al cargar la cuenta");
    } finally {
      setLoadingEdit(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await accountService.delete(deletingId);
      toast.success("Cuenta eliminada");
      if (selectedAccount?.id === deletingId) setSelectedAccount(null);
      await refetchAccounts();
    } catch {
      toast.error("Error al eliminar la cuenta");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSuccess = async () => {
    await refetchAccounts();
  };

  const handleSelect = (acc: AccountListItem) => {
    setSelectedAccount(acc);
    toast.success(`Cuenta "${acc.name}" seleccionada`);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8 max-w-7xl space-y-8">

        {/* Header */}
        <Button variant="ghost" onClick={() => navigate("/dashboard")}
          className="hover:bg-white/5 text-muted-foreground hover:text-foreground gap-2 pl-0">
          <ArrowLeft className="w-4 h-4" /> Volver al Inicio
        </Button>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 shadow-lg shadow-purple-500/10">
              <Wallet className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display text-foreground">Mis Cuentas</h1>
              <p className="text-muted-foreground text-sm">{accounts.length} cuenta{accounts.length !== 1 ? "s" : ""} registrada{accounts.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <Button onClick={handleNew} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-sm transition-all hover:scale-105">
            <Plus className="mr-2 h-4 w-4" /> Nueva Cuenta
          </Button>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && accounts.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No tenés cuentas registradas.</p>
            <Button onClick={handleNew} variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
              <Plus className="mr-2 h-4 w-4" /> Crear primera cuenta
            </Button>
          </motion.div>
        )}

        {/* Grid de cuentas */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {accounts.map((acc, i) => {
            const pnl = parseFloat(acc.total_pnl);
            const isSelected = selectedAccount?.id === acc.id;
            return (
              <motion.div key={acc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => handleSelect(acc)}
                className={`group relative p-5 rounded-xl border backdrop-blur-sm cursor-pointer transition-all hover:shadow-lg ${isSelected
                    ? "border-primary/60 bg-primary/5 shadow-primary/10"
                    : "border-border/50 bg-card/40 hover:border-border"
                  }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    ACTIVA
                  </span>
                )}

                {/* Nombre y badges */}
                <div className="mb-3">
                  <h3 className="font-bold text-foreground text-lg leading-tight">{acc.name}</h3>
                  <p className="text-muted-foreground text-sm mt-0.5">{acc.broker}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {typeBadge(acc.account_type)}
                    {statusBadge(acc.status)}
                  </div>
                </div>

                {/* Balance */}
                <div className="space-y-1 mb-4">
                  <p className="text-xs text-muted-foreground">Balance actual</p>
                  <p className="text-2xl font-bold font-mono text-foreground">
                    ${fmt(acc.current_balance)} <span className="text-xs text-muted-foreground font-sans">{acc.currency}</span>
                  </p>
                </div>

                {/* PnL */}
                <div className={`flex items-center gap-1.5 text-sm font-mono font-bold ${pnl >= 0 ? "text-profit" : "text-loss"}`}>
                  {pnl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {pnl >= 0 ? "+" : ""}{fmt(acc.total_pnl)}
                </div>

                {/* Acciones */}
                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="outline"
                    className="flex-1 border-white/10 hover:bg-white/10 text-xs"
                    disabled={loadingEdit === acc.id}
                    onClick={(e) => { e.stopPropagation(); handleEdit(acc.id); }}>
                    {loadingEdit === acc.id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <><Pencil className="w-3 h-3 mr-1" /> Editar</>}
                  </Button>
                  <Button size="sm" variant="outline"
                    className="border-loss/30 text-loss hover:bg-loss/10 hover:border-loss/50 text-xs"
                    onClick={(e) => { e.stopPropagation(); setDeletingId(acc.id); }}>
                    <Trash2 className="w-3 h-3 mr-1" /> Eliminar
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Sheet crear/editar */}
      <AccountFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editing={editing}
        onSuccess={handleSuccess}
      />

      {/* Confirm delete */}
      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta cuenta?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Se eliminarán la cuenta y todos sus trades. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border hover:bg-white/10">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-loss hover:bg-loss/80 text-white">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
