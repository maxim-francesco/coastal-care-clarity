import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Section } from "@/components/site/Section";
import { getServicesAndPricing, getSiteSettings } from "@/server/services";
import {
  SITE_URL,
  createBreadcrumbSchema,
  createServiceSchema,
} from "@/lib/seo-schema";

export const Route = createFileRoute("/services")({
  loader: async () => {
    const [servicesData, settings] = await Promise.all([
      getServicesAndPricing(),
      getSiteSettings(),
    ]);
    return {
      servicesForUi: servicesData.servicesForUi,
      settings,
    };
  },
  head: (ctx) => {
    const { servicesForUi, settings } = ctx.loaderData || {
      servicesForUi: [],
      settings: {} as any,
    };
    const breadcrumbSchema = createBreadcrumbSchema("Services", "/services");
    const serviceSchemas = createServiceSchema(servicesForUi, settings);

    return {
      meta: [
        { title: "Home Services & Cleaning — Naples & SWFL | Coastal Care" },
        {
          name: "description",
          content:
            "Residential cleaning, Airbnb turnovers, home management, and vacant home watch across Naples, Bonita Springs, Estero, Fort Myers, and Marco Island.",
        },
        {
          property: "og:title",
          content: "Home Services & Cleaning — Naples & SWFL | Coastal Care",
        },
        {
          property: "og:description",
          content:
            "Residential cleaning, Airbnb turnovers, home management, and vacant home watch across Naples, Bonita Springs, Estero, Fort Myers, and Marco Island.",
        },
        { property: "og:url", content: `${SITE_URL}/services` },
        { property: "og:image", content: `${SITE_URL}/og-image.jpg` },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: "Home Services & Cleaning — Naples & SWFL | Coastal Care",
        },
        {
          name: "twitter:description",
          content:
            "Residential cleaning, Airbnb turnovers, home management, and vacant home watch across Naples, Bonita Springs, Estero, Fort Myers, and Marco Island.",
        },
        { name: "twitter:image", content: `${SITE_URL}/og-image.jpg` },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/services` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbSchema),
        },
        ...serviceSchemas.map((schema) => ({
          type: "application/ld+json" as const,
          children: JSON.stringify(schema),
        })),
      ],
    };
  },
  component: ServicesPage,
});

function ServicesPage() {
  const { servicesForUi } = Route.useLoaderData();
  return (
    <>
      <section className="bg-white pt-14 pb-10 md:pt-24 md:pb-16">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <h1 className="h-display text-[38px] md:text-[72px]">What I do.</h1>
          <p className="mt-5 text-[19px] md:text-[21px] text-muted-foreground max-w-2xl mx-auto">
            Four services, all done personally. Pick one, or combine — whichever fits your home.
          </p>
        </div>
      </section>

      {servicesForUi.map((s, i) => (
        <Section key={s.id} id={s.id} tone={i % 2 === 0 ? "grey" : "white"}>
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center ${
              i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
            }`}
          >
            <div className="relative rounded-[28px] overflow-hidden aspect-[4/3]">
              <picture className="h-full w-full object-cover">
                {s.imageVariants && (
                  <>
                    <source
                      type="image/avif"
                      srcSet={`${s.imageVariants.avif540} 540w, ${s.imageVariants.avif1080} 1080w`}
                      sizes="(max-width: 768px) 100vw, 540px"
                    />
                    <source
                      type="image/webp"
                      srcSet={`${s.imageVariants.webp540} 540w, ${s.imageVariants.webp1080} 1080w`}
                      sizes="(max-width: 768px) 100vw, 540px"
                    />
                  </>
                )}
                <img
                  src={s.imageVariants ? s.imageVariants.fallback : s.image}
                  srcSet={s.imageVariants ? `${s.imageVariants.jpg540} 540w, ${s.imageVariants.jpg1080} 1080w` : undefined}
                  sizes="(max-width: 768px) 100vw, 540px"
                  alt={s.name}
                  loading="lazy"
                  decoding="async"
                  width={1200}
                  height={900}
                  className="h-full w-full object-cover"
                />
              </picture>
              <div className="glass absolute top-4 left-4 h-10 px-4 rounded-full inline-flex items-center text-[14px] font-medium">
                {s.fromLabel}
              </div>
            </div>
            <div>
              <h2 className="h-display text-[32px] md:text-[48px]">{s.name}</h2>
              {s.paragraphs.map((p) => (
                <p key={p} className="mt-4 text-[17px] text-muted-foreground max-w-lg">
                  {p}
                </p>
              ))}
              <p className="mt-8 text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
                What's included
              </p>
              <ul className="mt-4 space-y-2.5">
                {s.includes.map((it) => (
                  <li key={it} className="flex items-start gap-3 text-[16px] text-foreground">
                    <Check size={18} strokeWidth={2.25} className="mt-1 shrink-0 text-accent" />
                    {it}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[15px] text-muted-foreground">
                <span className="text-foreground font-medium">Good for: </span>
                {s.goodFor}
              </p>
            </div>
          </div>
        </Section>
      ))}
    </>
  );
}
