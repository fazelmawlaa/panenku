import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { Sprout } from "lucide-react";

export function RequireRole({ role, children }: { role: AppRole; children: ReactNode }) {
  const { session, role: userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (userRole && userRole !== role) {
      navigate({ to: userRole === "petani" ? "/farmer" : "/dashboard", replace: true });
    }
  }, [loading, session, userRole, role, navigate]);

  if (loading || !session || (userRole && userRole !== role)) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-leaf animate-pulse">
            <Sprout className="h-6 w-6 text-white" />
          </div>
          <span className="text-sm">Memuat…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
