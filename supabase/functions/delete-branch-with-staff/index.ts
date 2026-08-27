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
    const { branchId } = await req.json()

    if (!branchId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: branchId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Fail-safe: block if the branch still has employees or sales records.
    // Employees and sales are never auto-deleted (financial/history data loss risk).
    const { count: employeeCount, error: employeeError } = await supabaseAdmin
      .from('employees')
      .select('id', { count: 'exact', head: true })
      .eq('branch_id', branchId)
    if (employeeError) throw employeeError

    const { count: salesCount, error: salesError } = await supabaseAdmin
      .from('sales')
      .select('id', { count: 'exact', head: true })
      .eq('branch_id', branchId)
    if (salesError) throw salesError

    if ((employeeCount ?? 0) > 0 || (salesCount ?? 0) > 0) {
      return new Response(
        JSON.stringify({
          employeeCount: employeeCount ?? 0,
          salesCount: salesCount ?? 0,
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Find and delete the staff user profile(s) for this branch.
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('branch_id', branchId)
      .eq('role', 'staff')
    if (profileError) throw profileError

    // 3. Delete auth users (cascades to their profiles, but be explicit).
    for (const profile of profiles ?? []) {
      const { error: delUserError } = await supabaseAdmin.auth.admin.deleteUser(profile.id)
      if (delUserError) {
        // Ignore if user already gone; continue
        console.error('deleteUser error', delUserError)
      }
    }

    // 4. Delete any remaining profile rows that still reference the branch.
    const { error: delProfileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('branch_id', branchId)
    if (delProfileError) throw delProfileError

    // 5. Delete the branch.
    const { error: delBranchError } = await supabaseAdmin
      .from('branches')
      .delete()
      .eq('id', branchId)
    if (delBranchError) throw delBranchError

    return new Response(
      JSON.stringify({ success: true, deletedProfiles: (profiles ?? []).length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
