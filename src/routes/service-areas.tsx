import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";
import { areaNote, site } from "@/content/site";

export const Route = createFileRoute("/service-areas")({
  head: () => ({
    meta: [
      { title: "Service Areas — Coastal Care Home Services" },
      {
        name: "description",
        content:
          "Serving Naples, Bonita Springs, Estero, Fort Myers, and Marco Island in Southwest Florida.",
      },
      { property: "og:title", content: "Service Areas — Coastal Care" },
      {
        property: "og:description",
        content:
          "Serving Naples, Bonita Springs, Estero, Fort Myers, and Marco Island.",
      },
    ],
  }),
  component: AreasPage,
});

function AreasPage() {
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
          {site.cities.map((c) => (
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
