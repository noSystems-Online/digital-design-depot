
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CheckoutCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <XCircle className="h-24 w-24 text-red-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
            <p className="text-xl text-gray-600">Your payment was not processed</p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What Happened?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Your payment was cancelled and no charges were made to your account. 
                Your items are still in your cart if you'd like to try again.
              </p>
              <div className="space-y-2 text-gray-600">
                <p>• No payment was processed</p>
                <p>• Your cart items are still saved</p>
                <p>• You can try a different payment method</p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/cart')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
            <Button onClick={() => navigate('/')}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutCancel;
