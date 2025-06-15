
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductSearch from "@/components/ProductSearch";
import ProductGrid from "@/components/ProductGrid";

const Templates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const templateProducts = [
    {
      id: 1,
      title: "Modern Landing Page",
      description: "Responsive landing page template with smooth animations",
      price: "$29",
      rating: 4.9,
      reviews: 312,
      image: "/placeholder.svg",
      tags: ["HTML", "CSS", "JavaScript"]
    },
    {
      id: 2,
      title: "Portfolio Template",
      description: "Creative portfolio template for designers and developers",
      price: "$39",
      rating: 4.8,
      reviews: 189,
      image: "/placeholder.svg",
      tags: ["React", "Portfolio", "Creative"]
    },
    {
      id: 3,
      title: "Blog Template",
      description: "Clean and minimal blog template with CMS integration",
      price: "$35",
      rating: 4.7,
      reviews: 267,
      image: "/placeholder.svg",
      tags: ["Blog", "CMS", "Responsive"]
    },
    {
      id: 4,
      title: "E-commerce Template",
      description: "Complete e-commerce template with shopping cart functionality",
      price: "$59",
      rating: 4.6,
      reviews: 145,
      image: "/placeholder.svg",
      tags: ["E-commerce", "Shopping", "Responsive"]
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              UI Templates
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Beautiful, responsive templates for landing pages, portfolios, and more
            </p>
          </div>
          
          <ProductSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search templates..."
          />
          
          <ProductGrid
            products={templateProducts}
            searchTerm={searchTerm}
            gradientFrom="from-green-100"
            gradientTo="to-blue-100"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Templates;
