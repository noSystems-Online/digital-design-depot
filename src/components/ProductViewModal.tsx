
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  sales: number;
  revenue: number;
  status: string;
  category: string;
  description: string;
  tags: string;
  demo_url?: string;
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Basic Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Product ID</label>
                  <p>#{product.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <p className="capitalize">{product.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Price</label>
                  <p className="text-lg font-bold text-green-600">${product.price}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Performance</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Sales</label>
                  <p>{product.sales}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Revenue</label>
                  <p className="text-lg font-bold text-green-600">${product.revenue}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                    {product.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
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

          <Separator />

          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Product URLs</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Image URL</label>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="text-sm text-gray-600 break-all">Not available in current data</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Demo URL</label>
                <div className="p-3 bg-gray-50 rounded border">
                  {product.demo_url ? (
                    <a href={product.demo_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                      {product.demo_url}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-500">No demo URL provided</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Download URL</label>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="text-sm text-gray-600 break-all">Not available in current data</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              URL fields are not currently stored in the dashboard data structure. Consider updating the data model to include these fields.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductViewModal;
