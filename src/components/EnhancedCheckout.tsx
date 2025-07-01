
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Upload, CreditCard, Building, Smartphone } from "lucide-react";

interface PaymentGateway {
  id: string;
  name: string;
  type: 'online' | 'otc';
  is_active: boolean;
  config: any;
  fees: {
    fixed: number;
    percentage: number;
  };
}

interface EnhancedCheckoutProps {
  onPaymentComplete?: (orderId: string) => void;
}

const EnhancedCheckout = ({ onPaymentComplete }: EnhancedCheckoutProps) => {
  const { user } = useAuth();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [selectedGateway, setSelectedGateway] = useState<string>("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [calculatedFees, setCalculatedFees] = useState({
    gatewayFee: 0,
    platformFee: 0,
    sellerAmount: 0
  });

  const { data: paymentGateways } = useQuery({
    queryKey: ['paymentGateways'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as PaymentGateway[];
    }
  });

  const subtotal = getTotalPrice();

  // Calculate fees when gateway changes
  useEffect(() => {
    if (selectedGateway && paymentGateways) {
      const gateway = paymentGateways.find(g => g.id === selectedGateway);
      if (gateway) {
        const gatewayFee = gateway.fees.fixed + (subtotal * gateway.fees.percentage / 100);
        const platformFee = subtotal * 0.1; // 10% platform fee
        const sellerAmount = subtotal - gatewayFee - platformFee;
        
        setCalculatedFees({
          gatewayFee,
          platformFee,
          sellerAmount
        });
      }
    }
  }, [selectedGateway, subtotal, paymentGateways]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedGateway) return;

    setIsProcessing(true);

    try {
      const gateway = paymentGateways?.find(g => g.id === selectedGateway);
      if (!gateway) throw new Error('Invalid payment gateway');

      // Create order with enhanced tracking
      const orderData = {
        buyer_id: user.id,
        total_amount: subtotal,
        payment_gateway_id: selectedGateway,
        payment_method: gateway.name.toLowerCase(),
        gateway_fees: calculatedFees.gatewayFee,
        platform_fees: calculatedFees.platformFee,
        seller_amount: calculatedFees.sellerAmount,
        status: gateway.type === 'otc' ? 'pending' : 'completed',
        verification_status: gateway.type === 'otc' ? 'pending' : 'verified'
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Handle different payment types
      if (gateway.type === 'online') {
        // For online payments, redirect to payment processor
        if (gateway.name === 'PayPal') {
          // Use existing PayPal service
          const { createPayPalOrder } = await import('@/services/paypalService');
          const result = await createPayPalOrder(
            { amount: subtotal, currency: 'USD', description: `Order ${order.id}` },
            { email: user.email, firstName: '', lastName: '', country: '', city: '', zipCode: '' },
            cartItems
          );
          
          if (result.success && result.approvalUrl) {
            window.location.href = result.approvalUrl;
            return;
          }
        }
      } else {
        // For OTC payments, show instructions
        toast({
          title: "Order Created",
          description: `Please complete payment using ${gateway.name} and upload proof of payment.`,
        });
      }

      clearCart();
      onPaymentComplete?.(order.id);
      
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getGatewayIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'paypal': return <CreditCard className="h-5 w-5" />;
      case 'gcash': return <Smartphone className="h-5 w-5" />;
      case 'bank transfer': return <Building className="h-5 w-5" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };

  if (!paymentGateways?.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>No payment methods available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enhanced Payment Options</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePaymentSubmit} className="space-y-6">
          <div>
            <Label className="text-base font-medium">Select Payment Method</Label>
            <RadioGroup value={selectedGateway} onValueChange={setSelectedGateway} className="mt-3">
              {paymentGateways.map((gateway) => (
                <div key={gateway.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value={gateway.id} id={gateway.id} />
                  <Label htmlFor={gateway.id} className="flex items-center cursor-pointer flex-1">
                    {getGatewayIcon(gateway.name)}
                    <span className="ml-3 font-medium">{gateway.name}</span>
                    <Badge variant={gateway.type === 'online' ? 'default' : 'secondary'} className="ml-auto">
                      {gateway.type === 'online' ? 'Instant' : 'Manual Verification'}
                    </Badge>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {selectedGateway && (
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Fee Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gateway Fee:</span>
                    <span>${calculatedFees.gatewayFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee:</span>
                    <span>${calculatedFees.platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>You Pay:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Seller Receives:</span>
                    <span>${calculatedFees.sellerAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedGateway && paymentGateways?.find(g => g.id === selectedGateway)?.type === 'otc' && (
            <div>
              <Label htmlFor="paymentProof">Upload Payment Proof (Optional)</Label>
              <Input
                id="paymentProof"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                className="mt-2"
              />
              <p className="text-sm text-gray-600 mt-1">
                You can upload proof now or later from your order history
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={!selectedGateway || isProcessing}
          >
            {isProcessing ? "Processing..." : `Complete Payment - $${subtotal.toFixed(2)}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EnhancedCheckout;
