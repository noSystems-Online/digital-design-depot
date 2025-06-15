
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";

const NewSellerDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <Link to="/product-upload">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
            </Button>
          </Link>
        </div>
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-2">Welcome to your dashboard!</h2>
          <p className="text-gray-600">You can manage your products and view your sales statistics here.</p>
          <p className="text-gray-600 mt-4">More features are coming soon, including a list of your submitted products and their approval status!</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewSellerDashboard;
