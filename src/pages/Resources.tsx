
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductSearch from "@/components/ProductSearch";
import ProductGrid from "@/components/ProductGrid";

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Design Resources
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Icons, design systems, and essential resources for your projects
            </p>
          </div>
          
          <ProductSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search design resources..."
          />
          
          <ProductGrid
            searchTerm={searchTerm}
            gradientFrom="from-orange-500"
            gradientTo="to-red-500"
            category="resources"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Resources;
