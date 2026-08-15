import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import portraitAvif448 from "@/assets/portrait-448w.avif";
import portraitAvif896 from "@/assets/portrait-896w.avif";
import portraitWebp448 from "@/assets/portrait-448w.webp";
import portraitWebp896 from "@/assets/portrait-896w.webp";
import portraitJpg448 from "@/assets/portrait-448w.jpg";
import portraitJpg896 from "@/assets/portrait-896w.jpg";
import portrait from "@/assets/portrait.jpg";
import { Section } from "@/components/site/Section";
import { site } from "@/content/site";
import { getSiteSettings, type UiSiteSettings } from "@/server/services";
import { SITE_URL, createBreadcrumbSchema } from "@/lib/seo-schema";

export const Route = createFileRoute("/about")({
  loader: () => getSiteSettings(),
  head: (ctx) => {
    const settings = ctx.loaderData as UiSiteSettings;
    const ownerName = settings?.owner || "Eugenia Bucur Grecu";
    const ownerFirstName = ownerName.split(" ")[0];
    const breadcrumbSchema = createBreadcrumbSchema("About", "/about");

    return {
      meta: [
        { title: `About ${ownerFirstName} — Coastal Care Home Services` },
        {
          name: "description",
          content: `Meet ${ownerName}, owner of Coastal Care Home Services. Personal cleaning, home management, and home watch in Naples & SWFL.`,
        },
        {
          property: "og:title",
          content: `About ${ownerFirstName} — Coastal Care Home Services`,
        },
        {
          property: "og:description",
          content: `Meet ${ownerName}, owner of Coastal Care Home Services. Personal cleaning, home management, and home watch in Naples & SWFL.`,
        },
        { property: "og:url", content: `${SITE_URL}/about` },
        { property: "og:image", content: `${SITE_URL}/og-image.jpg` },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: `About ${ownerFirstName} — Coastal Care Home Services`,
        },
        {
          name: "twitter:description",
          content: `Meet ${ownerName}, owner of Coastal Care Home Services. Personal cleaning, home management, and home watch in Naples & SWFL.`,
        },
        { name: "twitter:image", content: `${SITE_URL}/og-image.jpg` },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/about` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbSchema),
        },
      ],
    };
  },
  component: AboutPage,
});

function AboutPage() {
  const settings = useLoaderData({ from: "__root__" }) as UiSiteSettings;
  const owner = settings?.owner ?? site.owner;
  const brand = settings?.brand ?? site.brand;
  const since = settings?.since ?? site.since;
  const aboutBio = settings?.aboutBio ?? [];

  const ownerFirstName = owner.split(" ")[0];

  return (
    <>
      <Section tone="white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="rounded-[28px] overflow-hidden aspect-[4/5] max-w-md">
            <picture className="h-full w-full object-cover">
              <source
                type="image/avif"
                srcSet={`${portraitAvif448} 448w, ${portraitAvif896} 896w`}
                sizes="(max-width: 768px) 100vw, 448px"
              />
              <source
                type="image/webp"
                srcSet={`${portraitWebp448} 448w, ${portraitWebp896} 896w`}
                sizes="(max-width: 768px) 100vw, 448px"
              />
              <img
                src={portraitJpg448}
                srcSet={`${portraitJpg448} 448w, ${portraitJpg896} 896w`}
                sizes="(max-width: 768px) 100vw, 448px"
                alt={`Portrait of ${owner}, owner of ${brand}`}
                width={1000}
                height={1200}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </picture>
          </div>
          <div>
            <h1 className="h-display text-[38px] md:text-[64px]">
              Hi, I'm {ownerFirstName}.
            </h1>
            {aboutBio.length > 0 ? (
              aboutBio.map((paragraph, index) => (
                <p key={index} className={`text-[17px] text-muted-foreground ${index === 0 ? "mt-6" : "mt-4"}`}>
                  {paragraph}
                </p>
              ))
            ) : (
              <>
                <p className="mt-6 text-[17px] text-muted-foreground">
                  I started Coastal Care in 2019 after years of taking care of
                  other people's homes for a big company that didn't take care of
                  them. I wanted to work differently — one person, small number of
                  clients, personal attention, no rotating crews.
                </p>
                <p className="mt-4 text-[17px] text-muted-foreground">
                  What I care about is simple. Your home should feel calm when you
                  walk in the door, and looked after when you're not there. If I
                  see something small becoming something big, I tell you the same
                  day.
                </p>
                <p className="mt-4 text-[17px] text-muted-foreground">
                  I work with a small number of families across Naples, Bonita
                  Springs, Estero, Fort Myers, and Marco Island. If we're a good
                  fit, I'd love to help.
                </p>
              </>
            )}
          </div>
        </div>
      </Section>

      <Section tone="grey">
        <ul className="max-w-3xl mx-auto hairline-t">
          {[
            "Licensed & Insured in Florida",
            "Background checked",
            "English & Spanish",
            since,
          ].map((i) => (
            <li
              key={i}
              className="hairline-b py-5 text-[17px] font-medium tracking-tight"
            >
              {i}
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
