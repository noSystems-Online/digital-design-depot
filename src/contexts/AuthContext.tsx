
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
        return;
      }

      const userData: User = {
        id: profile.id,
        email: profile.email,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
        roles: profile.roles || ['buyer'],
        sellerStatus: profile.seller_status,
        sellerInfo: profile.seller_info as User['sellerInfo']
      };

      setUser(userData);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
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
        await fetchUserProfile(data.user);
        return { success: true };
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
          redirectTo: `${window.location.origin}/`
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
      const { error } = await supabase
        .from('profiles')
        .update({
          roles: [...user.roles, 'seller'],
          seller_status: 'pending',
          seller_info: sellerData
        })
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Update local user state
      setUser({
        ...user,
        roles: [...user.roles, 'seller'] as ('buyer' | 'seller' | 'admin')[],
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

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isBuyer,
      isSeller,
      isSellerApproved,
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
