import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { tradeService } from "@/lib/api";
import { resolveUrls, deleteScreenshot } from "@/lib/storage";
import { Trade } from "@/types";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Plus, Loader2, ArrowUpRight, ArrowDownRight, Trash2, Pencil,
  Image as ImageIcon, X, Search, Filter, ArrowLeft, BookOpen, Wallet
} from "lucide-react";
import { toast } from "sonner";
import { isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { TradeForm } from "@/components/trades/TradeForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TradeGalleryModal } from "@/components/journal/TradeGalleryModal";
import { useNavigate } from "react-router-dom";
import { safeDate, getPnLColorClass } from "@/lib/utils";
import { useAccount } from "@/contexts/AccountContext";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Journal = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedAccount } = useAccount();
  const accountId = selectedAccount?.id;

  const { data: rawTrades = [], isLoading, refetch } = useQuery<Trade[]>({
    queryKey: ["trades", accountId],
    queryFn: async () => {
      if (!accountId) return [];
      const response = await tradeService.getAll(accountId, 1, 100);
      const d = response.data as { data?: Trade[]; trades?: Trade[] };
      return d.data || d.trades || [];
    },
    enabled: !!accountId,
  });

  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const allPaths = rawTrades.flatMap(t => t.screenshot_urls ?? []);
    if (allPaths.length === 0) { setSignedUrls({}); return; }
    resolveUrls(allPaths).then(setSignedUrls);
  }, [rawTrades]);

  const getDisplayUrl = useCallback(
    (path: string) => signedUrls[path] ?? path,
    [signedUrls]
  );

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [galleryTradeId, setGalleryTradeId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDirection, setFilterDirection] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  const filteredTrades = useMemo(() => {
    return rawTrades.filter((trade) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        trade.symbol.toLowerCase().includes(searchLower) ||
        (trade.tags && trade.tags.some(tag => tag.toLowerCase().includes(searchLower))) ||
        (trade.notes && trade.notes.toLowerCase().includes(searchLower));

      const matchesDirection =
        filterDirection === "all" ||
        trade.direction.toLowerCase() === filterDirection.toLowerCase();

      const pnlValue = Number(trade.pnl);
      let matchesStatus = true;
      if (filterStatus === "win") matchesStatus = pnlValue > 0;
      if (filterStatus === "loss") matchesStatus = pnlValue < 0;
      if (filterStatus === "be") matchesStatus = pnlValue === 0;

      let matchesDate = true;
      if (dateFrom || dateTo) {
        const tradeDate = parseISO(trade.entry_date);
        const start = dateFrom ? startOfDay(dateFrom) : new Date(2000, 0, 1);
        const end = dateTo ? endOfDay(dateTo) : new Date(2100, 0, 1);
        matchesDate = isWithinInterval(tradeDate, { start, end });
      }

      return matchesSearch && matchesDirection && matchesStatus && matchesDate;
    });
  }, [rawTrades, searchTerm, filterDirection, filterStatus, dateFrom, dateTo]);

  const displayFilteredTrades = useMemo(
    () => filteredTrades.map(t => ({
      ...t,
      screenshot_urls: t.screenshot_urls?.map(getDisplayUrl),
    })),
    [filteredTrades, getDisplayUrl]
  );

  const filteredPnL = useMemo(
    () => filteredTrades.reduce((acc, t) => acc + Number(t.pnl), 0),
    [filteredTrades]
  );

  const handleAddNew = useCallback(() => { setSelectedTrade(null); setIsSheetOpen(true); }, []);
  const handleEdit = useCallback((trade: Trade) => { setSelectedTrade(trade); setIsSheetOpen(true); }, []);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = useCallback((id: string) => { setDeleteId(id); }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteId || !accountId) return;
    const trade = rawTrades.find(t => t.id === deleteId);
    try {
      await tradeService.delete(accountId, deleteId);
      queryClient.setQueryData<Trade[]>(
        ["trades", accountId],
        prev => prev?.filter(t => t.id !== deleteId) ?? []
      );
      queryClient.invalidateQueries({ queryKey: ["calendar-metrics", accountId] });
      if (trade?.screenshot_urls) {
        await Promise.all(trade.screenshot_urls.map(p => deleteScreenshot(p)));
      }
      toast.success("Trade eliminado");
    } catch {
      toast.error("Error al eliminar");
    } finally {
      setDeleteId(null);
    }
  }, [deleteId, accountId, queryClient, rawTrades]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setFilterDirection("all");
    setFilterStatus("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  }, []);

  const hasActiveFilters = searchTerm || filterStatus !== 'all' || filterDirection !== 'all' || dateFrom || dateTo;

  if (!accountId) {
    return (
      <DashboardLayout>
        <div className="min-h-screen relative p-6 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="p-4 rounded-full bg-card/40 border border-border/50 inline-block">
              <Wallet className="w-12 h-12 text-muted-foreground/40" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Sin cuenta seleccionada</h2>
              <p className="text-muted-foreground text-sm mb-4">Selecciona una cuenta desde el menú superior o crea una nueva.</p>
              <Button onClick={() => navigate("/accounts")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Wallet className="mr-2 h-4 w-4" /> Gestionar Cuentas
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen relative p-6">

        <TradeForm
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          onSuccess={refetch}
          tradeToEdit={selectedTrade}
          accountId={accountId}
          signedUrlMap={signedUrls}
        />

        <TradeGalleryModal
          isOpen={!!galleryTradeId}
          onClose={() => setGalleryTradeId(null)}
          trades={displayFilteredTrades}
          initialTradeId={galleryTradeId}
        />

        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Borrar este trade?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción es permanente y no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="max-w-7xl mx-auto relative z-10 space-y-6">

          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="hover:bg-white/5 text-muted-foreground hover:text-foreground gap-2 pl-0"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg shadow-blue-500/10 hidden sm:block">
                <BookOpen className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-display text-foreground">Trading Journal</h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-muted-foreground text-sm">Registro histórico</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${filteredPnL >= 0 ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}`}>
                    Vista: {filteredPnL >= 0 ? '+' : ''}{filteredPnL.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <Button onClick={handleAddNew} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-sm transition-all hover:scale-105 w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Trade
            </Button>
          </div>

          <div className="bg-card/40 border border-border/50 p-4 rounded-xl backdrop-blur-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 shadow-sm">
            <div className="relative col-span-1 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Par, Tag o Nota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-black/20 border-white/10 focus:border-primary/50"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-black/20 border-white/10">
                <SelectValue placeholder="Resultado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los resultados</SelectItem>
                <SelectItem value="win" className="text-profit font-bold">Ganadoras</SelectItem>
                <SelectItem value="loss" className="text-loss font-bold">Perdedoras</SelectItem>
                <SelectItem value="be" className="text-gold">Break Even</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDirection} onValueChange={setFilterDirection}>
              <SelectTrigger className="bg-black/20 border-white/10">
                <SelectValue placeholder="Dirección" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas direcciones</SelectItem>
                <SelectItem value="long">Long (Compras)</SelectItem>
                <SelectItem value="short">Short (Ventas)</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 col-span-1 lg:col-span-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-[10px] uppercase">De</span>
                <DatePicker date={dateFrom} setDate={setDateFrom} placeholder="Inicio" className="pl-8 text-xs h-10" />
              </div>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-[10px] uppercase z-10">A</span>
                <DatePicker date={dateTo} setDate={setDateTo} placeholder="Fin" className="pl-8 text-xs h-10" />
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters} className="text-muted-foreground hover:text-white" title="Limpiar filtros">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="backdrop-blur-xl bg-card/80 border border-border/50 rounded-xl overflow-hidden shadow-2xl">
            {isLoading ? (
              <div className="p-12 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
            ) : !filteredTrades || filteredTrades.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                <Filter className="w-8 h-8 text-muted-foreground/50 mb-2" />
                <p>No se encontraron trades con estos filtros.</p>
                <Button variant="link" onClick={clearFilters} className="text-primary">Limpiar filtros</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-secondary/50">
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Símbolo</TableHead>
                      <TableHead>Dirección</TableHead>
                      <TableHead>Entrada</TableHead>
                      <TableHead>Salida</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Comisión</TableHead>
                      <TableHead>PnL Bruto</TableHead>
                      <TableHead className="text-center">Foto</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrades.map((trade, i) => (
                      <TableRow key={trade?.id || i} className="hover:bg-white/5 transition-colors group">
                        <TableCell className="font-mono text-xs text-muted-foreground capitalize whitespace-nowrap">
                          {safeDate(trade?.entry_date)}
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold">{trade?.symbol || "UNK"}</span>
                            {trade.tags && trade.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {trade.tags.map(t => (
                                  <span key={t} className="text-[9px] bg-secondary px-1 rounded text-muted-foreground">{t}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          {trade?.direction?.toLowerCase() === 'long' ? (
                            <span className="flex items-center text-profit text-xs font-bold bg-profit/10 px-2 py-1 rounded w-fit border border-profit/20">
                              <ArrowUpRight className="w-3 h-3 mr-1" /> LONG
                            </span>
                          ) : (
                            <span className="flex items-center text-loss text-xs font-bold bg-loss/10 px-2 py-1 rounded w-fit border border-loss/20">
                              <ArrowDownRight className="w-3 h-3 mr-1" /> SHORT
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="font-mono text-sm">{trade?.entry_price}</TableCell>
                        <TableCell className="font-mono text-sm">{trade?.exit_price || "-"}</TableCell>
                        <TableCell className="font-mono text-sm">{trade?.size}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {Number(trade?.commission) > 0 ? `-$${Number(trade.commission).toFixed(2)}` : "-"}
                        </TableCell>

                        <TableCell>
                          <span className={`font-bold font-mono ${getPnLColorClass(Number(trade?.pnl))}`}>
                            {Number(trade?.pnl) >= 0 ? "+" : ""}{Number(trade?.pnl || 0).toFixed(2)}
                          </span>
                        </TableCell>

                        <TableCell className="text-center">
                          {(trade?.screenshot_urls?.length ?? 0) > 0 ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setGalleryTradeId(trade.id)}
                              className="hover:bg-white/10 text-primary"
                            >
                              <ImageIcon className="w-4 h-4" />
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-xs opacity-30">-</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(trade)}>
                              <Pencil className="w-4 h-4 text-muted-foreground hover:text-white" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => trade?.id && handleDelete(trade.id)} className="text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Journal;
