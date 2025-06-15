
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPendingProducts, updateProductStatus, deleteProduct, Product } from "@/services/productService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['pendingProducts'],
    queryFn: fetchPendingProducts,
  });

  const approveMutation = useMutation({
    mutationFn: (productId: string) => updateProductStatus(productId, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingProducts'] });
      toast({
        title: "Success",
        description: "Product approved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to approve product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingProducts'] });
      toast({
        title: "Success",
        description: "Product rejected and deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to reject product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleApprove = (productId: string) => {
    approveMutation.mutate(productId);
  };

  const handleReject = (productId: string) => {
    rejectMutation.mutate(productId);
  };

  if (error) {
    return <div>Error loading pending products: {error.message}</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard - Pending Products</h1>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : products && products.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(product.created_at), "PPP")}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprove(product.id)}
                        disabled={approveMutation.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(product.id)}
                        disabled={rejectMutation.isPending}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-2">No pending products</h2>
            <p className="text-gray-600">There are no products awaiting approval at the moment.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
