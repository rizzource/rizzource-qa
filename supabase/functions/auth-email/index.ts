import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    console.log('Received webhook payload:', body);
    
    const payload = JSON.parse(body);
    const { user, email_data } = payload;

    if (!user?.email) {
      throw new Error('No email found in user data');
    }

    const { token_hash, redirect_to, email_action_type } = email_data;

    const confirmationUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to || 'https://b37b99bc-b1af-4f06-a4f7-de4064b20147.sandbox.lovable.dev'}`;

    const { error } = await resend.emails.send({
      from: 'RIZZource <onboarding@resend.dev>',
      to: [user.email],
      subject: 'Confirm your email - RIZZource',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #3B82F6; text-align: center;">Welcome to RIZZource!</h1>
          
          <p>Thank you for signing up. Please confirm your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="background-color: #3B82F6; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Confirm Email Address
            </a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${confirmationUrl}</p>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log('Email sent successfully to:', user.email);

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in auth-email function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send email',
        details: error.toString() 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});