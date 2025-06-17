
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, ArrowRight, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { capturePayPalOrder } from "@/services/paypalService";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clearCart, cartItems } = useCart();
  const [isProcessing, setIsProcessing] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [downloadLinks, setDownloadLinks] = useState<string[]>([]);
  const [emailSent, setEmailSent] = useState(false);

  const token = searchParams.get('token');
  const payerId = searchParams.get('PayerID');
  const sessionId = searchParams.get('session_id');

  const sendDownloadEmail = async (email: string, links: string[], orderData: any) => {
    try {
      const { error } = await supabase.functions.invoke('send-download-email', {
        body: {
          email,
          downloadLinks: links,
          orderDetails: orderData,
          items: cartItems
        }
      });

      if (error) {
        console.error('Error sending email:', error);
        toast({
          title: "Email Error",
          description: "Download links couldn't be emailed, but your purchase is complete.",
          variant: "destructive"
        });
      } else {
        setEmailSent(true);
        toast({
          title: "Email Sent",
          description: "Download links have been sent to your email!",
        });
      }
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  };

  const fetchDownloadLinks = async (orderItems: any[]) => {
    const links: string[] = [];
    
    for (const item of orderItems) {
      try {
        const { data: product, error } = await supabase
          .from('products')
          .select('download_url, title')
          .eq('id', item.product_id)
          .single();

        if (!error && product?.download_url) {
          links.push(product.download_url);
        }
      } catch (error) {
        console.error('Error fetching product download URL:', error);
      }
    }
    
    return links;
  };

  const verifyStripePayment = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-stripe-payment', {
        body: { sessionId }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Stripe verification error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const processPayment = async () => {
      try {
        let result;

        if (sessionId) {
          // Stripe payment
          console.log('Processing Stripe payment verification for session:', sessionId);
          result = await verifyStripePayment(sessionId);
        } else if (token && payerId) {
          // PayPal payment
          console.log('Processing PayPal payment capture for token:', token);
          result = await capturePayPalOrder(token);
        } else {
          throw new Error('Missing payment information');
        }

        if (result.success) {
          setOrderDetails(result.order);
          
          // Fetch order items to get download links
          const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', result.order.id);

          if (!itemsError && orderItems) {
            const links = await fetchDownloadLinks(orderItems);
            setDownloadLinks(links);

            // Get user email for sending download links
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email && links.length > 0) {
              await sendDownloadEmail(user.email, links, result.order);
            }
          }

          clearCart();
          toast({
            title: "Payment Successful",
            description: "Your order has been completed successfully!",
          });
        } else {
          throw new Error(result.error || 'Payment processing failed');
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        toast({
          title: "Payment Processing Failed",
          description: "There was an issue processing your payment. Please contact support.",
          variant: "destructive"
        });
        
        // Redirect to cart after a delay
        setTimeout(() => {
          navigate('/cart');
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [token, payerId, sessionId, navigate, toast, clearCart, cartItems]);

  const handleDownloadAll = () => {
    downloadLinks.forEach((link, index) => {
      setTimeout(() => {
        window.open(link, '_blank');
      }, index * 1000); // Delay each download by 1 second
    });
  };

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
                    <span className="text-gray-600 capitalize">{orderDetails.payment_method}</span>
                  </div>
                  {emailSent && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Email Status:</span>
                      <span className="text-green-600 flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        Download links sent
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {downloadLinks.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Your Download Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Your purchased products are ready for download. Click the links below or use the "Download All" button.
                  </p>
                  <div className="space-y-2">
                    {downloadLinks.map((link, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm text-gray-600">Product {index + 1}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(link, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleDownloadAll} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download All Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Access Your Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Your purchased products are also available in your profile for future downloads.
                </p>
                <Button 
                  onClick={() => navigate('/profile')}
                  className="w-full"
                >
                  Go to My Account
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
                  <li>• Download your products using the links above</li>
                  <li>• Check your email for download confirmation</li>
                  <li>• Access downloads anytime from your profile</li>
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
