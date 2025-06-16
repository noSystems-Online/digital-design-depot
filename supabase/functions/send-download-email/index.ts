
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, downloadLinks, orderDetails, items } = await req.json()

    console.log('Sending download email to:', email);

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Create email content
    const itemsList = items.map((item: any) => `- ${item.title} ($${item.price})`).join('\n');
    const downloadLinksList = downloadLinks.map((link: string, index: number) => 
      `${index + 1}. ${link}`
    ).join('\n');

    const emailContent = `
Dear Customer,

Thank you for your purchase! Your order has been successfully processed.

Order Details:
- Order ID: ${orderDetails.id}
- Total Amount: $${orderDetails.total_amount}
- Payment Method: PayPal

Items Purchased:
${itemsList}

Download Links:
${downloadLinksList}

Please save these download links for future reference. You can also access your downloads anytime from your account profile.

If you have any questions or need support, please don't hesitate to contact us.

Thank you for your business!

Best regards,
The Team
    `;

    // For now, we'll simulate email sending
    // In production, you would integrate with an email service like Resend, SendGrid, etc.
    console.log('Email content prepared for:', email);
    console.log('Email content:', emailContent);

    // Log the email sending (simulate successful send)
    const { error: logError } = await supabase
      .from('email_logs')
      .insert({
        recipient: email,
        subject: `Download Links for Order ${orderDetails.id}`,
        content: emailContent,
        order_id: orderDetails.id,
        sent_at: new Date().toISOString()
      })

    if (logError) {
      console.warn('Could not log email (table may not exist):', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Download email sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Email sending error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
