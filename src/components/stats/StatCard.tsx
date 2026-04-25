import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
  delay: number;
  prefix?: string;
  suffix?: string;
  hoverColor?: string;
}

export const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
  delay,
  prefix = "",
  suffix = "",
  hoverColor = "hover:border-primary/30",
}: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <Card className={`bg-card/40 border-border/50 backdrop-blur-sm ${hoverColor} transition-all duration-300 group overflow-hidden h-full`}>
      <CardContent className="p-4 relative">
        <div className="relative flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${color} border border-white/5`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className="text-lg font-bold font-mono text-foreground truncate">
              {prefix}{value}{suffix}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);
