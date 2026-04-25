import { format, isToday } from "date-fns";
import { memo } from "react";

interface DayData {
  pnl: number;
  trades: number;
}

interface CalendarDayCellProps {
  day: Date;
  dayData: DayData | undefined;
  dayStyle: string;
  isCurrentMonth: boolean;
}

export const CalendarDayCell = memo(({ day, dayData, dayStyle, isCurrentMonth }: CalendarDayCellProps) => {
  const isCurrentDay = isToday(day);

  return (
    <div
      className={`
        relative rounded-xl border flex flex-col items-center justify-center gap-1 overflow-hidden transition-all
        ${dayStyle}
        ${isCurrentDay ? "ring-2 ring-gold ring-offset-2 ring-offset-background" : ""}
      `}
    >
      <span className={`text-xs md:text-sm font-semibold ${isCurrentDay ? "text-gold" : "text-foreground/60"}`}>
        {format(day, "d")}
      </span>
      {dayData && isCurrentMonth && (
        <div className="flex flex-col items-center">
          <span className={`text-[10px] sm:text-xs font-bold font-mono ${dayData.pnl >= 0 ? "text-profit" : "text-loss"}`}>
            ${Math.abs(dayData.pnl).toFixed(0)}
          </span>
          <span className="text-[9px] text-muted-foreground/70 hidden md:block">
            {dayData.trades} op
          </span>
        </div>
      )}
    </div>
  );
});

CalendarDayCell.displayName = "CalendarDayCell";
