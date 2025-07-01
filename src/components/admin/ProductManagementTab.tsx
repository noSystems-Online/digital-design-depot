
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { fetchAllProductsForAdmin } from "@/services/productService";
import type { Product } from "@/services/productService";
import ResponsiveProductTable from "@/components/ResponsiveProductTable";

const ProductManagementTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['allProducts', 'admin'],
    queryFn: fetchAllProductsForAdmin
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, isActive }: { productId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .eq('id', productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product status updated successfully",
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

  const handleApproveProduct = (productId: string) => {
    updateProductMutation.mutate({ productId, isActive: true });
  };

  const handleRejectProduct = (productId: string) => {
    updateProductMutation.mutate({ productId, isActive: false });
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
            onReject={handleRejectProduct}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.title}
                    className="w-full h-48 object-cover rounded"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">{selectedProduct.title}</h3>
                  <p className="text-sm text-gray-600">{selectedProduct.description}</p>
                  <div className="space-y-1">
                    <p><strong>Price:</strong> ${selectedProduct.price.toFixed(2)}</p>
                    <p><strong>Category:</strong> {selectedProduct.category}</p>
                    <p><strong>Status:</strong> {selectedProduct.is_active ? "Active" : "Inactive"}</p>
                    <p><strong>Seller ID:</strong> {selectedProduct.seller_id}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagementTab;
