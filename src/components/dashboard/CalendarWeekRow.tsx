import { isSameMonth } from "date-fns";
import { memo } from "react";
import { CalendarDayCell } from "./CalendarDayCell";

interface DayData {
  pnl: number;
  trades: number;
}

interface CalendarWeekRowProps {
  week: Date[];
  weekIndex: number;
  currentMonth: Date;
  getDayData: (date: Date) => DayData | undefined;
  getDayStyle: (dayData: DayData | undefined, isCurrentMonth: boolean) => string;
  weeklyPnL: number;
  activeDays: number;
}

export const CalendarWeekRow = memo(({
  week,
  weekIndex,
  currentMonth,
  getDayData,
  getDayStyle,
  weeklyPnL,
  activeDays,
}: CalendarWeekRowProps) => (
  <div className="flex gap-2 items-stretch h-24 md:h-28">
    <div className="grid grid-cols-7 gap-2 flex-1">
      {week.map((day) => {
        const dayData = getDayData(day);
        const isCurrentMonth = isSameMonth(day, currentMonth);
        return (
          <CalendarDayCell
            key={day.toISOString()}
            day={day}
            dayData={dayData}
            dayStyle={getDayStyle(dayData, isCurrentMonth)}
            isCurrentMonth={isCurrentMonth}
          />
        );
      })}
    </div>
    <div className="w-24 md:w-32 hidden sm:flex flex-col rounded-xl bg-card/30 border border-border/50 p-2 justify-center items-center text-center">
      <span className="text-[10px] text-muted-foreground uppercase mb-1">Semana {weekIndex + 1}</span>
      <span className={`text-sm md:text-base font-bold font-mono ${weeklyPnL >= 0 ? "text-profit" : "text-loss"}`}>
        {weeklyPnL >= 0 ? "+" : "-"}${Math.abs(weeklyPnL).toFixed(0)}
      </span>
      <span className="text-[10px] text-muted-foreground mt-1">{activeDays} días op.</span>
    </div>
  </div>
));

CalendarWeekRow.displayName = "CalendarWeekRow";
