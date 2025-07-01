
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Eye, Check, X, DollarSign } from "lucide-react";

interface Order {
  id: string;
  buyer_id: string;
  total_amount: number;
  payment_method: string;
  payment_proof_url: string;
  gateway_fees: number;
  platform_fees: number;
  seller_amount: number;
  verification_status: string;
  status: string;
  created_at: string;
  profiles: {
    email: string;
    first_name: string;
    last_name: string;
  };
  payment_gateways: {
    name: string;
    type: string;
  };
}

const OrderVerificationManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: pendingOrders, isLoading } = useQuery({
    queryKey: ['pendingOrders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!buyer_id (email, first_name, last_name),
          payment_gateways (name, type)
        `)
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Order[];
    }
  });

  const verifyOrderMutation = useMutation({
    mutationFn: async ({ orderId, approve }: { orderId: string; approve: boolean }) => {
      const updates = {
        verification_status: approve ? 'verified' : 'rejected',
        status: approve ? 'completed' : 'cancelled',
        verified_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);
      
      if (error) throw error;

      // If approved, trigger download email
      if (approve) {
        const { data: order } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              products (download_url, title)
            )
          `)
          .eq('id', orderId)
          .single();

        if (order) {
          const downloadLinks = order.order_items
            .map(item => item.products?.download_url)
            .filter(Boolean);

          if (downloadLinks.length > 0) {
            await supabase.functions.invoke('send-download-email', {
              body: {
                email: order.profiles?.email,
                downloadLinks,
                orderDetails: order
              }
            });
          }
        }
      }
    },
    onSuccess: (_, { approve }) => {
      toast({
        title: approve ? "Order Approved" : "Order Rejected",
        description: approve 
          ? "Order has been verified and download links sent to buyer"
          : "Order has been rejected and cancelled",
      });
      queryClient.invalidateQueries({ queryKey: ['pendingOrders'] });
      setIsDialogOpen(false);
      setSelectedOrder(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to verify order: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const handleVerifyOrder = (approve: boolean) => {
    if (!selectedOrder) return;
    verifyOrderMutation.mutate({ orderId: selectedOrder.id, approve });
  };

  if (isLoading) {
    return <div>Loading pending orders...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Verification Queue</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingOrders && pendingOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      {order.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {order.profiles?.first_name} {order.profiles?.last_name}
                      <div className="text-sm text-gray-600">{order.profiles?.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {order.payment_gateways?.name || order.payment_method}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${order.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        Pending Verification
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No orders pending verification
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Verification</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Order Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                    <p><strong>Buyer:</strong> {selectedOrder.profiles?.email}</p>
                    <p><strong>Payment Method:</strong> {selectedOrder.payment_gateways?.name}</p>
                    <p><strong>Date:</strong> {format(new Date(selectedOrder.created_at), "PPP")}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">Amount Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Total Amount:</strong> ${selectedOrder.total_amount.toFixed(2)}</p>
                    <p><strong>Gateway Fee:</strong> ${selectedOrder.gateway_fees.toFixed(2)}</p>
                    <p><strong>Platform Fee:</strong> ${selectedOrder.platform_fees.toFixed(2)}</p>
                    <p><strong>Seller Amount:</strong> ${selectedOrder.seller_amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {selectedOrder.payment_proof_url && (
                <div>
                  <h4 className="font-medium mb-2">Payment Proof</h4>
                  <img 
                    src={selectedOrder.payment_proof_url} 
                    alt="Payment proof" 
                    className="max-w-full h-auto border rounded"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleVerifyOrder(false)}
                  disabled={verifyOrderMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleVerifyOrder(true)}
                  disabled={verifyOrderMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve & Send Downloads
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderVerificationManager;
