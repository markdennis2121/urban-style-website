
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple TOTP verification (in production, use a proper library)
function verifyTOTP(secret: string, token: string): boolean {
  // This is a simplified version - in production use a proper TOTP library
  const timeStep = Math.floor(Date.now() / 30000)
  
  // Check current time step and adjacent ones for clock drift
  for (let i = -1; i <= 1; i++) {
    const expectedToken = generateTOTP(secret, timeStep + i)
    if (expectedToken === token) {
      return true
    }
  }
  
  return false
}

function generateTOTP(secret: string, timeStep: number): string {
  // Simplified TOTP generation - use proper crypto library in production
  const hash = timeStep.toString() + secret
  const code = Math.abs(hash.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)) % 1000000
  
  return code.toString().padStart(6, '0')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, secret, token } = await req.json()
    
    if (!userId || !secret || !token) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const verified = verifyTOTP(secret, token)
    
    if (verified) {
      // Store the secret securely (encrypted) in the database
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const { error } = await supabase
        .from('user_security_settings')
        .upsert({
          user_id: userId,
          two_factor_enabled: true,
          two_factor_secret: secret, // In production, encrypt this
          updated_at: new Date().toISOString()
        })

      if (error) {
        throw error
      }
    }

    return new Response(
      JSON.stringify({ verified }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
