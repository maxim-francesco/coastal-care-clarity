import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/lib/supabase.server";
import { supabaseAdmin } from "@/lib/supabase.admin.server";
import { z } from "zod";

export interface DBLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string | null;
  service: string | null;
  property_size: string | null;
  message: string;
  method: string | null;
  status: "new" | "read" | "archived";
  created_at: string;
}

export const submitLeadSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name must be under 200 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  message: z.string().min(1, "Message is required"),
  city: z.string().nullable().optional(),
  service: z.string().nullable().optional(),
  property_size: z.string().nullable().optional(),
  method: z.string().nullable().optional(),
});

// submitLead(input): PUBLIC write. Validate with zod.
export const submitLead = createServerFn({ method: "POST" })
  .validator((data: unknown) => submitLeadSchema.parse(data))
  .handler(async ({ data: input }): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      const { error } = await (supabase.from("leads") as any).insert({
        name: input.name,
        email: input.email,
        phone: input.phone,
        message: input.message,
        city: input.city || null,
        service: input.service || null,
        property_size: input.property_size || null,
        method: input.method || null,
        status: "new",
      });

      if (error) {
        console.error("Error submitting lead:", error);
        return { ok: false, error: error.message };
      }

      return { ok: true };
    } catch (e: any) {
      console.error("Unexpected error in submitLead server function:", e);
      return { ok: false, error: e.message || "An unexpected error occurred." };
    }
  });

// listLeads(statusFilter?): ADMIN read. Uses admin client (service_role).
export const listLeads = createServerFn({ method: "GET" })
  .validator((statusFilter: unknown) => z.string().nullable().optional().parse(statusFilter))
  .handler(async ({ data: statusFilter }): Promise<DBLead[]> => {
    // TODO: harden — verify admin session server-side before privileged reads/writes (later).
    try {
      let query = (supabaseAdmin.from("leads") as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error listing leads:", error);
        throw new Error(`Failed to list leads: ${error.message}`);
      }

      return (data as DBLead[]) || [];
    } catch (e: any) {
      console.error("Unexpected error in listLeads server function:", e);
      throw e;
    }
  });

// updateLeadStatus(id, status): ADMIN. Uses admin client.
export const updateLeadStatus = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({
      id: z.string().uuid("Invalid lead ID"),
      status: z.enum(["new", "read", "archived"]),
    }).parse(data)
  )
  .handler(async ({ data: { id, status } }): Promise<{ ok: true } | { ok: false; error: string }> => {
    // TODO: harden — verify admin session server-side before privileged reads/writes (later).
    try {
      const { error } = await (supabaseAdmin.from("leads") as any)
        .update({ status })
        .eq("id", id);

      if (error) {
        console.error("Error updating lead status:", error);
        return { ok: false, error: error.message };
      }

      return { ok: true };
    } catch (e: any) {
      console.error("Unexpected error in updateLeadStatus server function:", e);
      return { ok: false, error: e.message || "An unexpected error occurred." };
    }
  });

// deleteLead(id): ADMIN. Uses admin client.
export const deleteLead = createServerFn({ method: "POST" })
  .validator((id: unknown) => z.string().uuid("Invalid lead ID").parse(id))
  .handler(async ({ data: id }): Promise<{ ok: true } | { ok: false; error: string }> => {
    // TODO: harden — verify admin session server-side before privileged reads/writes (later).
    try {
      const { error } = await (supabaseAdmin.from("leads") as any)
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting lead:", error);
        return { ok: false, error: error.message };
      }

      return { ok: true };
    } catch (e: any) {
      console.error("Unexpected error in deleteLead server function:", e);
      return { ok: false, error: e.message || "An unexpected error occurred." };
    }
  });
