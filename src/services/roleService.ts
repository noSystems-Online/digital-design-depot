
import { supabase } from "@/integrations/supabase/client";

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_at: string;
  assigned_by?: string;
  role: Role;
}

export const fetchRoles = async (): Promise<Role[]> => {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching roles:', error);
    throw new Error(error.message);
  }

  return data || [];
};

export const createRole = async (role: Omit<Role, 'id' | 'created_at' | 'updated_at'>): Promise<Role> => {
  const { data, error } = await supabase
    .from('roles')
    .insert([role])
    .select()
    .single();

  if (error) {
    console.error('Error creating role:', error);
    throw new Error(error.message);
  }

  return data;
};

export const updateRole = async (id: string, updates: Partial<Role>): Promise<Role> => {
  const { data, error } = await supabase
    .from('roles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating role:', error);
    throw new Error(error.message);
  }

  return data;
};

export const deleteRole = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting role:', error);
    throw new Error(error.message);
  }
};

export const fetchUserRoles = async (): Promise<UserRole[]> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      *,
      role:roles(*)
    `)
    .order('assigned_at', { ascending: false });

  if (error) {
    console.error('Error fetching user roles:', error);
    throw new Error(error.message);
  }

  return data || [];
};

export const assignUserRole = async (userId: string, roleId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_roles')
    .insert([{ user_id: userId, role_id: roleId }]);

  if (error) {
    console.error('Error assigning user role:', error);
    throw new Error(error.message);
  }
};

export const removeUserRole = async (userId: string, roleId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role_id', roleId);

  if (error) {
    console.error('Error removing user role:', error);
    throw new Error(error.message);
  }
};
