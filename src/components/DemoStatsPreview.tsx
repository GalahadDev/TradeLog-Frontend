import { motion } from "framer-motion";
import { TrendingUp, BarChart3, Target, Zap } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    label: "Win Rate",
    value: "73%",
    color: "text-profit",
  },
  {
    icon: BarChart3,
    label: "Trades",
    value: "1,247",
    color: "text-chart-line",
  },
  {
    icon: Target,
    label: "Profit Factor",
    value: "2.4",
    color: "text-gold",
  },
  {
    icon: Zap,
    label: "Avg R:R",
    value: "1:3",
    color: "text-primary",
  },
];

const DemoStatsPreview = () => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="relative group p-4 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
          whileHover={{ scale: 1.05, borderColor: "hsl(var(--primary) / 0.5)" }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
          <div className="relative flex items-center gap-3">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`text-lg font-bold font-display ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DemoStatsPreview;
