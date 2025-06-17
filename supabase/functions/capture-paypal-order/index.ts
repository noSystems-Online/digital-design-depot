
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

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken(config.client_id, config.environment);

    // Capture the payment
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
      throw new Error('Failed to capture PayPal payment');
    }

    const captureData = await captureResponse.json();
    console.log('PayPal payment captured:', captureData);

    // Find the order by PayPal order ID in billing_info
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .contains('billing_info', { paypal_order_id: orderId });

    if (fetchError) {
      throw new Error(`Failed to find order: ${fetchError.message}`);
    }

    if (!orders || orders.length === 0) {
      throw new Error('Order not found');
    }

    const order = orders[0];

    // Update order status to completed
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update order status:', updateError);
      throw new Error(`Failed to update order status: ${updateError.message}`);
    }

    console.log('Order status updated to completed:', updatedOrder.id);

    return new Response(
      JSON.stringify({
        success: true,
        order: updatedOrder,
        paypalData: captureData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('PayPal capture error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
