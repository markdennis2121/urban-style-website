
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
  console.log("🚀 CREATE CHECKOUT FUNCTION STARTED");
  console.log("Method:", req.method);
  console.log("URL:", req.url);

  // Handle CORS preflight requests FIRST
  if (req.method === "OPTIONS") {
    console.log("✅ Handling CORS preflight request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    // Check ALL environment variables
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    console.log("🔍 Environment Variables Check:");
    console.log("STRIPE_SECRET_KEY exists:", !!stripeKey);
    console.log("STRIPE_SECRET_KEY prefix:", stripeKey ? stripeKey.substring(0, 8) + "..." : "MISSING");
    console.log("SUPABASE_URL exists:", !!supabaseUrl);
    console.log("SUPABASE_ANON_KEY exists:", !!supabaseAnonKey);

    if (!stripeKey) {
      console.error("❌ STRIPE_SECRET_KEY is missing!");
      return new Response(JSON.stringify({ 
        error: "STRIPE_SECRET_KEY is not configured in Supabase secrets",
        debug: "Check your Supabase project settings > Edge Functions > Secrets"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("❌ Supabase environment variables missing");
      return new Response(JSON.stringify({ 
        error: "Supabase configuration missing" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Check authorization
    const authHeader = req.headers.get("Authorization");
    console.log("🔐 Auth header exists:", !!authHeader);

    if (!authHeader) {
      console.error("❌ No authorization header");
      return new Response(JSON.stringify({ 
        error: "No authorization header provided" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("🎫 Token length:", token.length);
    
    // Test Supabase client creation
    console.log("🏗️ Creating Supabase client...");
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log("👤 Getting user...");
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError) {
      console.error("❌ Auth error:", authError.message);
      return new Response(JSON.stringify({ 
        error: `Authentication failed: ${authError.message}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    if (!user?.email) {
      console.error("❌ No user or email");
      return new Response(JSON.stringify({ 
        error: "User not authenticated or email not available" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    console.log("✅ User authenticated:", user.email);

    // Parse request body with better error handling
    let requestBody;
    try {
      console.log("📦 Reading request body...");
      const bodyText = await req.text();
      console.log("📝 Raw body text:", bodyText);
      console.log("📏 Body length:", bodyText.length);
      
      if (!bodyText || bodyText.trim() === '') {
        console.error("❌ Empty request body");
        return new Response(JSON.stringify({ 
          error: "Request body is empty" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      console.log("🔍 Parsing JSON...");
      requestBody = JSON.parse(bodyText);
      console.log("✅ Request body parsed successfully");
      console.log("📊 Parsed data:", JSON.stringify(requestBody, null, 2));
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      console.error("❌ Parse error details:", parseError.message);
      return new Response(JSON.stringify({ 
        error: "Invalid JSON in request body",
        details: parseError.message 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    const { items, total, orderId } = requestBody;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("❌ No items or invalid items");
      return new Response(JSON.stringify({ 
        error: "No items in cart or invalid items format" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Test Stripe initialization
    console.log("💳 Initializing Stripe...");
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });
    console.log("✅ Stripe initialized");

    // Check for existing customer
    console.log("🔍 Looking for existing customer...");
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("✅ Found existing customer:", customerId);
    } else {
      console.log("ℹ️ No existing customer found");
    }

    // Prepare line items
    console.log("📋 Preparing line items...");
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
    console.log("✅ Line items prepared:", lineItems.length);

    const origin = req.headers.get("origin") || "https://urbanweb.netlify.app";
    console.log("🌐 Origin:", origin);

    // Create checkout session
    console.log("🛒 Creating Stripe checkout session...");
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

    console.log("🎉 SUCCESS! Checkout session created");
    console.log("Session ID:", session.id);
    console.log("Session URL exists:", !!session.url);

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("💥 FATAL ERROR:", error);
    console.error("Error name:", error?.name);
    console.error("Error message:", error?.message);
    console.error("Error stack:", error?.stack);
    
    return new Response(JSON.stringify({ 
      error: error?.message || "Unknown error occurred",
      errorName: error?.name || "UnknownError",
      details: "Check edge function logs for complete error information"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
