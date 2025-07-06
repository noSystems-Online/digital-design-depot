
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { fetchAllProductsForAdmin } from "@/services/productService";
import type { Product } from "@/services/productService";
import ResponsiveProductTable from "@/components/ResponsiveProductTable";
import AdminProductModal from "./AdminProductModal";

const ProductManagementTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch products with seller information
  const { data: products, isLoading } = useQuery({
    queryKey: ['allProducts', 'admin'],
    queryFn: async () => {
      const products = await fetchAllProductsForAdmin();
      
      // Fetch seller information for each product
      const productsWithSellers = await Promise.all(
        products.map(async (product) => {
          try {
            const { data: seller, error } = await supabase
              .from('profiles')
              .select('first_name, last_name, email')
              .eq('id', product.seller_id)
              .single();

            if (error) {
              console.error('Error fetching seller:', error);
              return product;
            }

            const sellerName = seller.first_name && seller.last_name 
              ? `${seller.first_name} ${seller.last_name}`
              : seller.email;

            return {
              ...product,
              seller_name: sellerName
            };
          } catch (error) {
            console.error('Error fetching seller for product:', product.id, error);
            return product;
          }
        })
      );

      return productsWithSellers;
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, isActive, reason }: { productId: string; isActive: boolean; reason?: string }) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .eq('id', productId);
      
      if (error) throw error;

      // TODO: In a real application, you might want to store the reason in a separate table
      // For now, we'll just log it
      if (reason) {
        console.log(`Product ${productId} ${isActive ? 'approved' : 'rejected'} with reason:`, reason);
      }
    },
    onSuccess: (_, { isActive }) => {
      toast({
        title: "Success",
        description: `Product ${isActive ? 'approved' : 'rejected'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['allProducts'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update product: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleApproveProduct = (productId: string, reason?: string) => {
    updateProductMutation.mutate({ productId, isActive: true, reason });
  };

  const handleRejectProduct = (productId: string, reason: string) => {
    updateProductMutation.mutate({ productId, isActive: false, reason });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Management</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveProductTable
            products={products || []}
            onView={handleViewProduct}
            onApprove={handleApproveProduct}
            onReject={(productId) => handleRejectProduct(productId, "Rejected by admin")}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <AdminProductModal
        product={selectedProduct}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedProduct(null);
        }}
        onApprove={handleApproveProduct}
        onReject={handleRejectProduct}
      />
    </div>
  );
};

export default ProductManagementTab;
