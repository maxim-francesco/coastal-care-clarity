import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { StickyBar } from "@/components/site/StickyBar";
import { AuthProvider } from "@/lib/auth";
import { getSiteSettings } from "@/server/services";
import { SITE_URL, createLocalBusinessSchema, createWebSiteSchema } from "@/lib/seo-schema";

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
    console.error(error);
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
    loader: () => getSiteSettings(),
    head: (ctx) => {
      const settings = ctx.loaderData;
      const isAdmin = (ctx as any).match?.pathname?.startsWith("/admin") || (ctx as any).matches?.some((m: any) => m.pathname?.startsWith("/admin"));
      const localBusinessSchema = createLocalBusinessSchema(settings);
      const websiteSchema = createWebSiteSchema();

      return {
        meta: [
          { charSet: "utf-8" },
          {
            name: "viewport",
            content: "width=device-width, initial-scale=1, viewport-fit=cover",
          },
          { name: "theme-color", content: "#ffffff" },
          {
            name: "google-site-verification",
            content: "tMOyqmhNHRIsMhjl7ah8bvECk4TtKHJHHVTl8mGYcgs",
          },
          { title: "Coastal Care Home Services — Southwest Florida" },
          {
            name: "description",
            content:
              "One person looking after your Florida home. Cleaning, vacation turnovers, home management, and home watch across Naples, Bonita Springs, Estero, Fort Myers, and Marco Island.",
          },
          { name: "author", content: "Coastal Care Home Services" },
          { property: "og:site_name", content: "Coastal Care Home Services" },
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
          { property: "og:image", content: `${SITE_URL}/og-image.jpg` },
          { property: "og:image:width", content: "1200" },
          { property: "og:image:height", content: "630" },
          { property: "og:image:type", content: "image/jpeg" },
          {
            property: "og:image:alt",
            content:
              "Coastal Care Home Services — Cleaning, Turnovers, Home Management, Home Watch in SWFL",
          },
          { name: "twitter:card", content: "summary_large_image" },
          {
            name: "twitter:title",
            content: "Coastal Care Home Services — Southwest Florida",
          },
          {
            name: "twitter:description",
            content:
              "Cleaning, vacation turnovers, home management, and home watch across SWFL.",
          },
          { name: "twitter:image", content: `${SITE_URL}/og-image.jpg` },
          {
            name: "twitter:image:alt",
            content:
              "Coastal Care Home Services — Cleaning, Turnovers, Home Management, Home Watch in SWFL",
          },
        ],
        links: [
          { rel: "stylesheet", href: appCss },
          { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
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
        scripts: isAdmin
          ? []
          : [
              {
                type: "application/ld+json",
                children: JSON.stringify(localBusinessSchema),
              },
              {
                type: "application/ld+json",
                children: JSON.stringify(websiteSchema),
              },
            ],
      };
    },
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
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Header />
        <main className="pt-12 md:pt-14 pb-24 md:pb-0">
          <Outlet />
        </main>
        <Footer />
        <StickyBar />
      </AuthProvider>
    </QueryClientProvider>
  );
}
