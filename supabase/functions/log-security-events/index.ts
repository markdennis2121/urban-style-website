
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
    const { events } = await req.json()
    
    if (!events || !Array.isArray(events)) {
      return new Response(
        JSON.stringify({ error: 'Events array required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Insert security events into the database
    const { error } = await supabase
      .from('security_events')
      .insert(events.map(event => ({
        ...event,
        created_at: new Date().toISOString()
      })))

    if (error) {
      throw error
    }

    // Analyze events for patterns and alerts
    await analyzeSecurityPatterns(supabase, events)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function analyzeSecurityPatterns(supabase: any, events: any[]) {
  // Analyze for suspicious patterns
  const suspiciousEvents = events.filter(event => 
    event.severity === 'high' || event.severity === 'critical'
  )

  if (suspiciousEvents.length > 0) {
    // Log high-priority events for immediate attention
    console.warn('High-priority security events detected:', suspiciousEvents.length)
    
    // In production, trigger alerts here (email, Slack, etc.)
  }
}
