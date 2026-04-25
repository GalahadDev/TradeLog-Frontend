import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import AnimatedBackground from "@/components/background/AnimatedBackground";
import { LineChart, Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace("#", ""));
    const isRecovery =
      params.get("type") === "recovery" ||
      hashParams.get("type") === "recovery";

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (isRecovery && session)) {
        navigate("/reset-password", { replace: true });
      } else if (!isRecovery && session) {
        navigate("/dashboard", { replace: true });
      } else if (event === "SIGNED_OUT") {
        navigate("/", { replace: true });
      }
    });

    if (!isRecovery) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) navigate("/dashboard", { replace: true });
      });
    }

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <motion.div
          className="w-14 h-14 rounded-xl bg-gradient-to-br from-profit to-profit/70 flex items-center justify-center"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <LineChart className="w-7 h-7 text-primary-foreground" />
        </motion.div>

        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Verificando tu sesión...</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
