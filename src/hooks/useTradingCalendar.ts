import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth } from "date-fns";
import { es } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/lib/api";

type DayData = { pnl: number; trades: number };

export function useTradingCalendar(accountId?: string) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthKey = format(currentMonth, "yyyy-MM");

  const { data: monthlyData = {}, isFetching: loading } = useQuery<Record<string, DayData>>({
    queryKey: ["calendar-metrics", accountId, monthKey],
    queryFn: async () => {
      const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
      const { data } = await dashboardService.getCalendarMetrics(accountId!, start, end);
      const map: Record<string, DayData> = {};
      (data.data || []).forEach((item) => {
        map[item.date.split("T")[0]] = {
          pnl: Number(item.total_pnl),
          trades: item.trade_count,
        };
      });
      return map;
    },
    enabled: !!accountId,
  });

  const getDayData = (date: Date): DayData | undefined =>
    monthlyData[format(date, "yyyy-MM-dd")];

  const weeks = useMemo<Date[][]>(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { locale: es });
    const endDate = endOfWeek(monthEnd, { locale: es });
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const result: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) result.push(days.slice(i, i + 7));
    return result;
  }, [currentMonth]);

  const monthTotals = useMemo(() => {
    const values = Object.values(monthlyData);
    return {
      totalPnL: values.reduce((acc, d) => acc + d.pnl, 0),
      totalTrades: values.reduce((acc, d) => acc + d.trades, 0),
      winningDays: values.filter((d) => d.pnl > 0).length,
      losingDays: values.filter((d) => d.pnl < 0).length,
    };
  }, [monthlyData]);

  const getWeeklyStats = (week: Date[]) => {
    let weeklyPnL = 0;
    let activeDays = 0;
    week.forEach((day) => {
      if (isSameMonth(day, currentMonth)) {
        const d = getDayData(day);
        if (d) { weeklyPnL += d.pnl; activeDays++; }
      }
    });
    return { weeklyPnL, activeDays };
  };

  const getDayStyle = (dayData: DayData | undefined, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return "opacity-30 grayscale";
    if (!dayData) return "bg-card/20 border-border/30 hover:border-border";
    if (dayData.pnl > 0) return "bg-profit/10 border-profit/40 shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:bg-profit/20";
    if (dayData.pnl < 0) return "bg-loss/10 border-loss/40 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:bg-loss/20";
    return "bg-gold/10 border-gold/40 hover:bg-gold/20";
  };

  return { currentMonth, setCurrentMonth, loading, weeks, monthTotals, getDayData, getDayStyle, getWeeklyStats };
}
