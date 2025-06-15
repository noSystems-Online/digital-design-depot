
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const getPayPalAccessToken = async (clientId: string, environment: string) => {
  const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
  
  if (!clientSecret) {
    throw new Error('PayPal client secret not configured');
  }

  const paypalUrl = environment === 'sandbox' 
    ? 'https://api.sandbox.paypal.com'
    : 'https://api.paypal.com';

  const response = await fetch(`${paypalUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { orderId, config } = await req.json()

    console.log('Capturing PayPal order:', orderId);

    // Get PayPal access token using the config
    const accessToken = await getPayPalAccessToken(config.client_id, config.environment);

    // Capture PayPal order
    const paypalUrl = config.environment === 'sandbox' 
      ? 'https://api.sandbox.paypal.com'
      : 'https://api.paypal.com';

    const captureResponse = await fetch(`${paypalUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!captureResponse.ok) {
      const errorData = await captureResponse.text();
      console.error('PayPal capture error:', errorData);
      throw new Error('Failed to capture PayPal payment');
    }

    const captureData = await captureResponse.json();
    console.log('PayPal payment captured:', captureData);

    // Update order status in database
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'completed',
        billing_info: { 
          paypal_capture_id: captureData.id,
          paypal_status: captureData.status 
        }
      })
      .eq('billing_info->paypal_order_id', orderId);

    if (updateError) {
      console.error('Failed to update order status:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        captureId: captureData.id,
        status: captureData.status
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('PayPal capture error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
