import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";
import { Section } from "@/components/site/Section";
import { ServiceCard } from "@/components/site/ServiceCard";
import {
  services,
  quotes,
  whyMe,
  howVisitWorks,
  pricing,
  site,
} from "@/content/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Coastal Care Home Services — Naples, FL" },
      {
        name: "description",
        content:
          "Cleaning, vacation turnovers, home management, and home watch across Southwest Florida. One person, every visit. Licensed and insured.",
      },
      {
        property: "og:title",
        content: "Coastal Care Home Services — Naples, FL",
      },
      {
        property: "og:description",
        content:
          "One person looking after your Florida home. Cleaning, turnovers, home management, home watch.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative bg-white pt-16 pb-16 md:pt-24 md:pb-24 overflow-hidden">
        <div className="ambient-blue absolute -top-24 left-1/2 -translate-x-1/2 h-[520px] w-[720px]" />
        <div className="relative mx-auto max-w-6xl px-5 text-center">
          <h1 className="h-display text-[40px] md:text-[80px] max-w-4xl mx-auto rise-in">
            Your Florida home.
            <br />
            Looked after by one person.
          </h1>
          <p className="mt-5 md:mt-6 text-[19px] md:text-[24px] text-muted-foreground max-w-xl mx-auto tracking-tight">
            Cleaning, vacation turnovers, home management and home watch across
            Southwest Florida.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            <Link to="/contact" className="btn-pill btn-primary">
              Get a quote
            </Link>
            <Link to="/pricing" className="link-arrow">
              See pricing
            </Link>
          </div>
          <div className="mt-12 md:mt-16 mx-auto rounded-[28px] overflow-hidden aspect-[4/3] md:aspect-[16/9] max-w-5xl">
            <img
              src={heroImg}
              alt="Bright, sunlit Florida living room with folded linen and open windows"
              width={1600}
              height={1200}
              className="h-full w-full object-cover"
            />
          </div>
          <p className="mt-6 text-[13px] text-muted-foreground">
            {site.trust.join(" · ")}
          </p>
        </div>
      </section>

      {/* SERVICES */}
      <Section tone="grey">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="h-display text-[34px] md:text-[56px]">
            Four ways I can help.
          </h2>
          <p className="mt-4 text-[19px] md:text-[21px] text-muted-foreground">
            Pick one, or combine — most clients do.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {services.map((s) => (
            <ServiceCard key={s.id} s={s} />
          ))}
        </div>
      </Section>

      {/* HOME WATCH FEATURE */}
      <Section tone="white">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="h-display text-[34px] md:text-[56px]">
            Peace of mind while you're away.
          </h2>
          <p className="mt-4 text-[19px] text-muted-foreground">
            Home watch is a slow, careful check-in on a vacant home. I look for
            the quiet problems — humidity, leaks, pests, storm damage — before
            they become expensive ones. Every visit ends with a photo report by
            email.
          </p>
        </div>
        <ol className="mt-12 grid grid-cols-1 md:grid-cols-4">
          {howVisitWorks.map((step, i) => (
            <li
              key={step.step}
              className={`p-6 md:p-6 ${
                i > 0 ? "hairline-t md:hairline-t md:border-t-0" : ""
              } ${i > 0 ? "md:border-l" : ""}`}
            >
              <p className="text-muted-foreground text-[14px] tracking-tight">
                {step.step}
              </p>
              <p className="mt-2 text-[19px] font-semibold tracking-tight">
                {step.title}
              </p>
              <p className="mt-2 text-[15px] text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* PRICING PREVIEW */}
      <Section tone="grey">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="h-display text-[34px] md:text-[56px]">
            Simple starting prices.
          </h2>
          <p className="mt-4 text-[19px] text-muted-foreground">
            Your final quote comes after a short call.
          </p>
        </div>
        <ul className="mt-10 max-w-3xl mx-auto hairline-t">
          {pricing.cards.map((c) => (
            <li
              key={c.id}
              className="hairline-b flex items-baseline justify-between py-5"
            >
              <span className="text-[17px] font-medium">{c.name}</span>
              <span className="text-[17px] text-muted-foreground">
                <span className="text-foreground font-semibold">{c.from}</span>{" "}
                {c.unit}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-8 text-center">
          <Link to="/pricing" className="btn-pill btn-primary">
            See full pricing
          </Link>
        </div>
      </Section>

      {/* WHY ME */}
      <Section tone="white">
        <div className="max-w-3xl">
          <h2 className="h-display text-[34px] md:text-[56px]">
            Why work with me.
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {whyMe.map((w) => (
            <div key={w.n}>
              <p className="text-[42px] font-semibold text-muted-foreground tracking-tight">
                {w.n}
              </p>
              <p className="mt-3 text-[21px] font-semibold tracking-tight">
                {w.title}
              </p>
              <p className="mt-2 text-[16px] text-muted-foreground">
                {w.body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* AREAS */}
      <Section tone="grey">
        <div className="max-w-2xl">
          <h2 className="h-display text-[30px] md:text-[44px]">
            Serving Southwest Florida.
          </h2>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {site.cities.map((c) => (
            <span key={c} className="pill-chip">
              {c}
            </span>
          ))}
          <span className="pill-chip !text-muted-foreground">
            Not on the list? Just ask.
          </span>
        </div>
      </Section>

      {/* QUOTES */}
      <Section tone="white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          {quotes.map((q) => (
            <figure key={q.who}>
              <blockquote className="text-[24px] md:text-[28px] font-medium tracking-tight text-foreground leading-snug">
                “{q.text}”
              </blockquote>
              <figcaption className="mt-4 text-[15px] text-muted-foreground">
                — {q.who}
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* CLOSING CTA */}
      <Section tone="grey">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="h-display text-[36px] md:text-[64px]">
            Ready to talk?
          </h2>
          <p className="mt-4 text-[19px] text-muted-foreground">
            A short call is the fastest way to a real quote.
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
