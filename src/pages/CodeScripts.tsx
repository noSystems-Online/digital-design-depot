
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart } from "lucide-react";

const CodeScripts = () => {
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {scriptProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer">
                <CardHeader className="p-0">
                  <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-t-lg flex items-center justify-center">
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover rounded-t-lg" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    {product.title}
                  </CardTitle>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                      <span className="text-sm text-gray-400 ml-1">({product.reviews})</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">{product.price}</span>
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CodeScripts;
