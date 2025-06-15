
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import SellerProductList from "@/components/SellerProductList";
import { Skeleton } from "@/components/ui/skeleton";

const NewSellerDashboard = () => {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Products</h1>
          <Link to="/product-upload">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
            </Button>
          </Link>
        </div>
        <div>
          {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
          ) : user ? (
            <SellerProductList sellerId={user.id} />
          ) : (
            <p>Please log in to see your dashboard.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewSellerDashboard;
