import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  tags: string[];
  category: 'software' | 'templates' | 'code-scripts' | 'resources';
  seller_id: string;
  download_url?: string;
  created_at: string;
  is_active?: boolean;
}

export const fetchProducts = async (category?: string): Promise<Product[]> => {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (category && (category === 'software' || category === 'templates' || category === 'code-scripts' || category === 'resources')) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    // Transform the data to match the expected format
    return data.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description || '',
      price: parseFloat(product.price.toString()),
      rating: 4.5, // Default rating since we don't have reviews yet
      reviews: 0, // Default reviews count
      image: product.image_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
      tags: product.tags || [],
      category: product.category,
      seller_id: product.seller_id,
      download_url: product.download_url,
      created_at: product.created_at,
      is_active: product.is_active,
    }));
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    return [];
  }
};

export const fetchAllProductsForAdmin = async (): Promise<Product[]> => {
  try {
    console.log('Fetching all products for admin...');
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all products for admin:', error);
      throw error;
    }

    console.log('Successfully fetched products:', data?.length || 0);

    // Transform the data to match the expected format
    return data.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description || '',
      price: parseFloat(product.price.toString()),
      rating: 4.5, // Default rating since we don't have reviews yet
      reviews: 0, // Default reviews count
      image: product.image_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
      tags: product.tags || [],
      category: product.category,
      seller_id: product.seller_id,
      download_url: product.download_url,
      created_at: product.created_at,
      is_active: product.is_active,
    }));
  } catch (error) {
    console.error('Error in fetchAllProductsForAdmin:', error);
    throw error;
  }
};

export const fetchPendingProducts = async (): Promise<Product[]> => {
  try {
    const query = supabase
      .from('products')
      .select('*')
      .eq('is_active', false);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending products:', error);
      return [];
    }

    // Transform the data to match the expected format
    return data.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description || '',
      price: parseFloat(product.price.toString()),
      rating: 4.5, // Default rating since we don't have reviews yet
      reviews: 0, // Default reviews count
      image: product.image_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
      tags: product.tags || [],
      category: product.category,
      seller_id: product.seller_id,
      download_url: product.download_url,
      created_at: product.created_at,
      is_active: product.is_active,
    }));
  } catch (error) {
    console.error('Error in fetchPendingProducts:', error);
    return [];
  }
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      price: parseFloat(data.price.toString()),
      rating: 4.5,
      reviews: 0,
      image: data.image_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
      tags: data.tags || [],
      category: data.category,
      seller_id: data.seller_id,
      download_url: data.download_url,
      created_at: data.created_at,
      is_active: data.is_active,
    };
  } catch (error) {
    console.error('Error in fetchProductById:', error);
    return null;
  }
};

export const updateProductStatus = async (productId: string, isActive: boolean) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ is_active: isActive })
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error updating product status:', error);
    return { success: false, error };
  }
};

export const deleteProduct = async (productId: string) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error };
  }
};

export interface ProductCreationData {
  title: string;
  description: string;
  category: 'software' | 'templates' | 'code-scripts' | 'resources';
  price: number;
  image_url?: string;
  download_url?: string;
  tags?: string[];
  seller_id: string;
}

export const createProduct = async (productData: ProductCreationData) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([productData]);

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error creating product:', error);
    return { success: false, error };
  }
};

export const fetchProductsBySeller = async (sellerId: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching seller products:', error);
      return [];
    }

    return data.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description || '',
      price: parseFloat(product.price.toString()),
      rating: 4.5,
      reviews: 0,
      image: product.image_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
      tags: product.tags || [],
      category: product.category,
      seller_id: product.seller_id,
      download_url: product.download_url,
      created_at: product.created_at,
      is_active: product.is_active,
    }));
  } catch (error) {
    console.error('Error in fetchProductsBySeller:', error);
    return [];
  }
};
