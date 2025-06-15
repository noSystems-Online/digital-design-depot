
-- Create admin policies for profiles table
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (public.get_user_role() = 'admin') WITH CHECK (public.get_user_role() = 'admin');
