import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";
import { areaNote as staticAreaNote, site } from "@/content/site";
import type { UiSiteSettings } from "@/server/services";
import { SITE_URL, createBreadcrumbSchema } from "@/lib/seo-schema";

export const Route = createFileRoute("/service-areas")({
  head: () => {
    const breadcrumbSchema = createBreadcrumbSchema(
      "Service Areas",
      "/service-areas"
    );

    return {
      meta: [
        { title: "Service Areas — Naples, Bonita Springs, Estero & SWFL" },
        {
          name: "description",
          content:
            "Coastal Care serves Naples, Bonita Springs, Estero, Fort Myers, and Marco Island with premium home watch, cleaning, and turnover services.",
        },
        {
          property: "og:title",
          content: "Service Areas — Naples, Bonita Springs, Estero & SWFL",
        },
        {
          property: "og:description",
          content:
            "Coastal Care serves Naples, Bonita Springs, Estero, Fort Myers, and Marco Island with premium home watch, cleaning, and turnover services.",
        },
        { property: "og:url", content: `${SITE_URL}/service-areas` },
        { property: "og:image", content: `${SITE_URL}/og-image.jpg` },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: "Service Areas — Naples, Bonita Springs, Estero & SWFL",
        },
        {
          name: "twitter:description",
          content:
            "Coastal Care serves Naples, Bonita Springs, Estero, Fort Myers, and Marco Island with premium home watch, cleaning, and turnover services.",
        },
        { name: "twitter:image", content: `${SITE_URL}/og-image.jpg` },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/service-areas` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbSchema),
        },
      ],
    };
  },
  component: AreasPage,
});

function AreasPage() {
  const settings = useLoaderData({ from: "__root__" }) as UiSiteSettings;
  const cities = settings?.cities ?? site.cities;
  const areaNote = settings?.areaNote ?? staticAreaNote;

  return (
    <>
      <Section tone="white">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="h-display text-[38px] md:text-[64px]">
            Southwest Florida.
          </h1>
          <p className="mt-5 text-[19px] text-muted-foreground">
            I stay close to home so I can respond quickly.
          </p>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {cities.map((c) => (
            <span
              key={c}
              className="pill-chip !h-12 !px-6 !text-[17px] font-medium"
            >
              {c}
            </span>
          ))}
        </div>
      </Section>

      <Section tone="grey">
        <div
          className="relative mx-auto max-w-3xl aspect-[16/10] rounded-[28px] overflow-hidden border"
          role="img"
          aria-label="Illustrated map of Southwest Florida service area"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white to-[#EAF2FB]" />
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 600 375"
            fill="none"
            aria-hidden="true"
          >
            {/* stylized coastline */}
            <path
              d="M 0 90 C 120 60, 180 140, 220 180 S 280 300, 340 320 L 340 375 L 0 375 Z"
              fill="#E4EEF9"
            />
            <path
              d="M 0 90 C 120 60, 180 140, 220 180 S 280 300, 340 320"
              stroke="#0071E3"
              strokeOpacity="0.35"
              strokeWidth="1.5"
              fill="none"
            />
            {/* city dots */}
            {[
              { x: 155, y: 170, l: "Fort Myers" },
              { x: 170, y: 210, l: "Estero" },
              { x: 185, y: 235, l: "Bonita Springs" },
              { x: 205, y: 270, l: "Naples" },
              { x: 230, y: 315, l: "Marco Island" },
            ].map((p) => (
              <g key={p.l}>
                <circle cx={p.x} cy={p.y} r="5" fill="#0071E3" />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="12"
                  fill="#0071E3"
                  fillOpacity="0.12"
                />
                <text
                  x={p.x + 16}
                  y={p.y + 4}
                  fontSize="12"
                  fill="#1D1D1F"
                  fontFamily="Inter Tight, Inter, sans-serif"
                  fontWeight={500}
                >
                  {p.l}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <p className="mt-8 text-[15px] text-muted-foreground text-center max-w-xl mx-auto">
          {areaNote} Travel beyond these cities is possible with a small trip fee.
        </p>
      </Section>
    </>
  );
}
