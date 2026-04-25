import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    userService.getMe()
      .then(({ data }) => {
        if (data.user.role === 'admin') {
          setAuthorized(true);
        } else {
          toast.error("Acceso denegado");
          navigate('/dashboard', { replace: true });
        }
      })
      .catch(() => navigate('/', { replace: true }));
  }, [navigate]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};
