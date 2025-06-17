
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

export interface PayPalConfig {
  client_id: string;
  environment: 'sandbox' | 'live';
  is_active: boolean;
}

// Fetch PayPal configuration from database
export const getPayPalConfig = async (): Promise<PayPalConfig> => {
  const { data, error } = await supabase
    .from('paypal_config')
    .select('*')
    .single();

  if (error) {
    // Fallback to default sandbox config if no config found
    console.warn('PayPal config not found, using default sandbox config');
    return {
      client_id: 'ARMqjKq6xfR0awtlzCm98pTb8gGyB8A88wfgc_QcP2Yg7b6BNjuLWKYrVCFy5IvZkAqPbzUMXK_-Ap04',
      environment: 'sandbox',
      is_active: true
    };
  }

  return {
    client_id: data.client_id,
    environment: data.environment as 'sandbox' | 'live',
    is_active: data.is_active
  };
};

export const createPayPalOrder = async (
  paymentData: PayPalPaymentData,
  formData: CheckoutFormData,
  cartItems: any[]
) => {
  try {
    const config = await getPayPalConfig();

    if (!config.is_active) {
      throw new Error('PayPal payments are currently disabled');
    }

    const { data, error } = await supabase.functions.invoke('create-paypal-order', {
      body: {
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
        billingInfo: formData,
        items: cartItems,
        config: config
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
    const config = await getPayPalConfig();

    const { data, error } = await supabase.functions.invoke('capture-paypal-order', {
      body: {
        orderId,
        config: config
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    // Check if the response indicates success
    if (data && data.success === false) {
      throw new Error(data.error || 'PayPal capture failed');
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
