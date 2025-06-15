
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  // Handle CORS preflight requests FIRST and return 200 status
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    console.log("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY is not configured");
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    console.log("Stripe key found");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      throw new Error("No authorization header provided");
    }
    console.log("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user?.email) {
      console.error("Authentication failed:", authError);
      throw new Error("User not authenticated");
    }
    console.log("User authenticated:", user.email);

    const requestBody = await req.json();
    console.log("Request body received:", requestBody);
    
    const { items, total, orderId } = requestBody;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("No items in request");
      throw new Error("No items in cart");
    }
    console.log("Items validated:", items.length, "items");

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    console.log("Checking for existing customer...");
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Found existing customer:", customerId);
    } else {
      console.log("No existing customer found");
    }

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "php",
        product_data: {
          name: item.name,
          description: `Brand: ${item.brand || 'N/A'}${item.size ? ` | Size: ${item.size}` : ''}${item.color ? ` | Color: ${item.color}` : ''}`,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    console.log("Line items prepared:", lineItems.length);

    const origin = req.headers.get("origin") || "https://urbanweb.netlify.app";
    console.log("Origin:", origin);

    console.log("Creating Stripe checkout session...");
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        order_id: orderId || '',
      },
    });

    console.log("Checkout session created successfully:", session.id);

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error creating checkout session:", error);
    
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
