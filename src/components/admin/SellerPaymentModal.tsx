
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface SellerPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  sellerId: string;
  amount: number;
  sellerName: string;
}

const SellerPaymentModal = ({ isOpen, onClose, orderId, sellerId, amount, sellerName }: SellerPaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const paymentMutation = useMutation({
    mutationFn: async () => {
      // Create seller payment record
      const { error: paymentError } = await supabase
        .from('seller_payments')
        .insert({
          order_id: orderId,
          seller_id: sellerId,
          amount: amount,
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          status: 'completed',
          notes: notes
        });

      if (paymentError) throw paymentError;

      // Update order seller payment status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ seller_payment_status: 'paid' })
        .eq('id', orderId);

      if (orderError) throw orderError;
    },
    onSuccess: () => {
      toast({
        title: "Payment Processed",
        description: `Payment to ${sellerName} has been recorded successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['salesAnalytics'] });
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to process payment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setPaymentMethod("");
    setPaymentReference("");
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod) {
      toast({
        title: "Error",
        description: "Please select a payment method.",
        variant: "destructive",
      });
      return;
    }
    paymentMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Process Payment to Seller</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Seller</Label>
            <Input value={sellerName} disabled />
          </div>
          
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input value={`$${amount.toFixed(2)}`} disabled />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paymentReference">Payment Reference</Label>
            <Input
              id="paymentReference"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Transaction ID, check number, etc."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about the payment..."
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={paymentMutation.isPending}>
              {paymentMutation.isPending ? "Processing..." : "Process Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SellerPaymentModal;
