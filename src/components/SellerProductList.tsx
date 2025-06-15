
import { useQuery } from '@tanstack/react-query';
import { fetchProductsBySeller, Product } from '@/services/productService';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface SellerProductListProps {
  sellerId: string;
}

const SellerProductList = ({ sellerId }: SellerProductListProps) => {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['sellerProducts', sellerId],
    queryFn: () => fetchProductsBySeller(sellerId),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return <div>Error fetching products. Please try again later.</div>;
  }

  if (!products || products.length === 0) {
    return (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-2">No products yet!</h2>
            <p className="text-gray-600">Click "Add New Product" to get started.</p>
        </div>
    );
  }

  return (
    <div className="border rounded-lg">
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date Added</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {products.map((product: Product) => (
            <TableRow key={product.id}>
                <TableCell className="font-medium">{product.title}</TableCell>
                <TableCell className="capitalize">{product.category}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>
                <Badge variant={product.is_active ? 'default' : 'secondary'}>
                    {product.is_active ? 'Approved' : 'Pending Review'}
                </Badge>
                </TableCell>
                <TableCell>{new Date(product.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </div>
  );
};

export default SellerProductList;
