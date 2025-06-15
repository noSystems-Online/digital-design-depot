
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { capturePayPalOrder } from "@/services/paypalService";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const token = searchParams.get('token');
  const payerId = searchParams.get('PayerID');

  useEffect(() => {
    const processPayment = async () => {
      if (!token || !payerId) {
        toast({
          title: "Invalid Payment",
          description: "Missing payment information",
          variant: "destructive"
        });
        navigate('/cart');
        return;
      }

      try {
        const result = await capturePayPalOrder(token);
        
        if (result.success) {
          setOrderDetails(result.order);
          clearCart();
          toast({
            title: "Payment Successful",
            description: "Your order has been completed successfully!",
          });
        } else {
          throw new Error(result.error || 'Payment capture failed');
        }
      } catch (error) {
        console.error('Payment capture error:', error);
        toast({
          title: "Payment Processing Failed",
          description: "There was an issue processing your payment. Please contact support.",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [token, payerId, navigate, toast, clearCart]);

  if (isProcessing) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-8">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-8"></div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Processing Your Payment</h1>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
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
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-xl text-gray-600">Thank you for your purchase</p>
          </div>

          {orderDetails && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Order ID:</span>
                    <span className="text-gray-600">{orderDetails.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${orderDetails.total_amount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Payment Method:</span>
                    <span className="text-gray-600">PayPal</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Download Your Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Your purchased products are now available for download in your profile.
                </p>
                <Button 
                  onClick={() => navigate('/profile')}
                  className="w-full"
                >
                  Go to Downloads
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Check your email for order confirmation</li>
                  <li>• Download your products from your profile</li>
                  <li>• Contact support if you need help</li>
                  <li>• Browse more products</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="mr-4"
            >
              Continue Shopping
            </Button>
            <Button onClick={() => navigate('/profile')}>
              View My Account
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
