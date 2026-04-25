import { motion } from "framer-motion";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AnimatedBackground from "@/components/background/AnimatedBackground";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative bg-background text-foreground overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-8 hover:bg-white/5 text-muted-foreground hover:text-foreground gap-2 pl-0"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Inicio
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl p-8 md:p-12 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold font-display">Términos de Servicio</h1>
          </div>

          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Última actualización: {new Date().toLocaleDateString()}
            </p>

            <section className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">1. Aceptación de los Términos</h2>
              <p>
                Al acceder y utilizar TradeLog, aceptas que este es un proyecto de portafolio personal ("Open Source" o "Demo") y aceptas estar sujeto a estos términos. Si no estás de acuerdo, por favor no utilices la aplicación.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">2. Uso de la Aplicación</h2>
              <p>
                TradeLog es una herramienta de registro y análisis. Se te otorga una licencia limitada, no exclusiva e intransferible para usar la aplicación con fines personales y educativos.
              </p>
            </section>

            <section className="space-y-2 bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
              <h2 className="text-xl font-bold text-red-400">3. Descargo de Responsabilidad Financiera</h2>
              <p className="text-red-200/80">
                <strong>Importante:</strong> TradeLog NO es una plataforma de inversión ni proporciona asesoramiento financiero.
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2 text-red-200/80">
                <li>El trading implica un riesgo significativo de pérdida de capital.</li>
                <li>Las estadísticas y análisis mostrados en esta aplicación son retrospectivos y no garantizan resultados futuros.</li>
                <li>Tú eres el único responsable de tus decisiones de inversión. El creador de esta aplicación no se hace responsable de ninguna pérdida financiera relacionada con el uso de esta herramienta.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">4. Disponibilidad del Servicio</h2>
              <p>
                Al ser un proyecto de demostración, no garantizamos que el servicio esté disponible el 100% del tiempo, ni garantizamos la integridad absoluta de los datos almacenados. Nos reservamos el derecho de modificar o interrumpir el servicio en cualquier momento.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">5. Propiedad Intelectual</h2>
              <p>
                El diseño, código fuente y la marca "TradeLog" son parte del portafolio profesional de Samuel Llach.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;