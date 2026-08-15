import cleaningAvif540 from "@/assets/cleaning-540w.avif";
import cleaningAvif1080 from "@/assets/cleaning-1080w.avif";
import cleaningWebp540 from "@/assets/cleaning-540w.webp";
import cleaningWebp1080 from "@/assets/cleaning-1080w.webp";
import cleaningJpg540 from "@/assets/cleaning-540w.jpg";
import cleaningJpg1080 from "@/assets/cleaning-1080w.jpg";
import cleaningImg from "@/assets/cleaning.jpg";

import turnoverAvif540 from "@/assets/turnover-540w.avif";
import turnoverAvif1080 from "@/assets/turnover-1080w.avif";
import turnoverWebp540 from "@/assets/turnover-540w.webp";
import turnoverWebp1080 from "@/assets/turnover-1080w.webp";
import turnoverJpg540 from "@/assets/turnover-540w.jpg";
import turnoverJpg1080 from "@/assets/turnover-1080w.jpg";
import turnoverImg from "@/assets/turnover.jpg";

import managementAvif540 from "@/assets/management-540w.avif";
import managementAvif1080 from "@/assets/management-1080w.avif";
import managementWebp540 from "@/assets/management-540w.webp";
import managementWebp1080 from "@/assets/management-1080w.webp";
import managementJpg540 from "@/assets/management-540w.jpg";
import managementJpg1080 from "@/assets/management-1080w.jpg";
import managementImg from "@/assets/management.jpg";

import homewatchAvif540 from "@/assets/homewatch-540w.avif";
import homewatchAvif1080 from "@/assets/homewatch-1080w.avif";
import homewatchWebp540 from "@/assets/homewatch-540w.webp";
import homewatchWebp1080 from "@/assets/homewatch-1080w.webp";
import homewatchJpg540 from "@/assets/homewatch-540w.jpg";
import homewatchJpg1080 from "@/assets/homewatch-1080w.jpg";
import homewatchImg from "@/assets/homewatch.jpg";

export const site = {
  brand: "Coastal Care Home Services",
  owner: "Eugenia Bucur Grecu",
  phone: "(239) 571-4461",
  phoneHref: "tel:+12395714461",
  hours: "Mon–Sat, 8am–5pm",
  since: "Serving Southwest Florida since 2019",
  cities: ["Naples", "Bonita Springs", "Estero", "Fort Myers", "Marco Island"],
  nav: [
    { label: "Services", to: "/services" },
    { label: "Pricing", to: "/pricing" },
    { label: "About", to: "/about" },
    { label: "Areas", to: "/service-areas" },
    { label: "FAQ", to: "/faq" },
    { label: "Contact", to: "/contact" },
  ],
  trust: ["Licensed & Insured", "Background checked", "Photo report after every visit"],
} as const;

export type ServiceImageVariants = {
  avif540: string;
  avif1080: string;
  webp540: string;
  webp1080: string;
  jpg540: string;
  jpg1080: string;
  fallback: string;
};

export type Service = {
  id: "cleaning" | "turnover" | "management" | "home-watch";
  name: string;
  short: string;
  fromLabel: string;
  image: string;
  imageVariants?: ServiceImageVariants;
  paragraphs: string[];
  includes: string[];
  goodFor: string;
};

export const services: Service[] = [
  {
    id: "cleaning",
    name: "Residential Cleaning",
    short: "Recurring visits, deep cleans, and move-in or move-out days.",
    fromLabel: "from $140",
    image: cleaningImg,
    imageVariants: {
      avif540: cleaningAvif540,
      avif1080: cleaningAvif1080,
      webp540: cleaningWebp540,
      webp1080: cleaningWebp1080,
      jpg540: cleaningJpg540,
      jpg1080: cleaningJpg1080,
      fallback: cleaningImg,
    },
    paragraphs: [
      "Weekly, bi-weekly, or monthly cleanings kept to a steady rhythm so your home always feels ready.",
      "Deep cleans and move-day service are billed separately with a clear scope before I start.",
    ],
    includes: [
      "Kitchens: counters, cabinet fronts, appliances outside",
      "Bathrooms: tubs, showers, tile, mirrors, fixtures",
      "Bedrooms: dusting, floors, linen change on request",
      "Living areas: dusting, vacuuming, mopping",
      "Trash and recycling out",
      "Light tidying and simple staging",
    ],
    goodFor: "Owners who want a spotless home without managing a rotating crew.",
  },
  {
    id: "turnover",
    name: "Vacation Rental Turnover",
    short: "Between guests: clean, restock, restage, ready for check-in.",
    fromLabel: "from $115",
    image: turnoverImg,
    imageVariants: {
      avif540: turnoverAvif540,
      avif1080: turnoverAvif1080,
      webp540: turnoverWebp540,
      webp1080: turnoverWebp1080,
      jpg540: turnoverJpg540,
      jpg1080: turnoverJpg1080,
      fallback: turnoverImg,
    },
    paragraphs: [
      "Same-day turnovers between check-out and check-in, done to a repeatable checklist so every guest walks into the same standard.",
      "I coordinate with your booking calendar and send a photo report before the next guest arrives.",
    ],
    includes: [
      "Full clean of kitchen, baths, and living areas",
      "Fresh linens and towels, made to spec",
      "Consumables restock: coffee, paper, soap",
      "Restage per your listing photos",
      "Trash and recycling out, dishwasher run",
      "Damage or missing-item report with photos",
    ],
    goodFor: "Hosts running one to five properties in SWFL.",
  },
  {
    id: "management",
    name: "Home Management",
    short: "Vendors, deliveries, contractors, and errands handled on your behalf.",
    fromLabel: "from $65/hr",
    image: managementImg,
    imageVariants: {
      avif540: managementAvif540,
      avif1080: managementAvif1080,
      webp540: managementWebp540,
      webp1080: managementWebp1080,
      jpg540: managementJpg540,
      jpg1080: managementJpg1080,
      fallback: managementImg,
    },
    paragraphs: [
      "A single point of contact for the small things that pile up when you're busy or out of state: meeting the a/c tech, accepting a delivery, running an errand before you arrive.",
      "Billed hourly with a two-hour minimum, or on a monthly retainer for regular support.",
    ],
    includes: [
      "Meet and supervise vendors or contractors",
      "Accept and place deliveries",
      "Grocery and pharmacy runs before arrival",
      "Mail pickup and package handling",
      "Key handoffs and access coordination",
      "Written recap after every visit",
    ],
    goodFor: "Part-time residents and busy owners who need someone on the ground.",
  },
  {
    id: "home-watch",
    name: "Home Watch",
    short: "Scheduled check-ins for vacant seasonal homes.",
    fromLabel: "from $65",
    image: homewatchImg,
    imageVariants: {
      avif540: homewatchAvif540,
      avif1080: homewatchAvif1080,
      webp540: homewatchWebp540,
      webp1080: homewatchWebp1080,
      jpg540: homewatchJpg540,
      jpg1080: homewatchJpg1080,
      fallback: homewatchImg,
    },
    paragraphs: [
      "A calm, thorough walk-through of your empty home on a set schedule. I look for the things that quietly turn into big problems — humidity creeping up, a slow leak, pests, storm impact.",
      "You get a photo report after every visit, and a phone call the same day if anything needs your attention.",
    ],
    includes: [
      "A/C running and humidity check",
      "Run water at every fixture, flush toilets",
      "Visual leak and mold inspection",
      "Doors, windows, and locks verified",
      "Pest and storm-damage check",
      "Timestamped photo report by email",
    ],
    goodFor: "Snowbirds and seasonal owners away three months or more.",
  },
];

export const pricing = {
  intro: {
    title: "Honest starting prices.",
    sub: "Your final quote comes after a short call or walkthrough — square footage, frequency, and condition all change the number.",
  },
  cards: [
    {
      id: "cleaning",
      name: "Residential Cleaning",
      from: "$140",
      unit: "per visit",
      note: "Recurring bi-weekly, up to 2,000 sq ft. Deep clean from $290. Move-in/out from $360.",
      includes: [
        "Kitchen, baths, living areas",
        "Dusting, vacuuming, mopping",
        "Supplies included",
        "Same cleaner every visit — me",
        "Photo report on request",
      ],
      featured: false,
    },
    {
      id: "turnover",
      name: "Vacation Rental Turnover",
      from: "$115",
      unit: "per turnover",
      note: "Linens +$25. Same-day turnover +$40.",
      includes: [
        "Full clean between guests",
        "Fresh linens and towels",
        "Consumables restocked",
        "Restaged to your listing",
        "Damage report with photos",
      ],
      featured: false,
    },
    {
      id: "management",
      name: "Home Management",
      from: "$65",
      unit: "per hour, 2-hour minimum",
      note: "Monthly retainer from $275/mo for regular support.",
      includes: [
        "Vendor and contractor meetings",
        "Deliveries and errands",
        "Mail and package handling",
        "Access coordination",
        "Written recap after each visit",
      ],
      featured: false,
    },
    {
      id: "home-watch",
      name: "Home Watch",
      from: "$65",
      unit: "per visit",
      note: "$120/mo bi-weekly · $210/mo weekly · Post-storm inspection from $95.",
      includes: [
        "A/C and humidity check",
        "Water run at every fixture",
        "Leak, mold, and pest check",
        "Storm-damage walk-through",
        "Timestamped photo report",
        "Same-day call if something is wrong",
      ],
      featured: true,
    },
  ],
  included: [
    "Supplies and equipment",
    "Licensed and insured",
    "Photo report",
    "No contracts",
  ],
  affects: [
    "Home size and number of bathrooms",
    "How often I visit",
    "Pets in the home",
    "Condition on arrival",
    "Distance from Naples",
  ],
  cancellation:
    "No contracts. Cancel or reschedule up to 24 hours before with no fee.",
};

export const howVisitWorks = [
  {
    step: "01",
    title: "Walk the exterior",
    body: "Check the roof line, windows, doors, and any storm signs.",
  },
  {
    step: "02",
    title: "Inside, top to bottom",
    body: "A/C, humidity, plumbing, leaks, pests, and appliances.",
  },
  {
    step: "03",
    title: "Run water and test systems",
    body: "Every fixture and toilet, plus a quick smoke and CO check.",
  },
  {
    step: "04",
    title: "Photo report by email",
    body: "Timestamped photos and a note — same day, every visit.",
  },
];

export const whyMe = [
  {
    n: "01",
    title: "One person, every visit",
    body: "You always know who is in your home. No rotating crews, no subcontractors.",
  },
  {
    n: "02",
    title: "Written after every visit",
    body: "Photos and a short note by email, so you can see what I saw.",
  },
  {
    n: "03",
    title: "Insured and local",
    body: "Licensed and insured in Florida, based in Naples, on the road every day.",
  },
];

export const quotes = [
  {
    text: "Eugenia has watched our home for three summers. It's the first time I actually stop worrying when we fly north.",
    who: "Linda H., Naples",
  },
  {
    text: "The photo report is small thing that changes everything. I know what my house looks like right now.",
    who: "David R., Marco Island",
  },
];

export const faqs = [
  {
    q: "Do I need to be home?",
    a: "No. Most clients give me a key or a code. I confirm access before every visit and lock up when I leave.",
  },
  {
    q: "Do you bring supplies?",
    a: "Yes. Standard cleaning supplies and equipment are included. If you prefer a specific product, leave it out and I'll use it.",
  },
  {
    q: "How much does it cost?",
    a: "Starting prices are on the pricing page. Your final quote comes after a short call or walkthrough — size, frequency, and condition all change the number.",
  },
  {
    q: "How often should home watch visits happen?",
    a: "Bi-weekly covers most seasonal homes. Weekly is a good idea in storm season or if you have a pool without a service.",
  },
  {
    q: "What happens if you find a problem?",
    a: "You get a phone call the same day, photos by email, and I coordinate the vendor if you want me to. You decide what happens next.",
  },
  {
    q: "Are you insured?",
    a: "Yes — licensed and insured in Florida, including general liability. I can send a certificate on request.",
  },
  {
    q: "How do I pay?",
    a: "Invoices by email. Card, ACH, or check. Payment is due within seven days.",
  },
  {
    q: "Do you require a contract?",
    a: "No. Everything is month to month. Cancel or reschedule up to 24 hours before with no fee.",
  },
  {
    q: "Can I skip a scheduled cleaning?",
    a: "Yes. Text me at least 24 hours ahead and we'll shift the visit.",
  },
  {
    q: "Do you handle vacation rentals?",
    a: "Yes — turnover cleaning, linens, and restocking on your booking schedule. I typically work with hosts running one to five properties.",
  },
];

export const areaNote =
  "I stay close to home so I can respond quickly. If you're just outside these cities, ask — I may already be nearby.";
