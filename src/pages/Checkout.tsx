
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Building } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { createPayPalOrder } from "@/services/paypalService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const { user } = useAuth();
  const { cartItems, getTotalPrice } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    country: "",
    city: "",
    zipCode: ""
  });

  // Auto-populate form with user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      // Split the user's name into first and last name
      const nameParts = user.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData(prev => ({
        ...prev,
        email: user.email,
        firstName: firstName,
        lastName: lastName
      }));
    }
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add items before checkout.",
        variant: "destructive"
      });
      navigate('/cart');
    }
  }, [cartItems, navigate, toast]);

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to complete your purchase.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      if (paymentMethod === 'paypal') {
        const paymentData = {
          amount: total,
          currency: 'USD',
          description: `Purchase of ${cartItems.length} item(s)`
        };

        console.log("Creating PayPal order:", { formData, paymentMethod, total, cartItems });

        const result = await createPayPalOrder(paymentData, formData, cartItems);

        if (result.success && result.approvalUrl) {
          // Redirect to PayPal in the same tab instead of opening a new window
          window.location.href = result.approvalUrl;
        } else {
          throw new Error(result.error || 'PayPal order creation failed');
        }
      } else if (paymentMethod === 'bank') {
        // Use the original process-payment function for bank transfers
        const paymentData = {
          amount: total,
          currency: 'USD',
          description: `Purchase of ${cartItems.length} item(s)`
        };

        const { data, error } = await supabase.functions.invoke('process-payment', {
          body: {
            paymentMethod: 'bank',
            amount: paymentData.amount,
            currency: paymentData.currency,
            description: paymentData.description,
            billingInfo: formData,
            items: cartItems
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.success) {
          toast({
            title: "Order Created",
            description: data.instructions || "Bank transfer instructions have been sent to your email.",
          });

          setTimeout(() => {
            navigate('/profile');
          }, 3000);
        } else {
          throw new Error(data.error || 'Bank transfer setup failed');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An error occurred during payment processing.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-8">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Your cart is empty</h1>
            <Button onClick={() => navigate('/')}>Continue Shopping</Button>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Billing Address */}
                <Card>
                  <CardHeader>
                    <CardTitle>Billing Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={formData.country}
                          onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label htmlFor="paypal" className="flex items-center cursor-pointer">
                          <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                          PayPal (Credit Card & PayPal Balance)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="bank" id="bank" />
                        <Label htmlFor="bank" className="flex items-center cursor-pointer">
                          <Building className="h-5 w-5 mr-2 text-green-600" />
                          Bank Transfer
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-3"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : `Complete Purchase - $${total.toFixed(2)}`}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Badge variant="secondary" className="w-full justify-center">
                      🔒 Secure Checkout
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
