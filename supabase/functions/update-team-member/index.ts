import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase configuration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = authData.user.id;

    const { company_id, member_id, name, role, old_role } = await req.json();

    if (!company_id || !member_id || !name || !role) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const allowedRoles = ["hr", "admin", "employee"];
    if (!allowedRoles.includes(role)) {
      return new Response(JSON.stringify({ error: "Invalid role" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is company owner (match add-team-member's security)
    const { data: ownerRow, error: ownerErr } = await supabaseAdmin
      .from("company_members")
      .select("id")
      .eq("company_id", company_id)
      .eq("user_id", callerId)
      .eq("role", "owner")
      .maybeSingle();

    if (ownerErr || !ownerRow) {
      return new Response(JSON.stringify({ error: "Only company owners can update team members" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the target member to retrieve user_id
    const { data: memberRow, error: memberFetchErr } = await supabaseAdmin
      .from("company_members")
      .select("id, user_id, role")
      .eq("id", member_id)
      .eq("company_id", company_id)
      .maybeSingle();

    if (memberFetchErr || !memberRow) {
      return new Response(JSON.stringify({ error: "Team member not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update member
    const { error: updateErr } = await supabaseAdmin
      .from("company_members")
      .update({ name, role })
      .eq("id", member_id)
      .eq("company_id", company_id);

    if (updateErr) {
      return new Response(JSON.stringify({ error: updateErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If role changed, add role in user_roles (ignore duplicates)
    if (old_role && old_role !== role) {
      const { error: insertRoleErr } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: memberRow.user_id, role });

      if (insertRoleErr && !/duplicate|unique/i.test(insertRoleErr.message)) {
        // Don't fail the whole request for this, but return info
        console.warn("update-team-member: user_roles insert warning:", insertRoleErr.message);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("update-team-member error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});