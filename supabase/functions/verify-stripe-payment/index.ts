
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { sessionId } = await req.json()

    console.log('Verifying Stripe payment session:', sessionId);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === 'paid') {
      // Find the order by Stripe session ID
      const { data: orders, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .contains('billing_info', { stripe_session_id: sessionId });

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
        throw new Error(`Failed to update order status: ${updateError.message}`);
      }

      console.log('Order status updated to completed:', updatedOrder.id);

      return new Response(
        JSON.stringify({
          success: true,
          order: updatedOrder,
          sessionData: session
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      throw new Error('Payment not completed')
    }

  } catch (error) {
    console.error('Stripe verification error:', error)
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
