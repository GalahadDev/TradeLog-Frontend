import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addMonths, subMonths } from "date-fns";
import { Loader2, Wallet } from "lucide-react";
import { useTradingCalendar } from "@/hooks/useTradingCalendar";
import { useAccount } from "@/contexts/AccountContext";
import { CalendarNavigation } from "./CalendarNavigation";
import { CalendarWeekRow } from "./CalendarWeekRow";

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const TradingCalendar = () => {
  const { selectedAccount } = useAccount();
  const {
    currentMonth, setCurrentMonth, loading,
    weeks, monthTotals, getDayData, getDayStyle, getWeeklyStats,
  } = useTradingCalendar(selectedAccount?.id);

  const handlePrev = useCallback(() => setCurrentMonth(m => subMonths(m, 1)), [setCurrentMonth]);
  const handleNext = useCallback(() => setCurrentMonth(m => addMonths(m, 1)), [setCurrentMonth]);

  const { totalPnL, totalTrades, winningDays, losingDays } = monthTotals;

  const headerStats = [
    { label: "P&L Mensual", value: totalPnL, isCurrency: true },
    { label: "Trades Totales", value: totalTrades, isCurrency: false, color: "text-gold" },
    { label: "Días Ganadores", value: winningDays, isCurrency: false, color: "text-profit" },
    { label: "Días Perdedores", value: losingDays, isCurrency: false, color: "text-loss" },
  ];

  if (!selectedAccount) {
    return (
      <div className="w-full mx-auto bg-card/20 backdrop-blur-xl border border-border/50 rounded-2xl p-12 text-center">
        <Wallet className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">Selecciona una cuenta para ver el calendario.</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      {/* Stats mensuales */}
      <motion.div
        key={currentMonth.toISOString()}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {headerStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-center shadow-sm relative overflow-hidden"
          >
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
              {loading ? (
                <div className="h-8 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <p className={`text-2xl font-bold font-mono ${stat.isCurrency
                  ? (stat.value as number) >= 0 ? "text-profit" : "text-loss"
                  : stat.color
                  }`}>
                  {stat.isCurrency
                    ? `${(stat.value as number) >= 0 ? "+" : ""}$${(stat.value as number).toFixed(2)}`
                    : stat.value}
                </p>
              )}
            </div>
            <div className={`absolute inset-0 opacity-5 ${stat.isCurrency ? ((stat.value as number) >= 0 ? "bg-profit" : "bg-loss") : "bg-primary"
              }`} />
          </div>
        ))}
      </motion.div>

      {/* Calendario */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/20 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-2xl relative"
      >
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-background/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl"
            >
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        <CalendarNavigation currentMonth={currentMonth} onPrev={handlePrev} onNext={handleNext} />

        <div className="flex flex-col gap-2">
          {/* Encabezado días */}
          <div className="flex gap-2">
            <div className="grid grid-cols-7 gap-2 flex-1">
              {WEEK_DAYS.map((day) => (
                <div key={day} className="text-center text-xs font-bold text-muted-foreground py-2 uppercase tracking-widest">
                  {day}
                </div>
              ))}
            </div>
            <div className="w-24 md:w-32 text-center text-xs font-bold text-muted-foreground py-2 uppercase tracking-widest hidden sm:block">
              Resumen
            </div>
          </div>

          {/* Filas de semanas */}
          {weeks.map((week, weekIndex) => {
            const { weeklyPnL, activeDays } = getWeeklyStats(week);
            return (
              <CalendarWeekRow
                key={weekIndex}
                week={week}
                weekIndex={weekIndex}
                currentMonth={currentMonth}
                getDayData={getDayData}
                getDayStyle={getDayStyle}
                weeklyPnL={weeklyPnL}
                activeDays={activeDays}
              />
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default TradingCalendar;
