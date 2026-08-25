import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, address, phone, isActive, branchEmail, branchPassword } = await req.json()

    // Validate input
    if (!name || !branchEmail || !branchPassword) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, branchEmail, branchPassword' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase admin client with service_role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Create the branch
    const { data: branch, error: branchError } = await supabaseAdmin
      .from('branches')
      .insert({
        name,
        address: address ?? null,
        phone: phone ?? null,
        is_active: isActive ?? true,
      })
      .select()
      .single()

    if (branchError) {
      return new Response(
        JSON.stringify({ error: branchError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Create the auth user using admin API (no rate limit)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: branchEmail,
      password: branchPassword,
      email_confirm: true,
      user_metadata: { name },
    })

    if (authError) {
      // Rollback branch
      await supabaseAdmin.from('branches').delete().eq('id', branch.id)
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Update the profile with staff role and branch_id
    // Using service_role key which bypasses RLS
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        role: 'staff',
        branch_id: branch.id,
        name,
      })
      .eq('id', authData.user.id)

    if (profileError) {
      // Cleanup
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      await supabaseAdmin.from('branches').delete().eq('id', branch.id)
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        branch,
        credentials: { email: branchEmail, password: branchPassword },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})