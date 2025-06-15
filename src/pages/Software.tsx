
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import ProductSearch from "@/components/ProductSearch";

const Software = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Software Applications
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover powerful web applications, mobile apps, and desktop software solutions
            </p>
          </div>
          
          <ProductSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search software applications..."
          />
          
          <ProductGrid
            searchTerm={searchTerm}
            gradientFrom="from-blue-500"
            gradientTo="to-purple-500"
            category="software"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Software;
