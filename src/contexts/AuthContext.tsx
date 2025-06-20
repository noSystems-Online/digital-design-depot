
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  roles: ('buyer' | 'seller' | 'admin')[];
  sellerStatus?: 'pending' | 'approved' | 'rejected';
  sellerInfo?: {
    businessName: string;
    description: string;
    productTypes: string[];
    phone?: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isBuyer: boolean;
  isSeller: boolean;
  isSellerApproved: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  applyToBeSeller: (sellerData: any) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Check for an existing session on initial load.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for subsequent auth state changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Defer fetching profile to avoid issues inside onAuthStateChange callback
        setTimeout(() => {
          fetchUserProfile(session.user);
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const firstName = supabaseUser.user_metadata?.full_name?.split(' ')[0] || 
                         supabaseUser.user_metadata?.first_name || '';
        const lastName = supabaseUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 
                        supabaseUser.user_metadata?.last_name || '';

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: supabaseUser.id,
            email: supabaseUser.email,
            first_name: firstName,
            last_name: lastName,
            roles: ['buyer']
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          setLoading(false);
          return null;
        }

        profile = newProfile;
      } else if (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
        return null;
      }

      // Fetch user roles from the new roles system - but fallback gracefully if it fails
      let userRoles: ('buyer' | 'seller' | 'admin')[] = [];
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select(`
            role:roles(name)
          `)
          .eq('user_id', supabaseUser.id);

        if (roleError) {
          console.error('Error fetching user roles:', roleError);
          // Fallback to profile roles if new system fails
          userRoles = (profile.roles || ['buyer']).filter((role: string): role is 'buyer' | 'seller' | 'admin' => 
            ['buyer', 'seller', 'admin'].includes(role)
          );
        } else if (roleData && roleData.length > 0) {
          const roleNames = roleData.map(item => item.role?.name).filter(Boolean);
          userRoles = roleNames.filter((role): role is 'buyer' | 'seller' | 'admin' => 
            ['buyer', 'seller', 'admin'].includes(role)
          );
        } else {
          // No roles in new system, use old system
          userRoles = (profile.roles || ['buyer']).filter((role: string): role is 'buyer' | 'seller' | 'admin' => 
            ['buyer', 'seller', 'admin'].includes(role)
          );
        }
      } catch (roleErr) {
        console.error('Error in role fetching:', roleErr);
        // Fallback to old role system
        userRoles = (profile.roles || ['buyer']).filter((role: string): role is 'buyer' | 'seller' | 'admin' => 
          ['buyer', 'seller', 'admin'].includes(role)
        );
      }

      const userData: User = {
        id: profile.id,
        email: profile.email,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
        roles: userRoles,
        sellerStatus: profile.seller_status,
        sellerInfo: profile.seller_info as User['sellerInfo']
      };

      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const userProfile = await fetchUserProfile(data.user);
        if (userProfile) {
          return { success: true, user: userProfile };
        }
        return { success: false, error: "Could not fetch user profile after login." };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const applyToBeSeller = async (sellerData: any) => {
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    try {
      // Ensure we have valid role strings and filter to only valid roles
      const currentRoles = user.roles.filter((role): role is 'buyer' | 'seller' | 'admin' => 
        ['buyer', 'seller', 'admin'].includes(role)
      );
      
      const newRoles: ('buyer' | 'seller' | 'admin')[] = [...currentRoles];
      if (!newRoles.includes('seller')) {
        newRoles.push('seller');
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          roles: newRoles,
          seller_status: 'pending',
          seller_info: sellerData
        })
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Update local user state with proper typing
      setUser({
        ...user,
        roles: newRoles,
        sellerStatus: 'pending',
        sellerInfo: sellerData
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const isBuyer = user?.roles.includes('buyer') || false;
  const isSeller = user?.roles.includes('seller') || false;
  const isSellerApproved = isSeller && user?.sellerStatus === 'approved';
  const isAdmin = user?.roles.includes('admin') || false;

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isBuyer,
      isSeller,
      isSellerApproved,
      isAdmin,
      login,
      loginWithGoogle,
      logout,
      applyToBeSeller,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
