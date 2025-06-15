
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart } from "lucide-react";

const Software = () => {
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {softwareProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer">
                <CardHeader className="p-0">
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
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

export default Software;
