
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

// PayPal configuration - easy to switch between sandbox and live
export const PAYPAL_CONFIG = {
  CLIENT_ID: 'ARMqjKq6xfR0awtlzCm98pTb8gGyB8A88wfgc_QcP2Yg7b6BNjuLWKYrVCFy5IvZkAqPbzUMXK_-Ap04',
  ENVIRONMENT: 'sandbox', // Change to 'live' for production
  get PAYPAL_URL() {
    return this.ENVIRONMENT === 'sandbox' 
      ? 'https://api.sandbox.paypal.com'
      : 'https://api.paypal.com';
  },
  get PAYPAL_SCRIPT_URL() {
    return this.ENVIRONMENT === 'sandbox'
      ? 'https://www.sandbox.paypal.com/sdk/js'
      : 'https://www.paypal.com/sdk/js';
  }
};

export const createPayPalOrder = async (
  paymentData: PayPalPaymentData,
  formData: CheckoutFormData,
  cartItems: any[]
) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-paypal-order', {
      body: {
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
        billingInfo: formData,
        items: cartItems,
        environment: PAYPAL_CONFIG.ENVIRONMENT
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('PayPal order creation error:', error);
    throw error;
  }
};

export const capturePayPalOrder = async (orderId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('capture-paypal-order', {
      body: {
        orderId,
        environment: PAYPAL_CONFIG.ENVIRONMENT
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('PayPal order capture error:', error);
    throw error;
  }
};

// Legacy function for backward compatibility
export const processPayPalPayment = async (
  paymentData: PayPalPaymentData,
  formData: CheckoutFormData,
  cartItems: any[]
) => {
  return createPayPalOrder(paymentData, formData, cartItems);
};
