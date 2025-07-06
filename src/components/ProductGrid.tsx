
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/services/productService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from '@/contexts/CartContext';
import { useToast } from "@/hooks/use-toast";
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  tags?: string[];
  category: string;
  seller_id?: string;
  download_url?: string;
  demo_url?: string;
  created_at?: string;
  is_active?: boolean;
}

interface ProductGridProps {
  products?: Product[];
  searchTerm?: string;
  gradientFrom?: string;
  gradientTo?: string;
  category?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products: propProducts, 
  searchTerm = '',
  category 
}) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Fetch products if not provided via props
  const { data: fetchedProducts, isLoading, error } = useQuery({
    queryKey: ['products', category],
    queryFn: () => fetchProducts(category),
    enabled: !propProducts, // Only fetch if products aren't provided
  });

  const products = propProducts || fetchedProducts || [];

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      product.title.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      (product.tags && product.tags.some(tag => 
        tag.toLowerCase().includes(searchLower)
      ))
    );
  });

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
      category: product.category
    });
    
    toast({
      title: "Added to Cart",
      description: `${product.title} has been added to your cart.`,
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
            <div className="bg-gray-200 rounded h-4 mb-2"></div>
            <div className="bg-gray-200 rounded h-4 w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Error loading products</h3>
        <p className="text-gray-500">Please try again later.</p>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No products found</h3>
        <p className="text-gray-500">Try adjusting your search or browse different categories.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProducts.map((product) => (
        <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="p-0">
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={product.image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop'}
                alt={product.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="capitalize">
                  {product.category.replace('-', ' ')}
                </Badge>
              </div>
              <Link 
                to={`/product/${product.id}`}
                className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                <Button variant="secondary" size="sm" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <CardTitle className="text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
              {product.title}
            </CardTitle>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
              {product.description}
            </p>
            
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {product.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {product.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{product.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600">
                ${product.price.toFixed(2)}
              </span>
              <Button 
                onClick={() => handleAddToCart(product)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductGrid;
