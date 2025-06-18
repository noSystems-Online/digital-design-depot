
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "npm:resend@2.0.0"

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

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

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

    const emailSubject = `Download Links for Order ${orderDetails.id}`;
    
    const emailContent = `
Dear Customer,

Thank you for your purchase! Your order has been successfully processed.

Order Details:
- Order ID: ${orderDetails.id}
- Total Amount: $${orderDetails.total_amount}
- Payment Method: ${orderDetails.payment_method}

Items Purchased:
${itemsList}

Download Links:
${downloadLinksList}

Please save these download links for future reference. You can also access your downloads anytime from your account profile.

If you have any questions or need support, please don't hesitate to contact us.

Thank you for your business!

Best regards,
The Codigs Store Team
    `;

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "Codigs Store <noreply@resend.dev>",
      to: [email],
      subject: emailSubject,
      text: emailContent,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank you for your purchase!</h2>
          <p>Your order has been successfully processed.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> ${orderDetails.id}</p>
            <p><strong>Total Amount:</strong> $${orderDetails.total_amount}</p>
            <p><strong>Payment Method:</strong> ${orderDetails.payment_method}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #333;">Items Purchased</h3>
            <ul>
              ${items.map((item: any) => `<li>${item.title} ($${item.price})</li>`).join('')}
            </ul>
          </div>

          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Download Links</h3>
            <ol>
              ${downloadLinks.map((link: string) => `<li><a href="${link}" style="color: #0066cc; text-decoration: none;">${link}</a></li>`).join('')}
            </ol>
            <p style="margin-bottom: 0;"><small>Please save these links for future reference. You can also access your downloads anytime from your account profile.</small></p>
          </div>

          <p>If you have any questions or need support, please don't hesitate to contact us.</p>
          <p>Best regards,<br><strong>The Codigs Store Team</strong></p>
        </div>
      `
    });

    console.log('Email sent successfully:', emailResponse);

    // Log the email sending
    const { error: logError } = await supabase
      .from('email_logs')
      .insert({
        recipient: email,
        subject: emailSubject,
        content: emailContent,
        order_id: orderDetails.id,
        sent_at: new Date().toISOString()
      })

    if (logError) {
      console.warn('Could not log email:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Download email sent successfully',
        emailId: emailResponse.data?.id
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
