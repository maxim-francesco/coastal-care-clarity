import type { UiService, UiSiteSettings, UiFaqItem } from "@/server/services";

export const SITE_URL = "https://coastalcarehome.us";

function createCityAreaServed(cities: string[]) {
  return cities.map((city) => ({
    "@type": "City",
    name: city,
    containedInPlace: {
      "@type": "State",
      name: "Florida",
    },
  }));
}

function cleanUndefined<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== "") {
      if (typeof value === "object" && !Array.isArray(value) && value !== null) {
        const cleaned = cleanUndefined(value);
        if (Object.keys(cleaned).length > 0) {
          result[key] = cleaned;
        }
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

export function createLocalBusinessSchema(settings?: UiSiteSettings | null) {
  const cities = settings?.cities?.length
    ? settings.cities
    : ["Naples", "Bonita Springs", "Estero", "Fort Myers", "Marco Island"];

  const areaServed = createCityAreaServed(cities);
  const ownerName = settings?.owner || "Eugenia Bucur Grecu";

  const schema = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${SITE_URL}/#business`,
    name: settings?.brand || "Coastal Care Home Services",
    url: SITE_URL,
    image: `${SITE_URL}/og-image.jpg`,
    telephone: settings?.phone || "(239) 571-4461",
    priceRange: "$$",
    founder: {
      "@type": "Person",
      "@id": `${SITE_URL}/#founder`,
      name: ownerName,
    },
    geo: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 26.1420,
        longitude: -81.7948,
      },
      geoRadius: "48000",
    },
    areaServed: areaServed,
    serviceType: [
      "Residential Cleaning",
      "Vacation Rental Turnover",
      "Home Management",
      "Home Watch",
    ],
  };

  return cleanUndefined(schema);
}

export function createWebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "Coastal Care Home Services",
    url: SITE_URL,
    description:
      "Residential cleaning, vacation rental turnovers, home management, and home watch across Southwest Florida.",
    publisher: {
      "@id": `${SITE_URL}/#business`,
    },
  };
  return cleanUndefined(schema);
}

export function createServiceSchema(
  services: UiService[],
  settings?: UiSiteSettings | null
) {
  const cities = settings?.cities?.length
    ? settings.cities
    : ["Naples", "Bonita Springs", "Estero", "Fort Myers", "Marco Island"];

  const areaServed = createCityAreaServed(cities);

  return services.map((s) => {
    const match = s.fromLabel ? s.fromLabel.match(/\$(\d+)/) : null;
    const priceNum = match ? parseInt(match[1], 10) : undefined;

    const schema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${SITE_URL}/services#${s.id}`,
      name: s.name,
      description: s.paragraphs.join(" ") || s.short,
      provider: {
        "@id": `${SITE_URL}/#business`,
      },
      areaServed: areaServed,
      ...(priceNum
        ? {
            offers: {
              "@type": "Offer",
              priceCurrency: "USD",
              price: priceNum,
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: priceNum,
                priceCurrency: "USD",
              },
            },
          }
        : {}),
    };
    return cleanUndefined(schema);
  });
}

export function createFaqSchema(faqs: UiFaqItem[]) {
  return cleanUndefined({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  });
}

export function createBreadcrumbSchema(pageName: string, path: string) {
  return cleanUndefined({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: pageName,
        item: `${SITE_URL}${path}`,
      },
    ],
  });
}
