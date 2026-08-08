import { getRequest } from "@tanstack/react-start/server";
import { supabase } from "@/lib/supabase.server";

/**
 * Server-side helper to verify that the request contains a valid admin access token (JWT).
 * Extracts the token from the "Authorization" header (Bearer <token>).
 * Verifies the token against the Supabase auth API using the anonymous server client.
 * Throws an Error with message "Unauthorized" if verification fails.
 */
export async function requireAdmin(accessToken?: string) {
  try {
    let token = accessToken;

    if (!token) {
      const request = getRequest();
      const authHeader = request?.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token || token === "undefined") {
      throw new Error("Unauthorized");
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new Error("Unauthorized");
    }

    return user;
  } catch (err) {
    throw new Error("Unauthorized");
  }
}

