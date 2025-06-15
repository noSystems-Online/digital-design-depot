import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Product, fetchProducts } from "@/services/productService";

interface ProductGridProps {
  searchTerm: string;
  gradientFrom: string;
  gradientTo: string;
  itemsPerPage?: number | string;
  category?: string;
}

const ProductGrid = ({ searchTerm, gradientFrom, gradientTo, itemsPerPage = 8, category }: ProductGridProps) => {
  // Ensure itemsPerPage is always a number
  const itemsPerPageNumber = typeof itemsPerPage === 'string' ? parseInt(itemsPerPage, 10) || 8 : Number(itemsPerPage) || 8;
  const [displayCount, setDisplayCount] = useState<number>(itemsPerPageNumber);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const fetchedProducts = await fetchProducts(category);
      setProducts(fetchedProducts);
      setLoading(false);
    };

    loadProducts();
  }, [category]);

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  const displayedProducts = filteredProducts.slice(0, displayCount);
  const hasMore = displayCount < filteredProducts.length;

  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + itemsPerPageNumber, filteredProducts.length));
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      category: product.category
    });
    
    toast({
      title: "Added to cart!",
      description: `${product.title} has been added to your cart.`,
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedProducts.map((product) => (
          <Card key={product.id} className="group hover:shadow-xl transition-all duration-300">
            <CardHeader className="p-0">
              <Link to={`/product/${product.id}`}>
                <div className={`h-48 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-t-lg flex items-center justify-center cursor-pointer`}>
                  <img src={product.image} alt={product.title} className="w-full h-full object-cover rounded-t-lg" />
                </div>
              </Link>
            </CardHeader>
            <CardContent className="p-6">
              <Link to={`/product/${product.id}`}>
                <CardTitle className="text-lg mb-2 group-hover:text-blue-600 transition-colors cursor-pointer">
                  {product.title}
                </CardTitle>
              </Link>
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
                <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {hasMore && (
        <div className="text-center mt-8">
          <Button onClick={loadMore} variant="outline" size="lg">
            Load More Products ({filteredProducts.length - displayCount} remaining)
          </Button>
        </div>
      )}
      
      {filteredProducts.length === 0 && searchTerm && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found matching "{searchTerm}"</p>
        </div>
      )}
    </>
  );
};

export default ProductGrid;
