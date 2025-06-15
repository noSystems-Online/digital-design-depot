
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllProductsForAdmin, updateProductStatus, deleteProduct, Product } from "@/services/productService";
import { fetchSellerById } from "@/services/sellerService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PayPalConfigManager from "@/components/PayPalConfigManager";
import ProductDetailsModal from "@/components/ProductDetailsModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Eye } from "lucide-react";

type SortField = 'title' | 'category' | 'price' | 'created_at' | 'is_active' | 'seller_id';
type SortDirection = 'asc' | 'desc';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['allAdminProducts'],
    queryFn: fetchAllProductsForAdmin,
  });

  const { data: sellers } = useQuery({
    queryKey: ['sellers'],
    queryFn: async () => {
      if (!products) return {};
      const sellerIds = [...new Set(products.map(p => p.seller_id))];
      const sellerPromises = sellerIds.map(id => fetchSellerById(id));
      const sellerResults = await Promise.all(sellerPromises);
      return sellerResults.reduce((acc, seller, index) => {
        if (seller) {
          acc[sellerIds[index]] = seller;
        }
        return acc;
      }, {} as Record<string, any>);
    },
    enabled: !!products,
  });

  const approveMutation = useMutation({
    mutationFn: (productId: string) => updateProductStatus(productId, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAdminProducts'] });
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

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAdminProducts'] });
      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const sortedProducts = useMemo(() => {
    if (!products) return [];
    
    return [...products].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      if (sortField === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortField === 'price') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (sortField === 'is_active') {
        aValue = aValue ? 1 : 0;
        bValue = bValue ? 1 : 0;
      } else if (sortField === 'seller_id') {
        aValue = sellers?.[aValue]?.businessName || '';
        bValue = sellers?.[bValue]?.businessName || '';
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [products, sortField, sortDirection, sellers]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil((sortedProducts?.length || 0) / itemsPerPage);

  const handleApprove = (productId: string) => {
    approveMutation.mutate(productId);
  };

  const handleDelete = (productId: string) => {
    deleteMutation.mutate(productId);
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:bg-muted/50 p-1 rounded transition-colors"
    >
      <span>{children}</span>
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
      )}
    </button>
  );

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => setCurrentPage(1)}
            isActive={false}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(<PaginationItem key="ellipsis1"><PaginationEllipsis /></PaginationItem>);
      }
    }

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <PaginationItem key={page}>
          <PaginationLink
            onClick={() => setCurrentPage(page)}
            isActive={currentPage === page}
            className="cursor-pointer"
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<PaginationItem key="ellipsis2"><PaginationEllipsis /></PaginationItem>);
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => setCurrentPage(totalPages)}
            isActive={false}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  if (error) {
    return <div>Error loading products: {error.message}</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Product Management</TabsTrigger>
            <TabsTrigger value="paypal">PayPal Configuration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : products && products.length > 0 ? (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <SortButton field="title">Product</SortButton>
                        </TableHead>
                        <TableHead>
                          <SortButton field="category">Category</SortButton>
                        </TableHead>
                        <TableHead>
                          <SortButton field="price">Price</SortButton>
                        </TableHead>
                        <TableHead>
                          <SortButton field="is_active">Status</SortButton>
                        </TableHead>
                        <TableHead>
                          <SortButton field="seller_id">Submitted By</SortButton>
                        </TableHead>
                        <TableHead>
                          <SortButton field="created_at">Submitted On</SortButton>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.title}</TableCell>
                          <TableCell className="capitalize">{product.category}</TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={product.is_active ? 'default' : 'secondary'}>
                              {product.is_active ? 'Approved' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {sellers?.[product.seller_id]?.businessName || 'Loading...'}
                          </TableCell>
                          <TableCell>{format(new Date(product.created_at), "PPP")}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(product)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(product.id)}
                              disabled={approveMutation.isPending || product.is_active}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(product.id)}
                              disabled={deleteMutation.isPending}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        
                        {renderPaginationItems()}
                        
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-100 p-8 rounded-lg text-center">
                <h2 className="text-xl font-semibold mb-2">No products found</h2>
                <p className="text-gray-600">No products have been submitted yet.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="paypal">
            <PayPalConfigManager />
          </TabsContent>
        </Tabs>

        <ProductDetailsModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          sellerName={selectedProduct ? sellers?.[selectedProduct.seller_id]?.businessName : undefined}
        />
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
