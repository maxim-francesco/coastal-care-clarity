import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { supabase } from "@/lib/supabase.server";
import { supabaseAdmin } from "@/lib/supabase.admin.server";
import { z } from "zod";
import { requireAdmin } from "./authGuard";
import { createHash } from "crypto";

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
  name: z.string().min(1, "Name is required").max(120, "Name must be 120 characters or less"),
  email: z.string().min(1, "Email is required").max(200, "Email must be 200 characters or less").email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required").max(40, "Phone number must be 40 characters or less"),
  message: z.string().min(1, "Message is required").max(2000, "Message must be 2000 characters or less"),
  city: z.string().max(100).nullable().optional(),
  service: z.string().max(100).nullable().optional(),
  property_size: z.string().max(50).nullable().optional(),
  method: z.string().max(20).nullable().optional(),
  website: z.string().nullable().optional(), // Honeypot field
});

// submitLead(input): PUBLIC write. Validate with zod.
export const submitLead = createServerFn({ method: "POST" })
  .validator((data: unknown) => submitLeadSchema.parse(data))
  .handler(async ({ data: input }): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      // 1. Honeypot check
      if (input.website && input.website.trim() !== "") {
        console.log("Honeypot filled by bot:", input.website);
        return { ok: true }; // Fake success
      }

      // 2. Reject messages containing more than 2 URLs
      const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
      const urlMatches = input.message.match(urlRegex) || [];
      if (urlMatches.length > 2) {
        return { ok: false, error: "Your message looks a bit spammy — please reduce the number of links and try again." };
      }

      // 3. Rate limiting check (using lead_submits table + service_role)
      const request = getRequest();
      const rawIp = request.headers.get("x-forwarded-for") || "";
      const ip = rawIp.split(",")[0].trim() || "127.0.0.1";
      const ipHash = createHash("sha256")
        .update(`coastal-care-salt-2026-${ip}`)
        .digest("hex");

      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { count, error: countError } = await (supabaseAdmin.from("lead_submits") as any)
        .select("*", { count: "exact", head: true })
        .eq("ip_hash", ipHash)
        .gte("created_at", tenMinutesAgo);

      if (countError) {
        console.error("Error checking rate limit:", countError);
      } else if (count !== null && count >= 3) {
        return { ok: false, error: "You've sent a few messages already — please call us or try again later." };
      }

      // 4. Save the lead to DB
      const { error: insertError } = await (supabase.from("leads") as any).insert({
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

      if (insertError) {
        console.error("Error submitting lead:", insertError);
        return { ok: false, error: insertError.message };
      }

      // 5. Insert rate-limit log entry
      const { error: limitError } = await (supabaseAdmin.from("lead_submits") as any)
        .insert({ ip_hash: ipHash });

      if (limitError) {
        console.error("Error logging rate limit submit:", limitError);
      }

      // 6. Best-effort async cleanup of old lead_submits (> 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      (supabaseAdmin.from("lead_submits") as any)
        .delete()
        .lt("created_at", oneDayAgo)
        .then(({ error }: any) => {
          if (error) console.error("Error cleaning up lead_submits:", error);
        });

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

export const updateLeadStatusSchema = z.object({
  id: z.string().uuid("Invalid lead ID"),
  status: z.enum(["new", "read", "archived"]),
  accessToken: z.string().optional(),
});

export const deleteLeadSchema = z.object({
  id: z.string().uuid("Invalid lead ID"),
  accessToken: z.string().optional(),
});

// updateLeadStatus(id, status): ADMIN. Uses admin client.
export const updateLeadStatus = createServerFn({ method: "POST" })
  .validator((data: unknown) => updateLeadStatusSchema.parse(data))
  .handler(async ({ data: { id, status, accessToken } }): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      await requireAdmin(accessToken);
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
  .validator((data: unknown) => deleteLeadSchema.parse(data))
  .handler(async ({ data: { id, accessToken } }): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      await requireAdmin(accessToken);
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

