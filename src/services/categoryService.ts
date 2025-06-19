
import { supabase } from "@/integrations/supabase/client";

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const fetchCategories = async (): Promise<ProductCategory[]> => {
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    throw new Error(error.message);
  }

  return data || [];
};

export const createCategory = async (category: Omit<ProductCategory, 'id' | 'created_at' | 'updated_at'>): Promise<ProductCategory> => {
  const { data, error } = await supabase
    .from('product_categories')
    .insert([category])
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw new Error(error.message);
  }

  return data;
};

export const updateCategory = async (id: string, updates: Partial<ProductCategory>): Promise<ProductCategory> => {
  const { data, error } = await supabase
    .from('product_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    throw new Error(error.message);
  }

  return data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('product_categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    throw new Error(error.message);
  }
};
