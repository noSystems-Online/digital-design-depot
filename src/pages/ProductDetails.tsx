import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Download, Shield, Clock, User } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  // Mock product data - in real app, fetch based on id
  const product = {
    id: id || "1",
    title: "React Dashboard Template",
    price: 49,
    originalPrice: 79,
    rating: 4.8,
    reviews: 124,
    downloads: 2500,
    category: "Templates",
    seller: "DevStudio Pro",
    description: "A comprehensive React dashboard template with modern UI components, charts, and responsive design. Perfect for admin panels and data visualization applications.",
    features: [
      "Modern React 18 with TypeScript",
      "Responsive design for all devices",
      "50+ reusable components",
      "Dark/Light theme support",
      "Advanced charts and analytics",
      "Authentication system included"
    ],
    images: ["/placeholder.svg"],
    tags: ["React", "TypeScript", "Dashboard", "Admin", "UI Kit"]
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0],
      category: product.category
    });
    
    toast({
      title: "Added to cart!",
      description: `${product.title} has been added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // In a real app, you might redirect to checkout immediately
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product Images */}
            <div className="lg:col-span-2">
              <div className="bg-gray-100 rounded-lg p-8 mb-6">
                <img 
                  src={product.images[0]} 
                  alt={product.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              
              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {product.rating} ({product.reviews} reviews)
                      </span>
                    </div>
                    <Badge variant="secondary">{product.category}</Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      {product.downloads} downloads
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {product.seller}
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">Description</h2>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">Features</h2>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-3xl font-bold text-green-600">${product.price}</span>
                      <span className="text-lg text-gray-500 line-through">${product.originalPrice}</span>
                    </div>
                    <p className="text-sm text-gray-600">One-time purchase</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={handleAddToCart}
                    >
                      Add to Cart
                    </Button>
                    <Link to="/checkout">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleBuyNow}
                      >
                        Buy Now
                      </Button>
                    </Link>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Shield className="h-4 w-4 mr-2 text-green-600" />
                      30-day money-back guarantee
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Download className="h-4 w-4 mr-2 text-blue-600" />
                      Instant download after purchase
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-purple-600" />
                      Lifetime updates included
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetails;
