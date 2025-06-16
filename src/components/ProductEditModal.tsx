
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
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

interface ProductEditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

const ProductEditModal = ({ product, isOpen, onClose, onSave }: ProductEditModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    category: "",
    tags: "",
    image_url: "",
    demo_url: "",
    download_url: ""
  });

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        tags: product.tags,
        image_url: "", // Not available in current data structure
        demo_url: "", // Not available in current data structure
        download_url: "" // Not available in current data structure
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const updatedProduct = {
      ...product,
      title: formData.title,
      description: formData.description,
      price: formData.price,
      category: formData.category,
      tags: formData.tags
    };

    onSave(updatedProduct);
    toast({
      title: "Success",
      description: "Product updated successfully",
    });
    onClose();
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Ultimate React Boilerplate"
                  required
                />
              </div>

              <div>
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="e.g., 49.99"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="templates">Templates</SelectItem>
                  <SelectItem value="code-scripts">Code Scripts</SelectItem>
                  <SelectItem value="resources">Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your product in detail..."
                rows={4}
                required
              />
            </div>

            <div className="mt-4">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="e.g., react, tailwind, typescript"
              />
              <p className="text-sm text-gray-600 mt-1">Comma-separated tags to help users find your product.</p>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-gray-700 mb-4">Product URLs</h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://example.com/image.png"
                />
                <p className="text-sm text-gray-600 mt-1">The main display image for your product.</p>
              </div>

              <div>
                <Label htmlFor="demo_url">Demo URL</Label>
                <Input
                  id="demo_url"
                  type="url"
                  value={formData.demo_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, demo_url: e.target.value }))}
                  placeholder="https://example.com/demo"
                />
                <p className="text-sm text-gray-600 mt-1">The link where customers can preview or demo your product.</p>
              </div>

              <div>
                <Label htmlFor="download_url">Download URL</Label>
                <Input
                  id="download_url"
                  type="url"
                  value={formData.download_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, download_url: e.target.value }))}
                  placeholder="https://example.com/product.zip"
                />
                <p className="text-sm text-gray-600 mt-1">The link to the file customers will download after purchase.</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> URL fields are not currently saved in the database structure. 
                Consider updating the product data model to include image_url, demo_url, and download_url fields.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditModal;
