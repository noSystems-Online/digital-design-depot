import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, DollarSign, Package, TrendingUp, Upload, FileText, CheckCircle, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import ProductDataTable from "@/components/ProductDataTable";
import { useAuth } from "@/contexts/AuthContext";
import { fetchProductsBySeller, updateProductStatus, createProduct } from "@/services/productService";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

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

const SellerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock seller data - you can replace this with real data later
  const sellerStats = {
    totalRevenue: products.reduce((sum, p) => sum + p.revenue, 0),
    totalProducts: products.length,
    totalSales: products.reduce((sum, p) => sum + p.sales, 0),
    monthlyGrowth: 23
  };

  const recentSales = [
    { id: 1, product: "React Dashboard Template", buyer: "john.doe@email.com", amount: 49, date: "2024-01-15" },
    { id: 2, product: "Node.js API Starter", buyer: "jane.smith@email.com", amount: 29, date: "2024-01-14" },
    { id: 3, product: "Vue Components Pack", buyer: "mike.wilson@email.com", amount: 35, date: "2024-01-13" }
  ];

  // Fetch products from database
  useEffect(() => {
    const loadProducts = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const fetchedProducts = await fetchProductsBySeller(user.id);
        
        // Transform the data to match the expected format for the table
        const transformedProducts = fetchedProducts.map(product => ({
          id: parseInt(product.id),
          title: product.title,
          price: product.price,
          sales: 0, // Mock data for now as we don't have sales tracking yet
          revenue: 0, // Mock data for now
          status: product.is_active ? 'active' : 'pending',
          category: product.category,
          description: product.description,
          tags: Array.isArray(product.tags) ? product.tags.join(', ') : ''
        }));
        
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [user?.id, toast]);

  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    image_url: "",
    download_url: ""
  });
  const [editProduct, setEditProduct] = useState({
    id: 0,
    title: "",
    description: "",
    price: "",
    category: "",
    tags: "",
    files: null as File[] | null
  });
  const [viewProduct, setViewProduct] = useState(null as any);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ variant: "destructive", title: "You must be logged in to create a product." });
      return;
    }

    const productData = {
      title: newProduct.title,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      category: newProduct.category as 'software' | 'templates' | 'code-scripts' | 'resources',
      image_url: newProduct.image_url || undefined,
      download_url: newProduct.download_url || undefined,
      seller_id: user.id,
    };

    console.log("New product submitted:", productData);
    
    const result = await createProduct(productData);
    
    if (result.success) {
      toast({
        title: "Product Submitted",
        description: "Your product has been submitted for review",
      });
      // Refetch products to update the list immediately
      const fetchedProducts = await fetchProductsBySeller(user.id);
      const transformedProducts = fetchedProducts.map(product => ({
        id: parseInt(product.id),
        title: product.title,
        price: product.price,
        sales: 0,
        revenue: 0,
        status: product.is_active ? 'active' : 'pending',
        category: product.category,
        description: product.description,
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : ''
      }));
      setProducts(transformedProducts);
      setIsAddDialogOpen(false);
      setNewProduct({
        title: "",
        description: "",
        price: "",
        category: "",
        image_url: "",
        download_url: ""
      });
    } else {
      console.error("Product submission failed:", result.error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error submitting your product. Please try again.",
      });
    }
  };

  const handleEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Product updated:", editProduct);
    setIsEditDialogOpen(false);
    setEditProduct({
      id: 0,
      title: "",
      description: "",
      price: "",
      category: "",
      tags: "",
      files: null
    });
  };

  const openViewDialog = (product: any) => {
    setViewProduct(product);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (product: any) => {
    setEditProduct({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category.toLowerCase(),
      tags: product.tags,
      files: null
    });
    setIsEditDialogOpen(true);
  };

  const handleToggleProductStatus = async (product: any) => {
    try {
      const newStatus = product.status === 'active' ? false : true;
      const result = await updateProductStatus(product.id.toString(), newStatus);
      
      if (result.success) {
        // Update local state
        setProducts(prev => prev.map(p => 
          p.id === product.id 
            ? { ...p, status: newStatus ? 'active' : 'pending' }
            : p
        ));
        
        toast({
          title: "Success",
          description: `Product ${newStatus ? 'activated' : 'deactivated'} successfully`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update product status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your dashboard...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
              <p className="text-gray-600">Manage your products and track your sales</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitProduct} className="space-y-6">
                  <div>
                    <Label htmlFor="title">Product Title *</Label>
                    <Input
                      id="title"
                      value={newProduct.title}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., React Dashboard Template"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your product, its features, and what makes it special..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price (USD) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="29.99"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={newProduct.category} onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="software">Software Applications</SelectItem>
                          <SelectItem value="templates">Website Templates</SelectItem>
                          <SelectItem value="code-scripts">Code Scripts</SelectItem>
                          <SelectItem value="resources">Design Resources</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="image_url">Image URL *</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={newProduct.image_url}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="https://example.com/product-image.png"
                      required
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      URL to the main product image/screenshot
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="download_url">Download URL *</Label>
                    <Input
                      id="download_url"
                      type="url"
                      value={newProduct.download_url}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, download_url: e.target.value }))}
                      placeholder="https://example.com/download/product.zip"
                      required
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Direct download link to your product files
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Selling Process:</h4>
                    <ol className="text-sm text-blue-800 space-y-1">
                      <li>1. Submit your product for review</li>
                      <li>2. Our team reviews within 24-48 hours</li>
                      <li>3. Once approved, your product goes live</li>
                      <li>4. Customers can purchase and download</li>
                      <li>5. You earn 95% of each sale (5% platform fee)</li>
                    </ol>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1">
                      <Upload className="h-4 w-4 mr-2" />
                      Submit for Review
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* View Product Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Product Details</DialogTitle>
              </DialogHeader>
              {viewProduct && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Product Title</Label>
                      <p className="text-lg font-semibold">{viewProduct.title}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Price</Label>
                      <p className="text-lg font-semibold text-green-600">${viewProduct.price}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Category</Label>
                      <p>{viewProduct.category}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <Badge variant={viewProduct.status === 'active' ? 'default' : 'secondary'}>
                        {viewProduct.status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Description</Label>
                    <p className="text-gray-800 leading-relaxed">{viewProduct.description}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Tags</Label>
                    <p className="text-gray-600">{viewProduct.tags}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Sales</p>
                      <p className="text-2xl font-bold text-blue-600">{viewProduct.sales}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="text-2xl font-bold text-green-600">${viewProduct.revenue}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Your Earnings</p>
                      <p className="text-2xl font-bold text-purple-600">${(viewProduct.revenue * 0.95).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Product Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditProduct} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-title">Product Title *</Label>
                    <Input
                      id="edit-title"
                      value={editProduct.title}
                      onChange={(e) => setEditProduct(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., React Dashboard Template"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-price">Price (USD) *</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      value={editProduct.price}
                      onChange={(e) => setEditProduct(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="29"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-category">Category *</Label>
                  <Select value={editProduct.category} onValueChange={(value) => setEditProduct(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="software">Software Applications</SelectItem>
                      <SelectItem value="templates">Website Templates</SelectItem>
                      <SelectItem value="scripts">Code Scripts</SelectItem>
                      <SelectItem value="resources">Design Resources</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-description">Product Description *</Label>
                  <Textarea
                    id="edit-description"
                    value={editProduct.description}
                    onChange={(e) => setEditProduct(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your product, its features, and what makes it special..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                  <Input
                    id="edit-tags"
                    value={editProduct.tags}
                    onChange={(e) => setEditProduct(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="react, dashboard, admin, template"
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Update Product
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Process Overview */}
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
            <CardHeader>
              <CardTitle className="text-center text-xl text-green-800 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                How to Sell on CodeMarket
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-2">1</div>
                  <p className="text-sm font-medium">Create Product</p>
                  <p className="text-xs text-gray-600">Add details & upload files</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-2">2</div>
                  <p className="text-sm font-medium">Review Process</p>
                  <p className="text-xs text-gray-600">24-48 hour review</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-2">3</div>
                  <p className="text-sm font-medium">Go Live</p>
                  <p className="text-xs text-gray-600">Product listed for sale</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-2">4</div>
                  <p className="text-sm font-medium">Earn Sales</p>
                  <p className="text-xs text-gray-600">Customers purchase</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mb-2">5</div>
                  <p className="text-sm font-medium">Get Paid</p>
                  <p className="text-xs text-gray-600">95% of sale price</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${sellerStats.totalRevenue}</div>
                <p className="text-xs text-gray-600 mt-1">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{sellerStats.totalProducts}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {products.filter(p => p.status === 'pending').length} pending review
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Total Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{sellerStats.totalSales}</div>
                <p className="text-xs text-gray-600 mt-1">18 this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{sellerStats.monthlyGrowth}%</div>
                <p className="text-xs text-gray-600 mt-1">vs last month</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="products">My Products</TabsTrigger>
              <TabsTrigger value="sales">Recent Sales</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle>Your Products</CardTitle>
                  <p className="text-sm text-gray-600">Manage your listed products and track their performance</p>
                </CardHeader>
                <CardContent>
                  <ProductDataTable
                    products={products}
                    onView={openViewDialog}
                    onEdit={openEditDialog}
                    onToggleStatus={handleToggleProductStatus}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sales">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <p className="text-sm text-gray-600">Track your recent transactions and customer purchases</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentSales.map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{sale.product}</h4>
                          <p className="text-sm text-gray-600">Sold to {sale.buyer}</p>
                          <p className="text-xs text-gray-500">{sale.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">${sale.amount}</p>
                          <p className="text-xs text-gray-500">You earned: ${(sale.amount * 0.95).toFixed(2)}</p>
                          <Badge variant="secondary">Completed</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {products.sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((product, index) => (
                        <div key={product.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                            <span className="font-medium">{product.title}</span>
                          </div>
                          <span className="font-medium text-green-600">${product.revenue}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Earnings Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Gross Sales</span>
                        <span className="font-medium">${sellerStats.totalRevenue}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Platform Fee (5%)</span>
                        <span className="font-medium text-red-600">-${(sellerStats.totalRevenue * 0.05).toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center font-bold">
                          <span>Your Earnings (95%)</span>
                          <span className="text-green-600">${(sellerStats.totalRevenue * 0.95).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SellerDashboard;
