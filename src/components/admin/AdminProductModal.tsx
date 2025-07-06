
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";
import { format } from "date-fns";
import type { Product } from "@/services/productService";

interface AdminProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (productId: string, reason?: string) => void;
  onReject: (productId: string, reason: string) => void;
}

const AdminProductModal = ({ 
  product, 
  isOpen, 
  onClose, 
  onApprove, 
  onReject 
}: AdminProductModalProps) => {
  const [reason, setReason] = useState("");
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  if (!product) return null;

  const handleApprove = () => {
    onApprove(product.id, reason);
    setReason("");
    setAction(null);
    onClose();
  };

  const handleReject = () => {
    if (!reason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    onReject(product.id, reason);
    setReason("");
    setAction(null);
    onClose();
  };

  const handleClose = () => {
    setReason("");
    setAction(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Details - Admin Review</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Header */}
          <div className="flex items-start space-x-4">
            {product.image && (
              <img 
                src={product.image} 
                alt={product.title}
                className="w-32 h-32 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">{product.title}</h3>
              <div className="flex items-center space-x-4 mb-4">
                <Badge variant={product.is_active ? 'default' : 'destructive'}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <span className="text-2xl font-bold text-green-600">${product.price.toFixed(2)}</span>
              </div>
              <p className="text-gray-600">{product.description}</p>
            </div>
          </div>

          <Separator />

          {/* Product Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700">Basic Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Product ID</label>
                  <p className="font-mono text-sm">{product.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <p className="capitalize">{product.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Price</label>
                  <p className="text-lg font-bold text-green-600">${product.price.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created</label>
                  <p>{format(new Date(product.created_at), "PPpp")}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700">Seller Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Seller ID</label>
                  <p className="font-mono text-sm">{product.seller_id}</p>
                </div>
                {product.seller_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Seller Name</label>
                    <p>{product.seller_name}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <Badge variant={product.is_active ? 'default' : 'destructive'}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* URLs */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Product URLs</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Image URL</label>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="text-sm text-gray-600 break-all">
                    {product.image || 'Not provided'}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Download URL</label>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="text-sm text-gray-600 break-all">
                    {product.download_url || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Admin Actions */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Admin Actions</h4>
            
            {action && (
              <div className="space-y-3">
                <Label htmlFor="reason">
                  {action === 'approve' ? 'Approval Note (Optional)' : 'Rejection Reason (Required)'}
                </Label>
                <Textarea
                  id="reason"
                  placeholder={
                    action === 'approve' 
                      ? 'Optional note for approval...' 
                      : 'Please provide a reason for rejection...'
                  }
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {!action && (
              <div className="flex space-x-3">
                {!product.is_active && (
                  <Button
                    onClick={() => setAction('approve')}
                    variant="default"
                    className="flex items-center space-x-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>Approve Product</span>
                  </Button>
                )}
                
                <Button
                  onClick={() => setAction('reject')}
                  variant="destructive"
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>{product.is_active ? 'Deactivate Product' : 'Reject Product'}</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          {action ? (
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setAction(null)}>
                Cancel
              </Button>
              {action === 'approve' ? (
                <Button onClick={handleApprove} variant="default">
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Approval
                </Button>
              ) : (
                <Button onClick={handleReject} variant="destructive">
                  <X className="h-4 w-4 mr-2" />
                  Confirm Rejection
                </Button>
              )}
            </div>
          ) : (
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminProductModal;
