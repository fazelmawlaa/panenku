import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  useNavigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AuthProvider as SupabaseAuthProvider } from "@/hooks/use-auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center gradient-hero px-4">
      <div className="glass-card max-w-md rounded-3xl p-10 text-center">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Halaman tidak ditemukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sepertinya halaman ini sudah dipanen petani lain.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-90"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center gradient-hero px-4">
      <div className="glass-card max-w-md rounded-3xl p-10 text-center">
        <h1 className="text-xl font-semibold">Halaman gagal dimuat</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Terjadi kesalahan. Silakan coba lagi.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Coba lagi
          </button>
          <a href="/" className="rounded-full border border-input bg-background px-5 py-2.5 text-sm font-medium">
            Beranda
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "PANENKU — Dari Petani, Untuk Indonesia" },
        {
          name: "description",
          content:
            "Marketplace pertanian terintegrasi. Hubungkan petani Indonesia dengan pembeli secara transparan dan berkelanjutan.",
        },
        {
          property: "og:title",
          content: "PANENKU — Dari Petani, Untuk Indonesia",
        },
        {
          property: "og:description",
          content:
            "Marketplace hasil panen, perlengkapan budidaya, limbah pertanian, dan sesi konsultasi tani dalam satu platform.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap",
        },
      ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthGuard({ children }: { children: ReactNode }) {
  const { isLoggedIn, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  useEffect(() => {
    if (!isLoading && !isLoggedIn && pathname !== "/onboarding" && pathname !== "/login") {
      navigate({ to: "/onboarding" });
      return;
    }

    if (!isLoading && isLoggedIn && user) {
      const isFarmer = user.role === "petani";
      const isCustomer = user.role === "pembeli" || (user.role as any) === "calon_petani";

      if (isFarmer && (pathname === "/" || pathname === "/dashboard" || pathname === "/cart")) {
        navigate({ to: "/farmer" });
      } else if (isCustomer && pathname.startsWith("/farmer")) {
        navigate({ to: "/dashboard" });
      }
    }
  }, [isLoggedIn, isLoading, pathname, navigate, user]);

  // On onboarding or login page, always render (no guard)
  if (pathname === "/onboarding" || pathname === "/login") {
    return <>{children}</>;
  }

  // While loading, show a subtle loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-hero">
        <div className="glass-card rounded-3xl p-10 text-center">
          <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  // Not logged in → will redirect via useEffect
  if (!isLoggedIn) {
    return null;
  }

  return <>{children}</>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthProvider>
        <AuthProvider>
          <AuthGuard>
            <Outlet />
          </AuthGuard>
          <Toaster />
        </AuthProvider>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
}
