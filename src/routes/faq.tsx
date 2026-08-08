import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";
import { FaqAccordion } from "@/components/site/Accordion";
import { getFaqs } from "@/server/services";

export const Route = createFileRoute("/faq")({
  loader: () => getFaqs(),
  head: () => ({
    meta: [
      { title: "FAQ — Coastal Care Home Services" },
      {
        name: "description",
        content:
          "Answers to common questions about cleaning, turnovers, home management, and home watch in Southwest Florida.",
      },
      { property: "og:title", content: "FAQ — Coastal Care" },
      {
        property: "og:description",
        content: "Common questions about our services in Southwest Florida.",
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const faqs = Route.useLoaderData();
  return (
    <>
      <Section tone="white">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="h-display text-[38px] md:text-[64px]">
            Common questions.
          </h1>
          <p className="mt-5 text-[19px] text-muted-foreground">
            Don't see yours? Send a note — I answer personally.
          </p>
        </div>
        <div className="mt-12 max-w-3xl mx-auto">
          <FaqAccordion items={faqs} />
        </div>
      </Section>
    </>
  );
}
