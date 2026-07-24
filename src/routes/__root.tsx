import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { StickyBar } from "@/components/site/StickyBar";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-5">
      <div className="max-w-md text-center">
        <h1 className="h-display text-[64px]">404</h1>
        <p className="mt-3 text-muted-foreground">
          That page isn't here. Let's get you back.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-pill btn-primary">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-5">
      <div className="max-w-md text-center">
        <h1 className="h-display text-[28px]">Something went wrong.</h1>
        <p className="mt-3 text-muted-foreground">
          Please refresh, or try again in a moment.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-pill btn-primary"
          >
            Try again
          </button>
          <a href="/" className="btn-pill btn-secondary">
            Go home
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
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, viewport-fit=cover",
        },
        { title: "Coastal Care Home Services — Southwest Florida" },
        {
          name: "description",
          content:
            "One person looking after your Florida home. Cleaning, vacation turnovers, home management, and home watch across Naples, Bonita Springs, Estero, Fort Myers, and Marco Island.",
        },
        { name: "author", content: "Coastal Care Home Services" },
        {
          property: "og:title",
          content: "Coastal Care Home Services — Southwest Florida",
        },
        {
          property: "og:description",
          content:
            "Cleaning, vacation turnovers, home management, and home watch across SWFL — done by one person, every visit.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&display=swap",
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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <main className="pt-12 md:pt-14 pb-24 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <StickyBar />
    </QueryClientProvider>
  );
}
