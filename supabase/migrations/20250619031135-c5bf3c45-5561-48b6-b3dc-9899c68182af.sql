
-- Create product_categories table for better management
CREATE TABLE public.product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create roles table for better role management
CREATE TABLE public.roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles junction table for many-to-many relationship
CREATE TABLE public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES public.profiles(id),
  UNIQUE(user_id, role_id)
);

-- Create news/promotions table for hero section
CREATE TABLE public.site_news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'news' CHECK (type IN ('news', 'promotion', 'announcement')),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default product categories
INSERT INTO public.product_categories (name, description, icon, display_order) VALUES
('software', 'Software applications and tools', 'Code', 1),
('templates', 'Design templates and themes', 'Layout', 2),
('code-scripts', 'Code snippets and scripts', 'FileCode', 3),
('resources', 'Digital resources and assets', 'Package', 4);

-- Insert default roles
INSERT INTO public.roles (name, description, permissions) VALUES
('buyer', 'Basic user who can purchase products', '{"can_purchase": true, "can_view_products": true}'),
('seller', 'User who can sell products', '{"can_purchase": true, "can_view_products": true, "can_create_products": true, "can_manage_own_products": true}'),
('admin', 'Administrator with full access', '{"can_purchase": true, "can_view_products": true, "can_create_products": true, "can_manage_all_products": true, "can_manage_users": true, "can_manage_site": true}');

-- Enable RLS on new tables
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_news ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_categories
CREATE POLICY "Anyone can view active categories" ON public.product_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.product_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- RLS policies for roles
CREATE POLICY "Anyone can view active roles" ON public.roles
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage roles" ON public.roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- RLS policies for site_news
CREATE POLICY "Anyone can view active news" ON public.site_news
  FOR SELECT USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

CREATE POLICY "Admins can manage news" ON public.site_news
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON public.product_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_news_updated_at BEFORE UPDATE ON public.site_news
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample news/promotion for hero section
INSERT INTO public.site_news (title, content, type, is_featured) VALUES
('Welcome to Codigs Store', 'Discover premium digital products created by developers, for developers. Get started with exclusive deals and high-quality software, templates, and resources.', 'announcement', true),
('Grand Opening Sale', 'Celebrate our launch with 20% off all premium software and templates. Use code LAUNCH20 at checkout. Limited time offer!', 'promotion', true);
