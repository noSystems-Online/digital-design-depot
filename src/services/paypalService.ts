
import { supabase } from '@/integrations/supabase/client';

export interface PayPalPaymentData {
  amount: number;
  currency: string;
  description: string;
  orderId?: string;
}

export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  zipCode: string;
}

export const processPayPalPayment = async (
  paymentData: PayPalPaymentData,
  formData: CheckoutFormData,
  cartItems: any[]
) => {
  try {
    const { data, error } = await supabase.functions.invoke('process-payment', {
      body: {
        paymentMethod: 'paypal',
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
        billingInfo: formData,
        items: cartItems
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('PayPal payment processing error:', error);
    throw error;
  }
};

export const createOrder = async (orderData: {
  totalAmount: number;
  billingInfo: CheckoutFormData;
  items: any[];
  paymentMethod: string;
}) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-order', {
      body: orderData
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Order creation error:', error);
    throw error;
  }
};
