import { createClient } from "@supabase/supabase-js";

if (typeof window !== "undefined") {
  throw new Error("supabase.server.ts should only be imported on the server.");
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check SUPABASE_URL and SUPABASE_ANON_KEY in .env.local."
  );
}

export interface DBService {
  id: string;
  sort_order: number;
  name: string;
  short: string;
  from_label: string;
  image_url: string | null;
  paragraphs: string[];
  includes: string[];
  good_for: string;
  price_from: string;
  price_unit: string;
  price_note: string;
  featured: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DBFaq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DBTestimonial {
  id: string;
  text: string;
  who: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DBSiteSettings {
  id: number;
  brand: string;
  owner: string;
  phone: string;
  phone_href: string;
  email: string;
  hours: string;
  since: string;
  cities: string[];
  area_note: string;
  about_bio: string[];
  updated_at?: string;
}

export interface Database {
  public: {
    Tables: {
      services: {
        Row: DBService;
        Insert: Omit<DBService, "created_at" | "updated_at">;
        Update: Partial<Omit<DBService, "created_at" | "updated_at">>;
        Relationships: [];
      };
      faqs: {
        Row: DBFaq;
        Insert: Omit<DBFaq, "created_at" | "updated_at">;
        Update: Partial<Omit<DBFaq, "created_at" | "updated_at">>;
        Relationships: [];
      };
      testimonials: {
        Row: DBTestimonial;
        Insert: Omit<DBTestimonial, "created_at" | "updated_at">;
        Update: Partial<Omit<DBTestimonial, "created_at" | "updated_at">>;
        Relationships: [];
      };
      site_settings: {
        Row: DBSiteSettings;
        Insert: Omit<DBSiteSettings, "updated_at">;
        Update: Partial<Omit<DBSiteSettings, "updated_at">>;
        Relationships: [];
      };
      lead_submits: {
        Row: {
          id: string;
          ip_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          ip_hash: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          ip_hash?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
