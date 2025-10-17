import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

console.log("🚀 Edge Function 'create-company-with-owner' is now running...");

serve(async (req) => {
  console.log("📩 Incoming request:", req.method, req.url);

  if (req.method === "OPTIONS") {
    console.log("🟡 Preflight OPTIONS request received");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    console.log("🔐 Authorization header present:", !!authHeader);

    if (!authHeader) {
      console.error("❌ Missing Authorization header");
      throw new Error("Missing Authorization header");
    }

    console.log("🧩 Initializing Supabase client with user token...");
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify requesting user
    const token = authHeader.replace(/^Bearer\s+/i, "");
    console.log("🧾 Extracted Bearer token:", token ? "✅ Present" : "❌ Missing");

    if (!token) {
      throw new Error("Unauthorized: Missing bearer token");
    }

    console.log("🔍 Verifying user from token...");
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token);

    console.log("👤 Auth check result:", { user: user?.id, authError });

    if (authError || !user) {
      throw new Error(`Unauthorized: ${authError?.message || "No user found"}`);
    }

    console.log("✅ User authenticated:", user.email);

    // Check user roles
    console.log("🔎 Checking if user is admin or superadmin...");
    const { data: userRoles, error: roleFetchError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (roleFetchError) {
      console.error("❌ Error fetching user roles:", roleFetchError);
      throw roleFetchError;
    }

    console.log("📜 User roles found:", userRoles);

    const isAdmin = userRoles?.some((r) => ["admin", "superadmin"].includes(r.role)) || false;

    if (!isAdmin) {
      console.warn("🚫 Access denied: Not an admin or superadmin");
      throw new Error("Only admins can create companies");
    }

    console.log("✅ Authorized admin detected. Proceeding to create company and owner...");

    const body = await req.json();
    console.log("📦 Request body received:", body);

    const { name, description, website, owner_name, owner_email, owner_password } = body;

    console.log("🏗 Creating Supabase Admin client...");
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    console.log("👤 Creating new owner account:", owner_email);
    const { data: newUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: owner_email,
      password: owner_password,
      email_confirm: true,
    });

    console.log("🧾 Owner creation result:", { newUser, signUpError });

    if (signUpError) throw signUpError;
    if (!newUser.user) throw new Error("Failed to create user account");

    console.log("🏢 Inserting new company record into 'companies' table...");
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

    console.log("🏢 Company insert result:", { companyData, companyError });

    if (companyError) throw companyError;

    console.log("🧾 Adding 'owner' role for new user...");
    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
      user_id: newUser.user.id,
      role: "owner",
    });

    if (roleError) throw roleError;
    console.log("✅ Owner role assigned successfully");

    console.log("👥 Adding new user to 'company_members'...");
    const { error: memberError } = await supabaseAdmin.from("company_members").insert({
      company_id: companyData.id,
      user_id: newUser.user.id,
      name: owner_name,
      role: "owner",
    });

    if (memberError) throw memberError;
    console.log("✅ Owner added to company_members successfully");

    console.log("🎉 Company and owner account successfully created!");

    return new Response(
      JSON.stringify({
        success: true,
        company: companyData,
        owner_id: newUser.user.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("🔥 Error in create-company-with-owner:", error);
    const message = error instanceof Error ? error.message : String(error);
    const statusCode = /Unauthorized|Missing Authorization/i.test(message) ? 401 : 400;

    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: statusCode,
    });
  }
});
