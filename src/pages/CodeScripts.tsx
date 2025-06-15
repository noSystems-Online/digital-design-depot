
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductSearch from "@/components/ProductSearch";
import ProductGrid from "@/components/ProductGrid";

const CodeScripts = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Code Scripts
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Automation scripts, utilities, and development tools to boost your productivity
            </p>
          </div>
          
          <ProductSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search code scripts..."
          />
          
          <ProductGrid
            searchTerm={searchTerm}
            gradientFrom="from-purple-500"
            gradientTo="to-pink-500"
            category="code-scripts"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CodeScripts;
