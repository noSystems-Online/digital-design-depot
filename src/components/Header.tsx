
import { ShoppingCart, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CodeMarket
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
            <Link to="/sell" className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors border border-green-200 px-3 py-1 rounded-full">
              Sell Products
            </Link>
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
          
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
