
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product } from "@/services/productService";
import { format } from "date-fns";
import { ExternalLink, Download } from "lucide-react";

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  sellerName?: string;
}

const ProductDetailsModal = ({ product, isOpen, onClose, sellerName }: ProductDetailsModalProps) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{product.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Image */}
          <div className="bg-gray-100 rounded-lg p-4">
            <img 
              src={product.image} 
              alt={product.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Category</h3>
              <Badge variant="secondary" className="capitalize">
                {product.category}
              </Badge>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Price</h3>
              <p className="text-2xl font-bold text-green-600">${product.price.toFixed(2)}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Status</h3>
              <Badge variant={product.is_active ? 'default' : 'secondary'}>
                {product.is_active ? 'Approved' : 'Pending Review'}
              </Badge>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Submitted By</h3>
              <p className="font-medium">{sellerName || 'Unknown Seller'}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description || 'No description provided.'}
            </p>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Download URL */}
          {product.download_url && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Download Link</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(product.download_url, '_blank')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                View Download Link
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 gap-2 text-sm text-gray-500 border-t pt-4">
            <div>
              <span className="font-medium">Submitted on:</span> {format(new Date(product.created_at), "PPP 'at' p")}
            </div>
            <div>
              <span className="font-medium">Product ID:</span> {product.id}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsModal;
