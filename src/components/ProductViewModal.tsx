
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

interface ProductViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductViewModal = ({ product, isOpen, onClose }: ProductViewModalProps) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">{product.title}</h3>
            <div className="flex items-center space-x-4">
              <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                {product.status}
              </Badge>
              <span className="text-2xl font-bold text-green-600">${product.price}</span>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-700">Category</h4>
              <p className="capitalize">{product.category}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">Product ID</h4>
              <p>#{product.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-700">Sales</h4>
              <p>{product.sales}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">Revenue</h4>
              <p>${product.revenue}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
            <p className="text-gray-600 leading-relaxed">
              {product.description || 'No description available'}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {product.tags ? (
                product.tags.split(',').map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag.trim()}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-500">No tags</span>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductViewModal;
