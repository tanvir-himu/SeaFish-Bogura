
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing server environment configuration");
      return jsonResponse({ error: "Server configuration error" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = await req.json();
    const mode = body?.mode;

    let query = supabase
  .from("orders")
  .select(`
    id,
    status,
    created_at,
    total,
    items,
    delivery_charge,
    discount_amount,
    payment_method,
    advance_payment_method,
    transaction_id,
    advance_amount,
    payment_status
  `);

    if (mode === "token") {
      const token = String(body?.token ?? "").trim();

      if (!/^[a-f0-9]{64}$/i.test(token)) {
        return jsonResponse({ error: "Invalid tracking link" }, 400);
      }

      const tokenHash = await sha256(token);

      query = query.eq("tracking_token_hash", tokenHash);
    } else if (mode === "id_phone") {
      const orderId = String(body?.order_id ?? "").trim();
      const phone = normalizePhone(String(body?.phone ?? ""));

      if (!orderId || phone.length < 8 || phone.length > 15) {
        return jsonResponse({ error: "Enter a valid order ID and phone number" }, 400);
      }

      const { data, error } = await query.eq("id", orderId).maybeSingle();

      if (error) {
        console.error("Order lookup failed", error.message);
        return jsonResponse({ error: "Unable to look up order" }, 500);
      }

      if (!data) {
        return jsonResponse({ error: "Order not found. Check your details." }, 404);
      }

      // Fetch phone separately on the server; never return it to the customer.
      const { data: privateOrder, error: privateError } = await supabase
        .from("orders")
        .select("phone")
        .eq("id", orderId)
        .maybeSingle();

      if (privateError) {
        console.error("Phone verification failed", privateError.message);
        return jsonResponse({ error: "Unable to verify order" }, 500);
      }

      if (
        !privateOrder?.phone ||
        normalizePhone(privateOrder.phone) !== phone
      ) {
        return jsonResponse({ error: "Order not found. Check your details." }, 404);
      }

      return jsonResponse({ order: data });
    } else {
      return jsonResponse({ error: "Invalid tracking mode" }, 400);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("Tracking lookup failed", error.message);
      return jsonResponse({ error: "Unable to look up order" }, 500);
    }

    if (!data) {
      return jsonResponse({ error: "Order not found" }, 404);
    }

    return jsonResponse({ order: data });
  } catch (error) {
    console.error(
      "Unexpected tracking error",
      error instanceof Error ? error.message : "Unknown error",
    );
    return jsonResponse({ error: "Invalid request" }, 400);
  }
});
