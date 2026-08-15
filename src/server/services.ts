import { createServerFn } from "@tanstack/react-start";
import { supabase, type DBService, type DBSiteSettings, type DBFaq, type DBTestimonial } from "@/lib/supabase.server";
import cleaningImg from "@/assets/cleaning.jpg";
import turnoverImg from "@/assets/turnover.jpg";
import managementImg from "@/assets/management.jpg";
import homewatchImg from "@/assets/homewatch.jpg";
import { site, areaNote as staticAreaNote, faqs as staticFaqs, quotes as staticQuotes, services as staticServices, type ServiceImageVariants } from "@/content/site";

export type ServiceId = "cleaning" | "turnover" | "management" | "home-watch";

export interface UiService {
  id: ServiceId;
  name: string;
  short: string;
  fromLabel: string;
  image: string;
  imageVariants?: ServiceImageVariants;
  paragraphs: string[];
  includes: string[];
  goodFor: string;
}

export interface UiPricingCard {
  id: ServiceId;
  name: string;
  from: string;
  unit: string;
  note: string;
  includes: string[];
  featured: boolean;
}

export interface ServicesAndPricingData {
  servicesForUi: UiService[];
  pricingCardsForUi: UiPricingCard[];
}

export interface UiSiteSettings {
  brand: string;
  owner: string;
  phone: string;
  phoneHref: string;
  email?: string;
  hours: string;
  since: string;
  cities: string[];
  areaNote: string;
  aboutBio: string[];
}

export interface UiFaqItem {
  id: string;
  q: string;
  a: string;
}

export interface UiTestimonialItem {
  id: string;
  text: string;
  who: string;
}

const assetMap: Record<ServiceId, string> = {
  cleaning: cleaningImg,
  turnover: turnoverImg,
  management: managementImg,
  "home-watch": homewatchImg,
};

export const resolveServiceImage = (id: string, imageUrl: string | null): string => {
  if (imageUrl && imageUrl.trim()) {
    return imageUrl;
  }
  return assetMap[id as ServiceId] || "";
};

export const getServicesAndPricing = createServerFn({ method: "GET" })
  .handler(async (): Promise<ServicesAndPricingData> => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (error) {
      console.error("Error fetching services from Supabase:", error);
      throw new Error(`Failed to fetch services: ${error.message}`);
    }

    const rows = data as unknown as DBService[] | null;

    if (!rows) {
      return { servicesForUi: [], pricingCardsForUi: [] };
    }

    const staticVariantMap = new Map(staticServices.map((s) => [s.id, s.imageVariants]));

    const servicesForUi: UiService[] = rows.map((row) => {
      const id = row.id as ServiceId;
      return {
        id,
        name: row.name,
        short: row.short,
        fromLabel: row.from_label,
        image: resolveServiceImage(id, row.image_url),
        imageVariants: staticVariantMap.get(id),
        paragraphs: row.paragraphs || [],
        includes: row.includes || [],
        goodFor: row.good_for,
      };
    });

    const pricingCardsForUi: UiPricingCard[] = rows.map((row) => {
      const id = row.id as ServiceId;
      return {
        id,
        name: row.name,
        from: row.price_from,
        unit: row.price_unit,
        note: row.price_note,
        includes: row.includes || [],
        featured: row.featured,
      };
    });

    return {
      servicesForUi,
      pricingCardsForUi,
    };
  });

export const getSiteSettings = createServerFn({ method: "GET" })
  .handler(async (): Promise<UiSiteSettings> => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching site_settings from Supabase:", error);
        return getStaticSiteSettingsFallback();
      }

      if (!data) {
        return getStaticSiteSettingsFallback();
      }

      const row = data as DBSiteSettings;
      return {
        brand: row.brand,
        owner: row.owner === "Maria Reyes" ? "Eugenia Bucur Grecu" : row.owner,
        phone: row.phone,
        phoneHref: row.phone_href,
        email: undefined,
        hours: row.hours,
        since: row.since,
        cities: row.cities || [],
        areaNote: row.area_note,
        aboutBio: row.about_bio || [],
      };
    } catch (err) {
      console.error("Unexpected error fetching site_settings:", err);
      return getStaticSiteSettingsFallback();
    }
  });

function getStaticSiteSettingsFallback(): UiSiteSettings {
  return {
    brand: site.brand,
    owner: site.owner,
    phone: site.phone,
    phoneHref: site.phoneHref,
    hours: site.hours,
    since: site.since,
    cities: [...site.cities],
    areaNote: staticAreaNote,
    aboutBio: [
      "I started Coastal Care in 2019 after years of taking care of other people's homes for a big company that didn't take care of them. I wanted to work differently — one person, small number of clients, personal attention, no rotating crews.",
      "What I care about is simple. Your home should feel calm when you walk in the door, and looked after when you're not there. If I see something small becoming something big, I tell you the same day.",
      "I work with a small number of families across Naples, Bonita Springs, Estero, Fort Myers, and Marco Island. If we're a good fit, I'd love to help."
    ],
  };
}

export const getFaqs = createServerFn({ method: "GET" })
  .handler(async (): Promise<UiFaqItem[]> => {
    try {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) {
        console.error("Error fetching faqs from Supabase:", error);
        return getStaticFaqsFallback();
      }

      if (!data) {
        return getStaticFaqsFallback();
      }

      const rows = data as DBFaq[];
      return rows.map((row) => ({
        id: row.id,
        q: row.question,
        a: row.answer,
      }));
    } catch (err) {
      console.error("Unexpected error fetching faqs:", err);
      return getStaticFaqsFallback();
    }
  });

function getStaticFaqsFallback(): UiFaqItem[] {
  return staticFaqs.map((f, i) => ({
    id: `static-${i}`,
    q: f.q,
    a: f.a,
  }));
}

export const getTestimonials = createServerFn({ method: "GET" })
  .handler(async (): Promise<UiTestimonialItem[]> => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) {
        console.error("Error fetching testimonials from Supabase:", error);
        return getStaticTestimonialsFallback();
      }

      if (!data) {
        return getStaticTestimonialsFallback();
      }

      const rows = data as DBTestimonial[];
      return rows.map((row) => ({
        id: row.id,
        text: row.text.replace(/\bMaria\b/g, "Eugenia"),
        who: row.who,
      }));
    } catch (err) {
      console.error("Unexpected error fetching testimonials:", err);
      return getStaticTestimonialsFallback();
    }
  });

function getStaticTestimonialsFallback(): UiTestimonialItem[] {
  return staticQuotes.map((q, i) => ({
    id: `static-${i}`,
    text: q.text,
    who: q.who,
  }));
}
