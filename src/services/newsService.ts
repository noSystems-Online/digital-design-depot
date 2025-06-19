
import { supabase } from "@/integrations/supabase/client";

export interface SiteNews {
  id: string;
  title: string;
  content: string;
  type: 'news' | 'promotion' | 'announcement';
  image_url?: string;
  is_active: boolean;
  is_featured: boolean;
  valid_from: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
}

export const fetchFeaturedNews = async (): Promise<SiteNews[]> => {
  const { data, error } = await supabase
    .from('site_news')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .or('valid_until.is.null,valid_until.gt.now()')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error fetching featured news:', error);
    throw new Error(error.message);
  }

  return (data || []).map(item => ({
    ...item,
    type: item.type as 'news' | 'promotion' | 'announcement'
  }));
};

export const fetchAllNews = async (): Promise<SiteNews[]> => {
  const { data, error } = await supabase
    .from('site_news')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching news:', error);
    throw new Error(error.message);
  }

  return (data || []).map(item => ({
    ...item,
    type: item.type as 'news' | 'promotion' | 'announcement'
  }));
};

export const createNews = async (news: Omit<SiteNews, 'id' | 'created_at' | 'updated_at'>): Promise<SiteNews> => {
  const { data, error } = await supabase
    .from('site_news')
    .insert([news])
    .select()
    .single();

  if (error) {
    console.error('Error creating news:', error);
    throw new Error(error.message);
  }

  return {
    ...data,
    type: data.type as 'news' | 'promotion' | 'announcement'
  };
};

export const updateNews = async (id: string, updates: Partial<SiteNews>): Promise<SiteNews> => {
  const { data, error } = await supabase
    .from('site_news')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating news:', error);
    throw new Error(error.message);
  }

  return {
    ...data,
    type: data.type as 'news' | 'promotion' | 'announcement'
  };
};

export const deleteNews = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('site_news')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting news:', error);
    throw new Error(error.message);
  }
};
