import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface LargeStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
  textColor: string;
  delay: number;
  prefix?: string;
  suffix?: string;
  hoverColor?: string;
}

export const LargeStatCard = ({
  icon: Icon,
  label,
  value,
  color,
  textColor,
  delay,
  prefix = "",
  suffix = "",
  hoverColor = "hover:border-primary/30",
}: LargeStatCardProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.4 }}
  >
    <Card className={`bg-card/40 border-border/50 backdrop-blur-sm ${hoverColor} transition-all duration-300 h-full`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Icon className={`w-4 h-4 ${textColor}`} />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold font-mono ${textColor}`}>
          {prefix}{value}{suffix}
        </p>
        <div className={`mt-2 h-1 rounded-full bg-gradient-to-r ${color} opacity-60`} />
      </CardContent>
    </Card>
  </motion.div>
);
