
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductSearch from "@/components/ProductSearch";
import ProductGrid from "@/components/ProductGrid";

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const resourceProducts = [
    {
      id: 1,
      title: "Icon Pack Pro",
      description: "1000+ high-quality icons in multiple formats",
      price: "$12",
      rating: 4.9,
      reviews: 445,
      image: "/placeholder.svg",
      tags: ["Icons", "SVG", "Design"]
    },
    {
      id: 2,
      title: "UI Component Library",
      description: "Complete set of reusable UI components",
      price: "$45",
      rating: 4.8,
      reviews: 267,
      image: "/placeholder.svg",
      tags: ["Components", "UI", "Library"]
    },
    {
      id: 3,
      title: "Design System Kit",
      description: "Comprehensive design system with tokens and guidelines",
      price: "$79",
      rating: 4.7,
      reviews: 189,
      image: "/placeholder.svg",
      tags: ["Design System", "Tokens", "Guidelines"]
    },
    {
      id: 4,
      title: "Development Toolkit",
      description: "Essential tools and utilities for developers",
      price: "$29",
      rating: 4.6,
      reviews: 203,
      image: "/placeholder.svg",
      tags: ["Tools", "Utilities", "Development"]
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
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
            products={resourceProducts}
            searchTerm={searchTerm}
            gradientFrom="from-orange-100"
            gradientTo="to-red-100"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Resources;
