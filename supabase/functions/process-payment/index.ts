
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

    const { paymentMethod, amount, currency, description, billingInfo, items } = await req.json()

    console.log('Processing payment:', { paymentMethod, amount, currency });

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Create order in database
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        total_amount: amount,
        payment_method: paymentMethod,
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

    // For PayPal, we'll simulate the payment process
    // In a real implementation, you would integrate with PayPal's API
    if (paymentMethod === 'paypal') {
      // Simulate PayPal payment approval
      const paypalResponse = {
        paymentId: `PAYPAL_${Date.now()}`,
        status: 'APPROVED',
        orderId: orderData.id,
        approvalUrl: `https://www.sandbox.paypal.com/checkoutnow?token=SAMPLE_TOKEN_${Date.now()}`
      }

      console.log('PayPal payment response:', paypalResponse);

      return new Response(
        JSON.stringify({
          success: true,
          orderId: orderData.id,
          paymentId: paypalResponse.paymentId,
          approvalUrl: paypalResponse.approvalUrl,
          status: 'pending_approval'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // For bank transfer
    if (paymentMethod === 'bank') {
      return new Response(
        JSON.stringify({
          success: true,
          orderId: orderData.id,
          status: 'pending_bank_transfer',
          instructions: 'Please transfer the amount to the provided bank details. Order will be processed upon payment confirmation.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    throw new Error('Unsupported payment method')

  } catch (error) {
    console.error('Payment processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
