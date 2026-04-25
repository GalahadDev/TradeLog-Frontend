import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import AnimatedBackground from "@/components/background/AnimatedBackground";
import GoogleButton from "@/components/GoogleButton";
import DemoStatsPreview from "@/components/DemoStatsPreview";
import { Link } from "react-router-dom";
import { LineChart, Shield, Sparkles, Mail, Lock, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEmailAuth } from "@/hooks/useEmailAuth";
import { toast } from "sonner";

type AuthTab = "google" | "email";
type EmailMode = "signin" | "signup" | "reset";

function getPasswordStrength(pwd: string): { level: 0 | 1 | 2 | 3; label: string; color: string } {
  if (pwd.length === 0) return { level: 0, label: "", color: "" };
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  const score = [pwd.length >= 8, hasUpper && hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  if (score <= 1) return { level: 1, label: "Débil", color: "bg-destructive" };
  if (score === 2) return { level: 2, label: "Media", color: "bg-yellow-500" };
  return { level: 3, label: "Fuerte", color: "bg-primary" };
}

const Auth = () => {
  const navigate = useNavigate();
  const { signUp, signIn, sendPasswordReset, loading } = useEmailAuth();

  const [tab, setTab] = useState<AuthTab>("google");
  const [emailMode, setEmailMode] = useState<EmailMode>("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [signUpDone, setSignUpDone] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const passwordStrength = getPasswordStrength(password);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate("/dashboard");
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/dashboard");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (emailMode === "reset") {
      const { error } = await sendPasswordReset(email);
      if (error) {
        toast.error("Error al enviar el correo", { description: error.message });
      } else {
        setResetDone(true);
      }
      return;
    }

    if (emailMode === "signup") {
      if (!fullName.trim()) {
        toast.error("El nombre completo es requerido");
        return;
      }
      if (password.length < 8) {
        toast.error("La contraseña debe tener al menos 8 caracteres");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Las contraseñas no coinciden");
        return;
      }
      const { error } = await signUp(email, password, fullName.trim());
      if (error) {
        toast.error("Error al registrarse", { description: error.message });
      } else {
        setSignUpDone(true);
      }
      return;
    }

    const { error } = await signIn(email, password);
    if (error) {
      toast.error("Error al iniciar sesión", { description: error.message });
    }
  };

  const features = [
    { icon: LineChart, text: "Análisis detallado de trades" },
    { icon: Shield, text: "Datos seguros y privados" },
    { icon: Sparkles, text: "Insights con IA (Proximamente)" },
  ];

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Branding */}
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="relative">
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-profit to-profit/70 flex items-center justify-center"
                whileHover={{ rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <LineChart className="w-6 h-6 text-primary-foreground" />
              </motion.div>
              <motion.div
                className="absolute -inset-1 rounded-xl bg-profit/20 blur-md -z-10"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="text-2xl font-bold font-display text-foreground">TradeLog</span>
          </motion.div>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold font-display leading-tight">
              Domina tu<br />
              <span className="text-gradient-profit">Trading</span><br />
              con Datos
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Registra, analiza y mejora cada operación. Tu diario de trading inteligente para alcanzar la consistencia.
            </p>
          </motion.div>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.text}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
              >
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-muted-foreground">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <DemoStatsPreview />
          </motion.div>
        </motion.div>

        {/* Right side - Login Card */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          <motion.div
            className="absolute -inset-4 bg-gradient-radial from-primary/20 via-primary/5 to-transparent blur-2xl -z-10"
            animate={{ opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          <motion.div
            className="relative backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl p-8 space-y-6 overflow-hidden"
            whileHover={{ borderColor: "hsl(var(--primary) / 0.3)" }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <motion.h2
                className="text-2xl font-bold font-display"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                Bienvenido
              </motion.h2>
              <motion.p
                className="text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                Inicia sesión para acceder a tu journal
              </motion.p>
            </div>

            {/* Tab selector */}
            <motion.div
              className="flex rounded-xl bg-secondary/50 p-1 gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.4 }}
            >
              {(["google", "email"] as AuthTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${tab === t
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {t === "google" ? "Google" : "Email"}
                </button>
              ))}
            </motion.div>

            {/* Divider */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center">
                <motion.span
                  className="bg-card px-4 py-1 text-xs text-muted-foreground uppercase tracking-wider"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Acceso seguro
                </motion.span>
              </div>
            </motion.div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {tab === "google" ? (
                <motion.div
                  key="google"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <GoogleButton />
                </motion.div>
              ) : (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <AnimatePresence mode="wait">
                    {signUpDone ? (
                      <SuccessState
                        key="signup-done"
                        icon={<CheckCircle2 className="w-10 h-10 text-primary" />}
                        title="¡Revisa tu correo!"
                        description={`Enviamos un enlace de confirmación a ${email}. Haz clic en él para activar tu cuenta.`}
                        onBack={() => { setSignUpDone(false); setEmailMode("signin"); }}
                      />
                    ) : resetDone ? (
                      <SuccessState
                        key="reset-done"
                        icon={<Mail className="w-10 h-10 text-primary" />}
                        title="Correo enviado"
                        description={`Enviamos instrucciones para restablecer tu contraseña a ${email}.`}
                        onBack={() => { setResetDone(false); setEmailMode("signin"); }}
                      />
                    ) : (
                      <motion.form
                        key={emailMode}
                        onSubmit={handleEmailSubmit}
                        className="space-y-3"
                        initial={{ opacity: 0, x: emailMode === "reset" ? 20 : 0 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Mode title */}
                        <p className="text-center text-sm font-medium text-foreground">
                          {emailMode === "signin" && "Iniciar sesión"}
                          {emailMode === "signup" && "Crear cuenta"}
                          {emailMode === "reset" && "Restablecer contraseña"}
                        </p>

                        {/* Full name (signup only) */}
                        {emailMode === "signup" && (
                          <div className="space-y-1.5">
                            <Label htmlFor="fullName" className="text-muted-foreground text-xs uppercase tracking-wider">
                              Nombre completo
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="fullName"
                                type="text"
                                required
                                autoComplete="name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Tu nombre"
                                className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50"
                              />
                            </div>
                          </div>
                        )}

                        {/* Email */}
                        <div className="space-y-1.5">
                          <Label htmlFor="email" className="text-muted-foreground text-xs uppercase tracking-wider">
                            Correo electrónico
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              required
                              autoComplete="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Correo Electronico"
                              className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50"
                            />
                          </div>
                        </div>

                        {/* Password */}
                        {emailMode !== "reset" && (
                          <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-muted-foreground text-xs uppercase tracking-wider">
                              Contraseña
                            </Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                autoComplete={emailMode === "signup" ? "new-password" : "current-password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Contraseña"
                                className="pl-10 pr-10 bg-secondary/50 border-border/50 focus:border-primary/50"
                              />
                              <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>

                            {/* Password strength (signup only) */}
                            {emailMode === "signup" && password.length > 0 && (
                              <div className="space-y-1">
                                <div className="flex gap-1">
                                  {[1, 2, 3].map((i) => (
                                    <div
                                      key={i}
                                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordStrength.level >= i ? passwordStrength.color : "bg-border"
                                        }`}
                                    />
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Seguridad: <span className={
                                    passwordStrength.level === 1 ? "text-destructive" :
                                      passwordStrength.level === 2 ? "text-yellow-500" : "text-primary"
                                  }>{passwordStrength.label}</span>
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Confirm password (signup only) */}
                        {emailMode === "signup" && (
                          <div className="space-y-1.5">
                            <Label htmlFor="confirmPassword" className="text-muted-foreground text-xs uppercase tracking-wider">
                              Confirmar contraseña
                            </Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="confirmPassword"
                                type={showConfirm ? "text" : "password"}
                                required
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repite tu contraseña"
                                className={`pl-10 pr-10 bg-secondary/50 border-border/50 focus:border-primary/50 ${confirmPassword && confirmPassword !== password
                                  ? "border-destructive/60 focus:border-destructive"
                                  : ""
                                  }`}
                              />
                              <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowConfirm((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            {confirmPassword && confirmPassword !== password && (
                              <p className="text-xs text-destructive">Las contraseñas no coinciden</p>
                            )}
                          </div>
                        )}

                        {/* Submit */}
                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium mt-1"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              {emailMode === "signin" && "Iniciar sesión"}
                              {emailMode === "signup" && "Crear cuenta"}
                              {emailMode === "reset" && "Enviar instrucciones"}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>

                        {/* Footer links */}
                        <div className="flex flex-col items-center gap-2 pt-1">
                          {emailMode === "signin" && (
                            <>
                              <button
                                type="button"
                                onClick={() => setEmailMode("reset")}
                                className="text-xs text-muted-foreground hover:text-primary transition-colors"
                              >
                                ¿Olvidaste tu contraseña?
                              </button>
                              <button
                                type="button"
                                onClick={() => { setEmailMode("signup"); setPassword(""); setConfirmPassword(""); }}
                                className="text-xs text-muted-foreground hover:text-primary transition-colors"
                              >
                                ¿No tienes cuenta? <span className="text-primary">Regístrate</span>
                              </button>
                            </>
                          )}
                          {(emailMode === "signup" || emailMode === "reset") && (
                            <button
                              type="button"
                              onClick={() => { setEmailMode("signin"); setPassword(""); setConfirmPassword(""); setFullName(""); }}
                              className="text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                              ← Volver a iniciar sesión
                            </button>
                          )}
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Terms */}
            <motion.p
              className="text-center text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              Al continuar, aceptas nuestros{" "}
              <Link to="/terms" className="text-primary hover:underline transition-colors hover:text-primary/80">
                Términos de Servicio
              </Link>{" "}
              y{" "}
              <Link to="/privacy" className="text-primary hover:underline transition-colors hover:text-primary/80">
                Política de Privacidad
              </Link>
            </motion.p>
          </motion.div>
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
};

interface SuccessStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onBack: () => void;
}

const SuccessState = ({ icon, title, description, onBack }: SuccessStateProps) => (
  <motion.div
    className="flex flex-col items-center text-center space-y-4 py-2"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {icon}
    </motion.div>
    <h3 className="text-lg font-bold font-display">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    <button
      onClick={onBack}
      className="text-xs text-muted-foreground hover:text-primary transition-colors mt-2"
    >
      ← Volver
    </button>
  </motion.div>
);

export default Auth;
