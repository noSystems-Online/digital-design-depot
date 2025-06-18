
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import AdminRoute from "@/components/AdminRoute";
import SellerRoute from "@/components/SellerRoute";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCancel from "./pages/CheckoutCancel";
import AdminDashboard from "./pages/AdminDashboard";
import SellerRegistration from "./pages/SellerRegistration";
import SellerDashboard from "./pages/SellerDashboard";
import NewSellerDashboard from "./pages/NewSellerDashboard";
import ProductUpload from "./pages/ProductUpload";
import Templates from "./pages/Templates";
import Software from "./pages/Software";
import CodeScripts from "./pages/CodeScripts";
import Resources from "./pages/Resources";
import NotFound from "./pages/NotFound";

// New support pages
import HelpCenter from "./pages/HelpCenter";
import ContactUs from "./pages/ContactUs";
import Documentation from "./pages/Documentation";
import FAQ from "./pages/FAQ";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route path="/checkout/cancel" element={<CheckoutCancel />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/software" element={<Software />} />
                <Route path="/code-scripts" element={<CodeScripts />} />
                <Route path="/resources" element={<Resources />} />
                
                {/* Support Pages */}
                <Route path="/help-center" element={<HelpCenter />} />
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/documentation" element={<Documentation />} />
                <Route path="/faq" element={<FAQ />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                
                {/* Seller Routes */}
                <Route path="/seller/register" element={<SellerRegistration />} />
                <Route path="/seller/dashboard" element={
                  <SellerRoute>
                    <SellerDashboard />
                  </SellerRoute>
                } />
                <Route path="/seller/new-dashboard" element={
                  <SellerRoute>
                    <NewSellerDashboard />
                  </SellerRoute>
                } />
                <Route path="/seller/upload" element={
                  <SellerRoute>
                    <ProductUpload />
                  </SellerRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
