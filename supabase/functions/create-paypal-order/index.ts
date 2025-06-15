
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const getPayPalAccessToken = async (environment: string) => {
  const clientId = 'ARMqjKq6xfR0awtlzCm98pTb8gGyB8A88wfgc_QcP2Yg7b6BNjuLWKYrVCFy5IvZkAqPbzUMXK_-Ap04';
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

    const { amount, currency, description, billingInfo, items, environment } = await req.json()

    console.log('Creating PayPal order:', { amount, currency, environment });

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Create order in database first
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        total_amount: amount,
        payment_method: 'paypal',
        billing_info: billingInfo,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`)
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: orderData.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      throw new Error(`Failed to create order items: ${itemsError.message}`)
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken(environment);

    // Create PayPal order
    const paypalUrl = environment === 'sandbox' 
      ? 'https://api.sandbox.paypal.com'
      : 'https://api.paypal.com';

    const paypalOrder = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: orderData.id,
        amount: {
          currency_code: currency,
          value: amount.toFixed(2)
        },
        description: description
      }],
      application_context: {
        return_url: `${req.headers.get('origin')}/checkout/success`,
        cancel_url: `${req.headers.get('origin')}/checkout/cancel`
      }
    };

    const paypalResponse = await fetch(`${paypalUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(paypalOrder)
    });

    if (!paypalResponse.ok) {
      const errorData = await paypalResponse.text();
      console.error('PayPal API error:', errorData);
      throw new Error('Failed to create PayPal order');
    }

    const paypalData = await paypalResponse.json();
    console.log('PayPal order created:', paypalData.id);

    // Update our order with PayPal order ID
    await supabase
      .from('orders')
      .update({ 
        payment_method: 'paypal',
        billing_info: { 
          ...billingInfo, 
          paypal_order_id: paypalData.id 
        }
      })
      .eq('id', orderData.id);

    const approvalUrl = paypalData.links.find((link: any) => link.rel === 'approve')?.href;

    return new Response(
      JSON.stringify({
        success: true,
        orderId: orderData.id,
        paypalOrderId: paypalData.id,
        approvalUrl: approvalUrl,
        status: 'pending_approval'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('PayPal order creation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
