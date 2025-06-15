
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ProductDataTable from "@/components/ProductDataTable";
import ProductViewModal from "@/components/ProductViewModal";
import ProductEditModal from "@/components/ProductEditModal";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { fetchProductsBySeller, updateProductStatus } from "@/services/productService";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  title: string;
  price: number;
  sales: number;
  revenue: number;
  status: string;
  category: string;
  description: string;
  tags: string;
}

const NewSellerDashboard = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch products from database
  useEffect(() => {
    const loadProducts = async () => {
      if (!user?.id) return;
      
      try {
        setProductsLoading(true);
        const fetchedProducts = await fetchProductsBySeller(user.id);
        
        // Transform the data to match the expected format for the table
        const transformedProducts = fetchedProducts.map(product => ({
          id: parseInt(product.id),
          title: product.title,
          price: product.price,
          sales: 0, // Mock data for now as we don't have sales tracking yet
          revenue: 0, // Mock data for now
          status: product.is_active ? 'active' : 'pending',
          category: product.category,
          description: product.description,
          tags: Array.isArray(product.tags) ? product.tags.join(', ') : ''
        }));
        
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive"
        });
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, [user?.id, toast]);

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleSaveProduct = (updatedProduct: Product) => {
    // Update the product in the local state
    setProducts(prev => prev.map(p => 
      p.id === updatedProduct.id ? updatedProduct : p
    ));
    
    // Here you would typically make an API call to update the product in the database
    // For now, we'll just update the local state
    console.log('Product updated:', updatedProduct);
  };

  const handleToggleProductStatus = async (product: Product) => {
    try {
      const newStatus = product.status === 'active' ? false : true;
      const result = await updateProductStatus(product.id.toString(), newStatus);
      
      if (result.success) {
        // Update local state
        setProducts(prev => prev.map(p => 
          p.id === product.id 
            ? { ...p, status: newStatus ? 'active' : 'pending' }
            : p
        ));
        
        toast({
          title: "Success",
          description: `Product ${newStatus ? 'activated' : 'deactivated'} successfully`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update product status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Products</h1>
          <Link to="/product-upload">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
            </Button>
          </Link>
        </div>
        <div>
          {loading || productsLoading ? (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
          ) : user ? (
            <ProductDataTable
              products={products}
              onView={handleViewProduct}
              onEdit={handleEditProduct}
              onToggleStatus={handleToggleProductStatus}
            />
          ) : (
            <p>Please log in to see your dashboard.</p>
          )}
        </div>
      </main>
      <Footer />

      {/* Modals */}
      <ProductViewModal
        product={selectedProduct}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedProduct(null);
        }}
      />

      <ProductEditModal
        product={selectedProduct}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

export default NewSellerDashboard;
