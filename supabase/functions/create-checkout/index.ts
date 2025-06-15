
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
  // Handle CORS preflight requests FIRST
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    console.log("=== CREATE CHECKOUT FUNCTION STARTED ===");
    console.log("Request method:", req.method);
    console.log("Request URL:", req.url);

    // Check environment variables first
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    console.log("Environment check:");
    console.log("- STRIPE_SECRET_KEY:", stripeKey ? "✓ Present" : "✗ Missing");
    console.log("- SUPABASE_URL:", supabaseUrl ? "✓ Present" : "✗ Missing");
    console.log("- SUPABASE_ANON_KEY:", supabaseAnonKey ? "✓ Present" : "✗ Missing");

    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY is not configured");
      return new Response(JSON.stringify({ 
        error: "STRIPE_SECRET_KEY is not configured in Supabase secrets" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase environment variables missing");
      return new Response(JSON.stringify({ 
        error: "Supabase configuration missing" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const authHeader = req.headers.get("Authorization");
    console.log("Authorization header:", authHeader ? "✓ Present" : "✗ Missing");

    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ 
        error: "No authorization header provided" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("Token extracted, length:", token.length);
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log("Attempting to authenticate user...");
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError) {
      console.error("Authentication failed:", authError.message);
      return new Response(JSON.stringify({ 
        error: `Authentication failed: ${authError.message}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    if (!user?.email) {
      console.error("User not authenticated or email missing");
      return new Response(JSON.stringify({ 
        error: "User not authenticated or email not available" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    console.log("User authenticated successfully:", user.email);

    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body parsed successfully");
      console.log("Items count:", requestBody.items?.length || 0);
      console.log("Total:", requestBody.total);
      console.log("Order ID:", requestBody.orderId);
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(JSON.stringify({ 
        error: "Invalid JSON in request body" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    const { items, total, orderId } = requestBody;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("No items in request or invalid items array");
      return new Response(JSON.stringify({ 
        error: "No items in cart or invalid items format" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log("Initializing Stripe with key prefix:", stripeKey.substring(0, 12) + "...");
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    console.log("Checking for existing Stripe customer...");
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Found existing customer:", customerId);
    } else {
      console.log("No existing customer found, will create new one during checkout");
    }

    console.log("Preparing line items...");
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

    console.log("Line items prepared, count:", lineItems.length);

    const origin = req.headers.get("origin") || "https://urbanweb.netlify.app";
    console.log("Origin for redirect URLs:", origin);

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

    console.log("Checkout session created successfully!");
    console.log("Session ID:", session.id);
    console.log("Session URL:", session.url);

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    const errorStack = error instanceof Error ? error.stack : "No stack trace";
    
    console.error("=== ERROR IN CREATE-CHECKOUT ===");
    console.error("Error message:", errorMessage);
    console.error("Error stack:", errorStack);
    console.error("Error type:", typeof error);
    console.error("Error constructor:", error?.constructor?.name);
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "Check edge function logs for more information"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
