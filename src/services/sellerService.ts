
import { supabase } from '@/integrations/supabase/client';

export interface Seller {
  id: string;
  businessName: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export const fetchSellerById = async (sellerId: string): Promise<Seller | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, seller_info')
      .eq('id', sellerId)
      .single();

    if (error) {
      console.error('Error fetching seller:', error);
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      businessName: data.seller_info?.businessName || `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.email,
    };
  } catch (error) {
    console.error('Error in fetchSellerById:', error);
    return null;
  }
};
