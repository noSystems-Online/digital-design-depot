
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductSearch from "@/components/ProductSearch";
import ProductGrid from "@/components/ProductGrid";

const CodeScripts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const scriptProducts = [
    {
      id: 1,
      title: "Data Scraping Tool",
      description: "Python script for web scraping with advanced data extraction",
      price: "$19",
      rating: 4.8,
      reviews: 89,
      image: "/placeholder.svg",
      tags: ["Python", "Scraping", "Automation"]
    },
    {
      id: 2,
      title: "API Integration Kit",
      description: "Node.js scripts for seamless third-party API integrations",
      price: "$25",
      rating: 4.9,
      reviews: 156,
      image: "/placeholder.svg",
      tags: ["Node.js", "API", "Integration"]
    },
    {
      id: 3,
      title: "Database Migration Tools",
      description: "SQL scripts and utilities for database migrations",
      price: "$15",
      rating: 4.7,
      reviews: 73,
      image: "/placeholder.svg",
      tags: ["SQL", "Database", "Migration"]
    },
    {
      id: 4,
      title: "Automation Scripts",
      description: "Collection of automation scripts for development workflows",
      price: "$35",
      rating: 4.6,
      reviews: 124,
      image: "/placeholder.svg",
      tags: ["Automation", "DevOps", "Scripts"]
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
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
            products={scriptProducts}
            searchTerm={searchTerm}
            gradientFrom="from-purple-100"
            gradientTo="to-pink-100"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CodeScripts;
