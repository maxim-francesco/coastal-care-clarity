import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/lib/supabase.admin.server";
import { z } from "zod";
import type { DBService } from "@/lib/supabase.server";

// Validation schema matching the services table columns
export const serviceSchema = z.object({
  id: z.string().min(1, "ID is required").regex(/^[a-z0-9-]+$/, "ID must be a non-empty slug (lowercase letters, numbers, and hyphens only)"),
  sort_order: z.number().int("Sort order must be an integer"),
  name: z.string().min(1, "Name is required"),
  short: z.string().min(1, "Short description is required"),
  from_label: z.string().min(1, "From label is required"),
  image_url: z.string().nullable().optional(),
  paragraphs: z.array(z.string()),
  includes: z.array(z.string()),
  good_for: z.string().min(1, "Good for is required"),
  price_from: z.string().min(1, "Starting price is required"),
  price_unit: z.string().min(1, "Price unit is required"),
  price_note: z.string().min(1, "Price note is required"),
  featured: z.boolean(),
  is_active: z.boolean(),
});

export const updateServiceSchema = z.object({
  id: z.string().min(1),
  input: serviceSchema.omit({ id: true }),
});

// Fetch all services (active + inactive) ordered by sort_order
export const listAllServicesAdmin = createServerFn({ method: "GET" })
  .handler(async (): Promise<DBService[]> => {
    // TODO: Harden: verify Supabase session/JWT server-side before mutating (later).
    const { data, error } = await supabaseAdmin
      .from("services")
      .select("*")
      .order("sort_order");

    if (error) {
      console.error("Error fetching all services for admin:", error);
      throw new Error(`Failed to fetch admin services: ${error.message}`);
    }

    return (data as DBService[]) || [];
  });

// Create a new service
export const createService = createServerFn({ method: "POST" })
  .validator((data: unknown) => serviceSchema.parse(data))
  .handler(async ({ data: input }): Promise<{ ok: true; data: DBService } | { ok: false; error: string }> => {
    // TODO: Harden: verify Supabase session/JWT server-side before mutating (later).
    try {
      // Check if ID (slug) already exists
      const { data: existing } = await supabaseAdmin
        .from("services")
        .select("id")
        .eq("id", input.id)
        .maybeSingle();

      if (existing) {
        return { ok: false, error: `Service with ID (slug) "${input.id}" already exists.` };
      }

      const { data, error } = await (supabaseAdmin.from("services") as any)
        .insert(input)
        .select()
        .single();

      if (error) {
        console.error("Error creating service:", error);
        return { ok: false, error: error.message };
      }

      return { ok: true, data: data as DBService };
    } catch (e: any) {
      console.error("Unexpected error in createService:", e);
      return { ok: false, error: e.message || "An unexpected error occurred." };
    }
  });

// Update an existing service
export const updateService = createServerFn({ method: "POST" })
  .validator((data: unknown) => updateServiceSchema.parse(data))
  .handler(async ({ data: { id, input } }): Promise<{ ok: true; data: DBService } | { ok: false; error: string }> => {
    // TODO: Harden: verify Supabase session/JWT server-side before mutating (later).
    try {
      const { data, error } = await (supabaseAdmin.from("services") as any)
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating service:", error);
        return { ok: false, error: error.message };
      }

      return { ok: true, data: data as DBService };
    } catch (e: any) {
      console.error("Unexpected error in updateService:", e);
      return { ok: false, error: e.message || "An unexpected error occurred." };
    }
  });

// Delete a service
export const deleteService = createServerFn({ method: "POST" })
  .validator((id: unknown) => z.string().parse(id))
  .handler(async ({ data: id }): Promise<{ ok: true } | { ok: false; error: string }> => {
    // TODO: Harden: verify Supabase session/JWT server-side before mutating (later).
    try {
      const { error } = await supabaseAdmin
        .from("services")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting service:", error);
        return { ok: false, error: error.message };
      }

      return { ok: true };
    } catch (e: any) {
      console.error("Unexpected error in deleteService:", e);
      return { ok: false, error: e.message || "An unexpected error occurred." };
    }
  });
