import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedBackground from "@/components/background/AnimatedBackground";
import { ShieldAlert, LogOut, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Pending = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      localStorage.clear();
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-background text-foreground">
      <AnimatedBackground />

      <div className="relative z-10 p-8 max-w-md w-full">
        <motion.div
          className="backdrop-blur-xl bg-card/80 border border-yellow-500/30 rounded-2xl p-8 text-center space-y-6 shadow-[0_0_30px_rgba(234,179,8,0.2)]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold font-display text-foreground">Cuenta en Revisión</h2>

          <p className="text-muted-foreground text-sm leading-relaxed">
            Tu cuenta ha sido registrada en el sistema pero requiere la aprobación de un administrador para acceder al Trading Journal.
          </p>

          <div className="pt-2">
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={loading}
              className="w-full border-border hover:bg-secondary transition-colors"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              {loading ? "Cerrando..." : "Cerrar Sesión"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pending;
