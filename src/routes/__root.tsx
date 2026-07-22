import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-sm text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground mb-6">
          Error 404
        </p>
        <h1
          className="font-sans font-extrabold text-foreground"
          style={{ fontSize: "clamp(5rem, 15vw, 8rem)", letterSpacing: "-0.05em", lineHeight: 1 }}
        >
          404
        </h1>
        <p className="mt-6 text-sm font-sans text-muted-foreground leading-relaxed">
          This page doesn't exist in AcadSphere.
          <br />
          It may have moved or been removed.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-7 py-3 font-mono text-[11px] uppercase tracking-[0.08em] text-background transition-opacity duration-[120ms] hover:opacity-80"
          >
            Back to Home
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
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-sm text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground mb-6">
          Unexpected Error
        </p>
        <h1 className="font-sans font-bold text-2xl tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-4 text-sm font-sans text-muted-foreground leading-relaxed">
          Something went wrong. Check your connection and try again.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-foreground px-7 py-3 font-mono text-[11px] uppercase tracking-[0.08em] text-background transition-opacity duration-[120ms] hover:opacity-80"
          >
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-border px-7 py-3 font-mono text-[11px] uppercase tracking-[0.08em] text-foreground transition-colors duration-[120ms] hover:bg-accent"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AcadSphere — AI Academic Operating System" },
      {
        name: "description",
        content:
          "An AI-powered academic OS: career roadmaps, study planning, resume scoring, and more for MCA, BCA, and B.Tech students.",
      },
      { name: "author", content: "AcadSphere" },
      { property: "og:title", content: "AcadSphere — AI Academic Operating System" },
      {
        property: "og:description",
        content: "Mentor, study partner, career advisor, placement coach — in one platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // Preconnect to Google Fonts and Fontshare
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" as const },
      { rel: "preconnect", href: "https://api.fontshare.com" },
      {
        rel: "stylesheet",
        href: "https://api.fontshare.com/v2/css?f[]=switzer@100,200,300,400,500,600,700,800,900&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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

function AuthSync() {
  const router = useRouter();
  const queryClient = useQueryClient();
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      queryClient.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, queryClient]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
