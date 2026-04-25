import { format } from "date-fns";
import { es } from "date-fns/locale";
import { addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface CalendarNavigationProps {
  currentMonth: Date;
  onPrev: () => void;
  onNext: () => void;
}

export const CalendarNavigation = ({ currentMonth, onPrev, onNext }: CalendarNavigationProps) => (
  <div className="flex items-center justify-between mb-8">
    <motion.button
      onClick={onPrev}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="p-2 rounded-lg bg-card/50 border border-border hover:border-gold/50 transition-colors"
    >
      <ChevronLeft className="w-5 h-5 text-gold" />
    </motion.button>
    <h2 className="text-3xl font-bold text-foreground capitalize font-display">
      {format(currentMonth, "MMMM yyyy", { locale: es })}
    </h2>
    <motion.button
      onClick={onNext}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="p-2 rounded-lg bg-card/50 border border-border hover:border-gold/50 transition-colors"
    >
      <ChevronRight className="w-5 h-5 text-gold" />
    </motion.button>
  </div>
);


export { addMonths, subMonths };
