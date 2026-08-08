import { createClient } from "@supabase/supabase-js";

const isBrowser = typeof window !== "undefined";
const supabaseUrl = isBrowser ? import.meta.env.VITE_SUPABASE_URL : "";
const supabaseAnonKey = isBrowser ? import.meta.env.VITE_SUPABASE_ANON_KEY : "";

if (isBrowser && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error(
    "Missing client-side Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local."
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

export interface Database {
  public: {
    Tables: {
      services: {
        Row: DBService;
        Insert: Omit<DBService, "created_at" | "updated_at">;
        Update: Partial<Omit<DBService, "created_at" | "updated_at">>;
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

export const supabase = isBrowser
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : (null as any);
