
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductSearch from "@/components/ProductSearch";
import ProductGrid from "@/components/ProductGrid";

const Software = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const softwareProducts = [
    {
      id: 1,
      title: "React Dashboard Pro",
      description: "Complete admin dashboard with authentication, charts, and user management",
      price: "$49",
      rating: 4.8,
      reviews: 156,
      image: "/placeholder.svg",
      tags: ["React", "TypeScript", "Admin"]
    },
    {
      id: 2,
      title: "Vue E-commerce Kit",
      description: "Full-featured e-commerce solution with payment integration",
      price: "$79",
      rating: 4.9,
      reviews: 203,
      image: "/placeholder.svg",
      tags: ["Vue.js", "E-commerce", "Stripe"]
    },
    {
      id: 3,
      title: "SaaS Starter Template",
      description: "Complete SaaS application template with subscription management",
      price: "$129",
      rating: 4.7,
      reviews: 89,
      image: "/placeholder.svg",
      tags: ["React", "SaaS", "Payments"]
    },
    {
      id: 4,
      title: "Mobile App Framework",
      description: "Cross-platform mobile app framework with native features",
      price: "$99",
      rating: 4.6,
      reviews: 124,
      image: "/placeholder.svg",
      tags: ["React Native", "Mobile", "Cross-platform"]
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Software Applications
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Premium web applications, SaaS templates, and complete software solutions
            </p>
          </div>
          
          <ProductSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search software applications..."
          />
          
          <ProductGrid
            products={softwareProducts}
            searchTerm={searchTerm}
            gradientFrom="from-blue-100"
            gradientTo="to-purple-100"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Software;
