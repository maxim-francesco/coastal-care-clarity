import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/lib/supabase.admin.server";
import { z } from "zod";
import type { DBFaq, DBTestimonial, DBSiteSettings } from "@/lib/supabase.server";

// FAQ validation schema
export const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  sort_order: z.number().int("Sort order must be an integer"),
  is_active: z.boolean(),
});

export const updateFaqSchema = z.object({
  id: z.string().uuid("Invalid FAQ ID format"),
  input: faqSchema,
});

// Testimonial validation schema
export const testimonialSchema = z.object({
  text: z.string().min(1, "Text is required"),
  who: z.string().min(1, "Who is required"),
  sort_order: z.number().int("Sort order must be an integer"),
  is_active: z.boolean(),
});

export const updateTestimonialSchema = z.object({
  id: z.string().uuid("Invalid Testimonial ID format"),
  input: testimonialSchema,
});

// Settings validation schema
export const settingsSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  owner: z.string().min(1, "Owner is required"),
  phone: z.string().min(1, "Phone is required"),
  phone_href: z.string().min(1, "Phone link is required"),
  email: z.string().min(1, "Email is required"),
  hours: z.string().min(1, "Hours are required"),
  since: z.string().min(1, "Since is required"),
  cities: z.array(z.string().min(1, "City name cannot be empty")),
  area_note: z.string().min(1, "Area note is required"),
  about_bio: z.array(z.string().min(1, "Bio paragraph cannot be empty")),
});

// FAQs Admin CRUD Actions
export const listAllFaqsAdmin = createServerFn({ method: "GET" })
  .handler(async (): Promise<DBFaq[]> => {
    // TODO: harden — verify admin session server-side
    const { data, error } = await supabaseAdmin
      .from("faqs")
      .select("*")
      .order("sort_order");

    if (error) {
      console.error("Error fetching FAQs for admin:", error);
      throw new Error(`Failed to fetch FAQs: ${error.message}`);
    }

    return (data as DBFaq[]) || [];
  });

export const createFaq = createServerFn({ method: "POST" })
  .validator((data: unknown) => faqSchema.parse(data))
  .handler(async ({ data: input }): Promise<{ ok: true; data: DBFaq } | { ok: false; error: string }> => {
    // TODO: harden — verify admin session server-side
    try {
      const { data, error } = await (supabaseAdmin.from("faqs") as any)
        .insert(input)
        .select()
        .single();

      if (error) {
        console.error("Error creating FAQ:", error);
        return { ok: false, error: error.message };
      }

      return { ok: true, data: data as DBFaq };
    } catch (e: any) {
      console.error("Unexpected error in createFaq:", e);
      return { ok: false, error: e.message || "An unexpected error occurred." };
    }
  });

export const updateFaq = createServerFn({ method: "POST" })
  .validator((data: unknown) => updateFaqSchema.parse(data))
  .handler(async ({ data: { id, input } }): Promise<{ ok: true; data: DBFaq } | { ok: false; error: string }> => {
    // TODO: harden — verify admin session server-side
    try {
      const { data, error } = await (supabaseAdmin.from("faqs") as any)
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating FAQ:", error);
        return { ok: false, error: error.message };
      }

      return { ok: true, data: data as DBFaq };
    } catch (e: any) {
      console.error("Unexpected error in updateFaq:", e);
      return { ok: false, error: e.message || "An unexpected error occurred." };
    }
  });

export const deleteFaq = createServerFn({ method: "POST" })
  .validator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<{ ok: true } | { ok: false; error: string }> => {
    // TODO: harden — verify admin session server-side
    try {
      const { error } = await supabaseAdmin
        .from("faqs")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting FAQ:", error);
        return { ok: false, error: error.message };
      }

      return { ok: true };
    } catch (e: any) {
      console.error("Unexpected error in deleteFaq:", e);
      return { ok: false, error: e.message || "An unexpected error occurred." };
    }
  });

// Testimonials Admin CRUD Actions
export const listAllTestimonialsAdmin = createServerFn({ method: "GET" })
  .handler(async (): Promise<DBTestimonial[]> => {
    // TODO: harden — verify admin session server-side
    const { data, error } = await supabaseAdmin
      .from("testimonials")
      .select("*")
      .order("sort_order");

    if (error) {
      console.error("Error fetching testimonials for admin:", error);
      throw new Error(`Failed to fetch testimonials: ${error.message}`);
    }

    return (data as DBTestimonial[]) || [];
  });

export const createTestimonial = createServerFn({ method: "POST" })
  .validator((data: unknown) => testimonialSchema.parse(data))
  .handler(async ({ data: input }): Promise<{ ok: true; data: DBTestimonial } | { ok: false; error: string }> => {
    // TODO: harden — verify admin session server-side
    try {
      const { data, error } = await (supabaseAdmin.from("testimonials") as any)
        .insert(input)
        .select()
        .single();

      if (error) {
        console.error("Error creating testimonial:", error);
        return { ok: false, error: error.message };
      }

      return { ok: true, data: data as DBTestimonial };
    } catch (e: any) {
      console.error("Unexpected error in createTestimonial:", e);
      return { ok: false, error: e.message || "An unexpected error occurred." };
    }
  });

export const updateTestimonial = createServerFn({ method: "POST" })
  .validator((data: unknown) => updateTestimonialSchema.parse(data))
  .handler(async ({ data: { id, input } }): Promise<{ ok: true; data: DBTestimonial } | { ok: false; error: string }> => {
    // TODO: harden — verify admin session server-side
    try {
      const { data, error } = await (supabaseAdmin.from("testimonials") as any)
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating testimonial:", error);
        return { ok: false, error: error.message };
      }

      return { ok: true, data: data as DBTestimonial };
    } catch (e: any) {
      console.error("Unexpected error in updateTestimonial:", e);
      return { ok: false, error: e.message || "An unexpected error occurred." };
    }
  });

export const deleteTestimonial = createServerFn({ method: "POST" })
  .validator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }): Promise<{ ok: true } | { ok: false; error: string }> => {
    // TODO: harden — verify admin session server-side
    try {
      const { error } = await supabaseAdmin
        .from("testimonials")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting testimonial:", error);
        return { ok: false, error: error.message };
      }

      return { ok: true };
    } catch (e: any) {
      console.error("Unexpected error in deleteTestimonial:", e);
      return { ok: false, error: e.message || "An unexpected error occurred." };
    }
  });

// Settings Admin Actions
export const getSettingsAdmin = createServerFn({ method: "GET" })
  .handler(async (): Promise<DBSiteSettings> => {
    // TODO: harden — verify admin session server-side
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching settings for admin:", error);
      throw new Error(`Failed to fetch settings: ${error.message}`);
    }

    if (!data) {
      throw new Error("Site settings row (id=1) not found in DB.");
    }

    return data as DBSiteSettings;
  });

export const updateSettings = createServerFn({ method: "POST" })
  .validator((data: unknown) => settingsSchema.parse(data))
  .handler(async ({ data: input }): Promise<{ ok: true; data: DBSiteSettings } | { ok: false; error: string }> => {
    // TODO: harden — verify admin session server-side
    try {
      const { data, error } = await (supabaseAdmin.from("site_settings") as any)
        .update(input)
        .eq("id", 1)
        .select()
        .single();

      if (error) {
        console.error("Error updating site settings:", error);
        return { ok: false, error: error.message };
      }

      return { ok: true, data: data as DBSiteSettings };
    } catch (e: any) {
      console.error("Unexpected error in updateSettings:", e);
      return { ok: false, error: e.message || "An unexpected error occurred." };
    }
  });
