import { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { dashboardService } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown, BarChart3, Target, Zap, DollarSign, Activity, Percent, ArrowUpRight, ArrowDownRight, Flame, Shield, AlertTriangle, Receipt, Wallet } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { StatCard } from "@/components/stats/StatCard";
import { LargeStatCard } from "@/components/stats/LargeStatCard";
import { CustomTooltip } from "@/components/stats/CustomTooltip";
import { useAccount } from "@/contexts/AccountContext";

const Stats = () => {
  const navigate = useNavigate();
  const { selectedAccount } = useAccount();
  const accountId = selectedAccount?.id;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["stats", accountId],
    queryFn: () => dashboardService.getStats(accountId!).then(r => r.data.stats),
    staleTime: 5 * 60 * 1000,
    enabled: !!accountId,
    retry: 1,
  });

  const stats = data ?? null;

  const winLossData = useMemo(() => stats ? [
    { name: "Ganadas", value: parseFloat(stats.win_rate), fill: "hsl(var(--profit))" },
    { name: "Perdidas", value: parseFloat(stats.loss_rate), fill: "hsl(var(--loss))" },
  ] : [], [stats]);

  const profitLossData = useMemo(() => stats ? [
    { name: "Bruto",   value: parseFloat(stats.gross_profit),      fill: "hsl(var(--profit))" },
    { name: "Pérdida", value: Math.abs(parseFloat(stats.gross_loss)), fill: "hsl(var(--loss))" },
    { name: "Neto",    value: parseFloat(stats.total_net_profit),  fill: "hsl(var(--gold))" },
  ] : [], [stats]);

  const directionData = useMemo(() => stats ? [
    { name: "Largo", winRate: parseFloat(stats.long_win_rate) },
    { name: "Corto", winRate: parseFloat(stats.short_win_rate) },
  ] : [], [stats]);

  if (!accountId) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="p-4 rounded-full bg-card/40 border border-border/50 inline-block">
              <Wallet className="w-12 h-12 text-muted-foreground/40" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Sin cuenta seleccionada</h2>
              <p className="text-muted-foreground text-sm mb-4">Selecciona una cuenta desde el menú superior para ver las estadísticas.</p>
              <Button onClick={() => navigate("/accounts")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Wallet className="mr-2 h-4 w-4" /> Gestionar Cuentas
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !stats) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="p-4 rounded-full bg-card/40 border border-border/50 inline-block">
              <BarChart3 className="w-12 h-12 text-muted-foreground/40" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Sin datos disponibles</h2>
              <p className="text-muted-foreground text-sm mb-4">Registra tu primer trade en esta cuenta para ver las estadísticas.</p>
              <Button onClick={() => navigate("/journal")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Registrar primer trade
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getProfitHover = (val: string) => Number(val) >= 0 ? "hover:border-profit/50" : "hover:border-loss/50";
  const getPfHover    = (val: string) => Number(val) >= 1 ? "hover:border-gold/50"   : "hover:border-loss/50";

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8 max-w-7xl">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-gold/20 to-profit/20 border border-gold/30">
              <BarChart3 className="w-6 h-6 text-gold" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">Estadísticas Avanzadas</h1>
              <p className="text-sm text-muted-foreground">Análisis detallado de tu rendimiento</p>
            </div>
          </div>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <LargeStatCard icon={DollarSign} label="Beneficio Neto Total" value={Number(stats.total_net_profit).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} color="from-profit to-profit/50" textColor={Number(stats.total_net_profit) >= 0 ? "text-profit" : "text-loss"} hoverColor={getProfitHover(stats.total_net_profit)} delay={0.05} />
          <LargeStatCard icon={Target}    label="Factor de Beneficio"   value={Number(stats.profit_factor).toFixed(2)} color="from-gold to-gold/50" textColor="text-gold" hoverColor={getPfHover(stats.profit_factor)} delay={0.08} />
          <LargeStatCard icon={Percent}   label="Tasa de Acierto Total" value={Number(stats.win_rate).toFixed(2)} color="from-chart-line to-chart-line/50" textColor="text-chart-line" hoverColor="hover:border-chart-line/50" delay={0.12} suffix="%" />
        </div>

        {/* Gráficos */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="bg-card/40 border-border/50 backdrop-blur-sm hover:border-chart-line/30 transition-colors">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Target className="w-4 h-4 text-chart-line" />Efectividad (Win Rate)</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={winLossData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={5} dataKey="value" strokeWidth={0}>{winLossData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Pie><Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} /></PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-profit" /><span className="text-xs text-muted-foreground">Ganadas</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-loss"   /><span className="text-xs text-muted-foreground">Perdidas</span></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-border/50 backdrop-blur-sm hover:border-gold/30 transition-colors">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4 text-gold" />Desglose Financiero</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profitLossData} layout="vertical"><XAxis type="number" hide /><YAxis type="category" dataKey="name" hide /><Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} /><Bar dataKey="value" radius={[0,4,4,0]}>{profitLossData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar></BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-3 mt-2 flex-wrap">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><div className="w-2 h-2 bg-profit rounded-full" /> Bruto</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><div className="w-2 h-2 bg-loss  rounded-full" /> Pérdida</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><div className="w-2 h-2 bg-gold  rounded-full" /> Neto</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-border/50 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Activity className="w-4 h-4 text-primary" />Win Rate por Dirección</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={directionData}><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} /><Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} /><Bar dataKey="winRate" radius={[4,4,0,0]} fill="hsl(var(--chart-line))" /></BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-around mt-2">
                <div className="text-center"><p className="text-xs text-muted-foreground">Largo</p><p className={`text-sm font-bold ${Number(stats.long_win_rate)  > 50 ? 'text-profit' : 'text-muted-foreground'}`}>{Number(stats.long_win_rate).toFixed(1)}%</p></div>
                <div className="text-center"><p className="text-xs text-muted-foreground">Corto</p><p className={`text-sm font-bold ${Number(stats.short_win_rate) > 50 ? 'text-profit' : 'text-muted-foreground'}`}>{Number(stats.short_win_rate).toFixed(1)}%</p></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detalles Financieros */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }} className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><Activity className="w-5 h-5 text-primary" />Detalles Financieros</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={TrendingUp}    label="Beneficio Bruto" value={stats.gross_profit}  color="from-profit/80 to-profit/40" hoverColor="hover:border-profit/50" delay={0.2}  prefix="$" />
            <StatCard icon={TrendingDown}  label="Pérdida Bruta"   value={stats.gross_loss}    color="from-loss/80 to-loss/40"     hoverColor="hover:border-loss/50"   delay={0.22} prefix="$" />
            <StatCard icon={ArrowUpRight}  label="Mejor Trade"     value={stats.largest_win}   color="from-profit/80 to-profit/40" hoverColor="hover:border-profit/50" delay={0.24} prefix="$" />
            <StatCard icon={ArrowDownRight}label="Peor Trade"      value={stats.largest_loss}  color="from-loss/80 to-loss/40"     hoverColor="hover:border-loss/50"   delay={0.26} prefix="$" />
            <div className="col-span-2 md:col-span-4 grid grid-cols-1 justify-items-center">
              <div className="w-full md:w-1/2">
                <StatCard icon={Receipt} label="Comisiones Totales" value={stats.total_commissions} color="from-orange-500/80 to-orange-500/40" hoverColor="hover:border-orange-500/50" delay={0.27} prefix="$" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Riesgo */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }} className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><Zap className="w-5 h-5 text-gold" />Riesgo y Eficiencia</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={Shield}       label="Factor de Recuperación" value={Number(stats.recovery_factor).toFixed(2)} color="from-chart-line/80 to-chart-line/40" hoverColor="hover:border-chart-line/50" delay={0.3} />
            <StatCard icon={Activity}     label="Ratio de Sharpe"        value={Number(stats.sharpe_ratio).toFixed(2)}    color="from-primary/80 to-primary/40"       hoverColor="hover:border-primary/50"     delay={0.32} />
            <StatCard icon={DollarSign}   label="Esperanza Matemática"   value={stats.expected_payoff}                    color="from-gold/80 to-gold/40"             hoverColor="hover:border-gold/50"         delay={0.34} prefix="$" />
            <StatCard icon={AlertTriangle}label="Drawdown Máximo"        value={stats.max_drawdown}                       color="from-loss/80 to-loss/40"             hoverColor="hover:border-loss/50"         delay={0.36} prefix="$" />
          </div>
        </motion.div>

        {/* Rachas */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><Flame className="w-5 h-5 text-loss" />Rachas y Promedios</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={TrendingUp}    label="Ganancia Promedio" value={stats.avg_win}  color="from-profit/80 to-profit/40" hoverColor="hover:border-profit/50" delay={0.42} prefix="$" />
            <StatCard icon={TrendingDown}  label="Pérdida Promedio"  value={stats.avg_loss} color="from-loss/80 to-loss/40"     hoverColor="hover:border-loss/50"   delay={0.44} prefix="$" />
            <StatCard icon={Flame}         label="Racha Ganadora"    value={`${stats.max_consecutive_wins} (${Number(stats.max_consecutive_profit_usd).toLocaleString('en-US',{style:'currency',currency:'USD'})})`}   color="from-gold/80 to-gold/40" hoverColor="hover:border-gold/50" delay={0.46} />
            <StatCard icon={AlertTriangle} label="Racha Perdedora"   value={`${stats.max_consecutive_losses} (${Number(stats.max_consecutive_loss_usd).toLocaleString('en-US',{style:'currency',currency:'USD'})})`} color="from-loss/80 to-loss/40" hoverColor="hover:border-loss/50" delay={0.48} />
          </div>
        </motion.div>

      </div>
    </DashboardLayout>
  );
};

export default Stats;
