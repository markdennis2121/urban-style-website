
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Check for Stripe secret key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not found");
      throw new Error("STRIPE_SECRET_KEY is not configured. Please add it to your Supabase secrets.");
    }
    logStep("Stripe key found and verified");

    // Create Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header provided");
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user?.email) {
      logStep("ERROR: Authentication failed", { authError: authError?.message });
      throw new Error("User not authenticated");
    }

    logStep("User authenticated successfully", { userId: user.id, email: user.email });

    // Get the cart items from the request body
    const requestBody = await req.json();
    const { items, total } = requestBody;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      logStep("ERROR: No items in cart");
      throw new Error("No items in cart");
    }

    logStep("Cart items received", { itemCount: items.length, total });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Check if a Stripe customer record exists for this user
    logStep("Looking for existing Stripe customer");
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer found, will create new one");
    }

    // Convert cart items to Stripe line items
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "php",
        product_data: {
          name: item.name,
          description: `Brand: ${item.brand || 'N/A'}${item.size ? ` | Size: ${item.size}` : ''}${item.color ? ` | Color: ${item.color}` : ''}`,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to centavos
      },
      quantity: item.quantity,
    }));

    logStep("Line items prepared", { lineItemCount: lineItems.length });

    // Get the origin for redirect URLs
    const origin = req.headers.get("origin") || "http://localhost:3000";
    logStep("Using origin for redirects", { origin });

    // Create checkout session
    logStep("Creating Stripe checkout session");
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
      },
      payment_intent_data: {
        metadata: {
          user_id: user.id,
          user_email: user.email,
        },
      },
    });

    logStep("Checkout session created successfully", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    logStep("ERROR in create-checkout", { error: errorMessage });
    console.error("Error creating checkout session:", error);
    
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
