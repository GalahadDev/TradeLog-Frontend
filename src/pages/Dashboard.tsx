import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LineChart, Plus, LayoutDashboard, Wallet, ArrowRight
} from "lucide-react";
import TradingCalendar from "@/components/dashboard/TradingCalendar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Dashboard = () => {
  const navigate = useNavigate();

  const menuItems = useMemo(() => [
    {
      icon: Plus,
      label: "Nuevo Trade",
      color: "text-profit",
      bg: "bg-profit/10 border-profit/20",
      action: () => navigate("/journal")
    },
    {
      icon: LineChart,
      label: "Estadísticas",
      color: "text-chart-line",
      bg: "bg-chart-line/10 border-chart-line/20",
      action: () => navigate("/stats")
    },
    {
      icon: Wallet,
      label: "Mis Cuentas",
      color: "text-gold",
      bg: "bg-gold/10 border-gold/20",
      action: () => navigate("/accounts")
    },
  ], [navigate]);

  return (
    <DashboardLayout>
        <div className="container mx-auto px-6 py-8 max-w-7xl space-y-8">
          
          {/* 1. Header  */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-start gap-4 mb-8"
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30 shadow-lg shadow-primary/10">
              <LayoutDashboard className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-display">
                Panel Principal
              </h1>
              <p className="text-muted-foreground">
                Resumen de tu actividad y acceso rápido.
              </p>
            </div>
          </motion.div>

          {/* 2. Botones de Acción  */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={item.action}
                className={`group relative p-6 rounded-xl border backdrop-blur-sm overflow-hidden text-left transition-all hover:shadow-lg ${item.bg}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg bg-background/40 ${item.color}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div>
                  <span className="font-bold text-lg text-foreground">
                    {item.label}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* 3. Calendario */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TradingCalendar />
          </motion.div>
          
        </div>
    </DashboardLayout>
  );
};

export default Dashboard;