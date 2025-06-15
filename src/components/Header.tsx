
import { ShoppingCart, Search, User, LogIn, LogOut, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const { isLoggedIn, user, logout, isSeller, isSellerApproved, loading } = useAuth();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Codigs Store
            </h1>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/software" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Software
            </Link>
            <Link to="/templates" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Templates
            </Link>
            <Link to="/code-scripts" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Code Scripts
            </Link>
            <Link to="/resources" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Resources
            </Link>
            {!isSeller && !loading && (
              <Link to="/sell" className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors border border-green-200 px-3 py-1 rounded-full">
                Become a Seller
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                className="pl-10 w-64"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          ) : isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {user?.name}
                  {isSeller && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {isSellerApproved ? 'Seller' : 'Pending'}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                {isSeller && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/sell" className="flex items-center">
                        <Store className="h-4 w-4 mr-2" />
                        Seller Settings
                      </Link>
                    </DropdownMenuItem>
                    {isSellerApproved && (
                      <DropdownMenuItem asChild>
                        <Link to="/seller-dashboard">Seller Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                {!isSeller && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/sell" className="flex items-center text-green-600">
                        <Store className="h-4 w-4 mr-2" />
                        Become a Seller
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm" className="flex items-center">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          )}
          
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
