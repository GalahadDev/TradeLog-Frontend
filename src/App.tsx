import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AdminRoute } from "@/components/AdminRoute";
import { AccountProvider } from "@/contexts/AccountContext";

const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Pending = lazy(() => import("./pages/Pending"));
const Profile = lazy(() => import("./pages/Profiles"));
const UsersAdmin = lazy(() => import("./pages/Users"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Journal = lazy(() => import("./pages/Journal"));
const Stats = lazy(() => import("./pages/Stats"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Accounts = lazy(() => import("./pages/Accounts"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-12 h-12 text-primary animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AccountProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pending" element={<Pending />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin/users" element={<AdminRoute><UsersAdmin /></AdminRoute>} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AccountProvider>
  </QueryClientProvider>
);

export default App;
