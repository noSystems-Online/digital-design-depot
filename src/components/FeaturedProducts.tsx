
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Eye } from "lucide-react";

const FeaturedProducts = () => {
  const products = [
    {
      id: 1,
      title: "React E-commerce Dashboard",
      description: "Complete admin dashboard with analytics, user management, and order tracking",
      price: 89,
      originalPrice: 149,
      rating: 4.9,
      reviews: 234,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
      category: "Web Apps",
      tag: "Best Seller",
      tagColor: "bg-green-500"
    },
    {
      id: 2,
      title: "Mobile Banking App Template",
      description: "React Native banking app with biometric auth and payment integration",
      price: 129,
      originalPrice: 199,
      rating: 4.8,
      reviews: 187,
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop",
      category: "Mobile Apps",
      tag: "New",
      tagColor: "bg-blue-500"
    },
    {
      id: 3,
      title: "Python Data Analysis Toolkit",
      description: "Complete suite of data analysis scripts and visualization tools",
      price: 45,
      originalPrice: 75,
      rating: 4.7,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
      category: "Scripts",
      tag: "Popular",
      tagColor: "bg-purple-500"
    },
    {
      id: 4,
      title: "SaaS Landing Page Kit",
      description: "Modern landing page templates for SaaS products with conversion optimization",
      price: 67,
      originalPrice: 99,
      rating: 4.9,
      reviews: 312,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
      category: "Templates",
      tag: "Hot",
      tagColor: "bg-red-500"
    },
    {
      id: 5,
      title: "Vue.js Component Library",
      description: "Professional UI component library with 50+ customizable components",
      price: 156,
      originalPrice: 250,
      rating: 4.8,
      reviews: 98,
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop",
      category: "Libraries",
      tag: "Premium",
      tagColor: "bg-yellow-500"
    },
    {
      id: 6,
      title: "Node.js API Boilerplate",
      description: "Production-ready REST API with authentication, testing, and documentation",
      price: 78,
      originalPrice: 120,
      rating: 4.6,
      reviews: 203,
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop",
      category: "Backend",
      tag: "Updated",
      tagColor: "bg-indigo-500"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hand-picked premium products that developers love
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 shadow-lg overflow-hidden">
              <div className="relative overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <Badge className={`${product.tagColor} text-white border-0`}>
                    {product.tag}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-xs text-gray-500">({product.reviews})</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors line-clamp-1">
                  {product.title}
                </h3>
              </CardHeader>
              
              <CardContent className="pb-4">
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                  {product.description}
                </p>
              </CardContent>
              
              <CardFooter className="pt-0 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ${product.price}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${product.originalPrice}
                  </span>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="px-8 py-3">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
