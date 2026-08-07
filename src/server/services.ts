import { createServerFn } from "@tanstack/react-start";
import { supabase, type DBService } from "@/lib/supabase.server";
import cleaningImg from "@/assets/cleaning.jpg";
import turnoverImg from "@/assets/turnover.jpg";
import managementImg from "@/assets/management.jpg";
import homewatchImg from "@/assets/homewatch.jpg";

export type ServiceId = "cleaning" | "turnover" | "management" | "home-watch";

export interface UiService {
  id: ServiceId;
  name: string;
  short: string;
  fromLabel: string;
  image: string;
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

    const servicesForUi: UiService[] = rows.map((row) => {
      const id = row.id as ServiceId;
      return {
        id,
        name: row.name,
        short: row.short,
        fromLabel: row.from_label,
        image: resolveServiceImage(id, row.image_url),
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
