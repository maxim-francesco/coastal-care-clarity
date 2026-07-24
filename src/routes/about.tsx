import { createFileRoute } from "@tanstack/react-router";
import portrait from "@/assets/portrait.jpg";
import { Section } from "@/components/site/Section";
import { site } from "@/content/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Maria — Coastal Care Home Services" },
      {
        name: "description",
        content:
          "Meet Maria Reyes, the owner and operator of Coastal Care Home Services in Naples, Florida.",
      },
      { property: "og:title", content: "About Maria — Coastal Care" },
      {
        property: "og:description",
        content:
          "One person, five cities, seven years of looking after Southwest Florida homes.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <Section tone="white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="rounded-[28px] overflow-hidden aspect-[4/5] max-w-md">
            <img
              src={portrait}
              alt="Portrait of Maria Reyes, owner of Coastal Care"
              width={1000}
              height={1200}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="h-display text-[38px] md:text-[64px]">
              Hi, I'm Maria.
            </h1>
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
          </div>
        </div>
      </Section>

      <Section tone="grey">
        <ul className="max-w-3xl mx-auto hairline-t">
          {[
            "Licensed & Insured in Florida",
            "Background checked",
            "English & Spanish",
            site.since,
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
