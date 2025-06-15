import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  roles: ('buyer' | 'seller')[];
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
  logout: () => void;
  applyToBeSeller: (sellerData: any) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo credentials - updated to support multiple roles
const DEMO_USERS = [
  { 
    id: 1, 
    email: 'buyer@demo.com', 
    password: 'buyer123', 
    name: 'John Buyer', 
    roles: ['buyer' as const]
  },
  { 
    id: 2, 
    email: 'seller@demo.com', 
    password: 'seller123', 
    name: 'Jane Seller', 
    roles: ['buyer' as const, 'seller' as const],
    sellerStatus: 'approved' as const,
    sellerInfo: {
      businessName: 'Jane\'s Digital Store',
      description: 'Creating amazing digital products',
      productTypes: ['Software Applications', 'Website Templates']
    }
  },
  { 
    id: 3, 
    email: 'dual@demo.com', 
    password: 'dual123', 
    name: 'Alex Both', 
    roles: ['buyer' as const, 'seller' as const],
    sellerStatus: 'approved' as const,
    sellerInfo: {
      businessName: 'Alex Creative Studio',
      description: 'Full-stack developer and designer',
      productTypes: ['Software Applications', 'Design Resources', 'Code Scripts & Libraries']
    }
  }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const foundUser = DEMO_USERS.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      return { success: true, user: userWithoutPassword };
    }
    
    return { success: false, error: 'Invalid email or password' };
  };

  const logout = () => {
    setUser(null);
  };

  const applyToBeSeller = async (sellerData: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (user) {
      const updatedUser = {
        ...user,
        roles: [...user.roles, 'seller' as const],
        sellerStatus: 'pending' as const,
        sellerInfo: sellerData
      };
      setUser(updatedUser);
      return { success: true };
    }
    
    return { success: false, error: 'User not found' };
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
      logout,
      applyToBeSeller
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
