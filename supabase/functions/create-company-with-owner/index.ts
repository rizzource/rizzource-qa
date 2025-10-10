import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    console.log("Authorization header present:", !!authHeader);
    
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify the requesting user is an admin
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    console.log("Auth check - User:", user?.id, "Error:", authError);

    if (authError || !user) {
      throw new Error(`Unauthorized: ${authError?.message || "No user found"}`);
    }

    // Check if user is admin or superadmin
    const { data: userRoles } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdmin =
      userRoles?.some((r) => ["admin", "superadmin"].includes(r.role)) || false;

    if (!isAdmin) {
      throw new Error("Only admins can create companies");
    }

    const { name, description, website, owner_name, owner_email, owner_password } =
      await req.json();

    // Use service role to create the owner account
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create the owner's user account
    const { data: newUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: owner_email,
      password: owner_password,
      email_confirm: true,
    });

    if (signUpError) throw signUpError;
    if (!newUser.user) throw new Error("Failed to create user account");

    // Create the company
    const { data: companyData, error: companyError } = await supabaseAdmin
      .from("companies")
      .insert({
        name,
        description: description || null,
        website: website || null,
        owner_name,
        owner_email,
      })
      .select()
      .single();

    if (companyError) throw companyError;

    // Add owner role to user_roles
    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
      user_id: newUser.user.id,
      role: "owner",
    });

    if (roleError) throw roleError;

    // Add the owner to company_members
    const { error: memberError } = await supabaseAdmin.from("company_members").insert({
      company_id: companyData.id,
      user_id: newUser.user.id,
      name: owner_name,
      role: "owner",
    });

    if (memberError) throw memberError;

    return new Response(
      JSON.stringify({
        success: true,
        company: companyData,
        owner_id: newUser.user.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-company-with-owner:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
