
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Generate random secret (32 characters)
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map(b => b.toString(36)).join('').slice(0, 32)

    // Create QR code URL for authenticator apps
    const serviceName = 'YourAppName'
    const qrCodeUrl = `otpauth://totp/${serviceName}:${userId}?secret=${secret}&issuer=${serviceName}`

    return new Response(
      JSON.stringify({ secret, qrCodeUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
