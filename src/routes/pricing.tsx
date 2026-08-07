import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Section } from "@/components/site/Section";
import { Segmented } from "@/components/site/Segmented";
import { pricing, site } from "@/content/site";
import { getServicesAndPricing } from "@/server/services";


export const Route = createFileRoute("/pricing")({
  loader: () => getServicesAndPricing(),
  head: () => ({
    meta: [
      { title: "Pricing — Coastal Care Home Services" },
      {
        name: "description",
        content:
          "Honest starting prices for residential cleaning, vacation turnovers, home management, and home watch in Southwest Florida.",
      },
      { property: "og:title", content: "Pricing — Coastal Care Home Services" },
      {
        property: "og:description",
        content:
          "Starting prices for cleaning, turnovers, management, and home watch across SWFL.",
      },
    ],
  }),
  component: PricingPage,
});


function PricingPage() {
  const { pricingCardsForUi } = Route.useLoaderData();
  return (
    <>
      <section className="relative bg-white pt-14 pb-10 md:pt-24 md:pb-16 overflow-hidden">
        <div className="ambient-blue absolute top-10 left-1/2 -translate-x-1/2 h-[480px] w-[720px]" />
        <div className="relative mx-auto max-w-4xl px-5 text-center">
          <h1 className="h-display text-[38px] md:text-[72px]">
            {pricing.intro.title}
          </h1>
          <p className="mt-5 text-[19px] md:text-[21px] text-muted-foreground max-w-2xl mx-auto">
            {pricing.intro.sub}
          </p>
          <div className="mt-8 flex justify-center">
            <Segmented options={["One-time", "Recurring"]} />
          </div>
        </div>
      </section>

      <Section tone="white" className="!pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {pricingCardsForUi.map((c) => {
            const featured = c.featured;
            return (
              <div
                key={c.id}
                className={`relative rounded-[20px] p-7 md:p-8 ${
                  featured
                    ? "glass ring-1 ring-[color:var(--accent)]/50"
                    : "bg-white border"
                }`}
              >
                {featured && (
                  <span className="absolute -top-3 left-6 inline-flex h-6 items-center rounded-full bg-accent text-white px-3 text-[12px] font-medium">
                    Most requested
                  </span>
                )}
                <p className="text-[15px] text-muted-foreground">{c.name}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-[36px] font-semibold tracking-tight">
                    {c.from}
                  </span>
                  <span className="text-[15px] text-muted-foreground">
                    {c.unit}
                  </span>
                </div>
                <p className="mt-3 text-[15px] text-muted-foreground">
                  {c.note}
                </p>
                <p className="mt-6 text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
                  Includes
                </p>
                <ul className="mt-3 space-y-2.5">
                  {c.includes.map((i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-[16px] text-foreground"
                    >
                      <Check
                        size={18}
                        strokeWidth={2.25}
                        className="mt-1 shrink-0 text-accent"
                      />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      <Section tone="grey">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h2 className="h-display text-[26px] md:text-[36px]">
              Included in every job.
            </h2>
            <ul className="mt-6 space-y-3">
              {pricing.included.map((i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-[17px] text-foreground"
                >
                  <Check
                    size={18}
                    strokeWidth={2.25}
                    className="mt-1.5 shrink-0 text-accent"
                  />
                  {i}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="h-display text-[26px] md:text-[36px]">
              What affects your price.
            </h2>
            <ul className="mt-6 space-y-3 text-[17px] text-muted-foreground">
              {pricing.affects.map((i) => (
                <li key={i} className="hairline-b pb-3">
                  {i}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-12 text-[15px] text-muted-foreground max-w-2xl">
          {pricing.cancellation}
        </p>
      </Section>

      <Section tone="white">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="h-display text-[34px] md:text-[56px]">
            Get your quote.
          </h2>
          <p className="mt-4 text-[19px] text-muted-foreground">
            A short call is all it takes.
          </p>
          <div className="mt-8">
            <Link to="/contact" className="btn-pill btn-primary">
              Get a quote
            </Link>
          </div>
          <a
            href={site.phoneHref}
            className="mt-4 block text-[15px] text-muted-foreground"
          >
            or call {site.phone}
          </a>
        </div>
      </Section>
    </>
  );
}
