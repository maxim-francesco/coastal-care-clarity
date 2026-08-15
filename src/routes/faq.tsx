import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";
import { FaqAccordion } from "@/components/site/Accordion";
import { getFaqs } from "@/server/services";
import {
  SITE_URL,
  createBreadcrumbSchema,
  createFaqSchema,
} from "@/lib/seo-schema";

export const Route = createFileRoute("/faq")({
  loader: () => getFaqs(),
  head: (ctx) => {
    const faqs = ctx.loaderData || [];
    const breadcrumbSchema = createBreadcrumbSchema("FAQ", "/faq");
    const faqSchema = createFaqSchema(faqs);

    return {
      meta: [
        { title: "FAQ — Home Cleaning & Home Watch Questions | Coastal Care" },
        {
          name: "description",
          content:
            "Answers to frequent questions about home watch schedules, cleaning supplies, turnover coordination, and insurance in Southwest Florida.",
        },
        {
          property: "og:title",
          content: "FAQ — Home Cleaning & Home Watch Questions | Coastal Care",
        },
        {
          property: "og:description",
          content:
            "Answers to frequent questions about home watch schedules, cleaning supplies, turnover coordination, and insurance in Southwest Florida.",
        },
        { property: "og:url", content: `${SITE_URL}/faq` },
        { property: "og:image", content: `${SITE_URL}/og-image.jpg` },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: "FAQ — Home Cleaning & Home Watch Questions | Coastal Care",
        },
        {
          name: "twitter:description",
          content:
            "Answers to frequent questions about home watch schedules, cleaning supplies, turnover coordination, and insurance in Southwest Florida.",
        },
        { name: "twitter:image", content: `${SITE_URL}/og-image.jpg` },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/faq` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbSchema),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(faqSchema),
        },
      ],
    };
  },
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
