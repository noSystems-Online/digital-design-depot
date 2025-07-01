
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { DollarSign, FileText, Users, CreditCard, TrendingUp, AlertCircle } from "lucide-react";
import SellerPaymentModal from "./SellerPaymentModal";

interface SalesData {
  id: string;
  total_amount: number;
  gateway_fees: number;
  platform_fees: number;
  seller_amount: number;
  created_at: string;
  buyer_email: string;
  seller_id: string;
  seller_business_name: string;
  product_titles: string[];
  seller_payment_status: string;
  verification_status: string;
  payment_method: string;
}

interface SalesStats {
  totalRevenue: number;
  totalOrders: number;
  totalSellers: number;
  avgOrderValue: number;
  pendingPayments: number;
  totalPaidToSellers: number;
  totalGatewayFees: number;
  totalPlatformFees: number;
  pendingVerification: number;
}

const SalesAnalyticsTab = () => {
  const [selectedPayment, setSelectedPayment] = useState<{
    orderId: string;
    sellerId: string;
    amount: number;
    sellerName: string;
  } | null>(null);
  
  const { data: salesData, isLoading } = useQuery({
    queryKey: ['salesAnalytics'],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          gateway_fees,
          platform_fees,
          seller_amount,
          created_at,
          seller_payment_status,
          verification_status,
          payment_method,
          profiles!buyer_id (email),
          order_items (
            products (
              title,
              seller_id,
              profiles!seller_id (seller_info)
            )
          )
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return orders.map(order => ({
        id: order.id,
        total_amount: order.total_amount,
        gateway_fees: order.gateway_fees || 0,
        platform_fees: order.platform_fees || 0,
        seller_amount: order.seller_amount || 0,
        created_at: order.created_at,
        seller_payment_status: order.seller_payment_status || 'pending',
        verification_status: order.verification_status || 'pending',
        payment_method: order.payment_method || '',
        buyer_email: order.profiles?.email || 'Unknown',
        seller_id: order.order_items[0]?.products?.seller_id || '',
        seller_business_name: (order.order_items[0]?.products?.profiles?.seller_info as any)?.businessName || 'Unknown',
        product_titles: order.order_items.map(item => item.products?.title || 'Unknown Product')
      })) as SalesData[];
    },
  });

  const salesStats: SalesStats = {
    totalRevenue: salesData?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0,
    totalOrders: salesData?.length || 0,
    totalSellers: salesData ? new Set(salesData.map(sale => sale.seller_id)).size : 0,
    avgOrderValue: salesData && salesData.length > 0 ? 
      salesData.reduce((sum, sale) => sum + sale.total_amount, 0) / salesData.length : 0,
    pendingPayments: salesData?.filter(sale => sale.seller_payment_status === 'pending').length || 0,
    totalPaidToSellers: salesData?.filter(sale => sale.seller_payment_status === 'paid')
      .reduce((sum, sale) => sum + sale.seller_amount, 0) || 0,
    totalGatewayFees: salesData?.reduce((sum, sale) => sum + sale.gateway_fees, 0) || 0,
    totalPlatformFees: salesData?.reduce((sum, sale) => sum + sale.platform_fees, 0) || 0,
    pendingVerification: salesData?.filter(sale => sale.verification_status === 'pending').length || 0,
  };

  const handlePaySeller = (sale: SalesData) => {
    setSelectedPayment({
      orderId: sale.id,
      sellerId: sale.seller_id,
      amount: sale.seller_amount,
      sellerName: sale.seller_business_name
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${salesStats.totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {salesStats.totalOrders}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Platform Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${salesStats.totalPlatformFees.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Gateway Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${salesStats.totalGatewayFees.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Active Sellers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {salesStats.totalSellers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid to Sellers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">
              ${salesStats.totalPaidToSellers.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {salesStats.pendingPayments}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              ${salesStats.avgOrderValue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales & Payment Management</CardTitle>
        </CardHeader>
        <CardContent>
          {salesData && salesData.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Fees</TableHead>
                    <TableHead>Seller Amount</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono text-sm">
                        {sale.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{sale.buyer_email}</TableCell>
                      <TableCell>{sale.seller_business_name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {sale.product_titles.map((title, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {title.length > 15 ? `${title.slice(0, 15)}...` : title}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${sale.total_amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>G: ${sale.gateway_fees.toFixed(2)}</div>
                        <div>P: ${sale.platform_fees.toFixed(2)}</div>
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        ${sale.seller_amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={sale.seller_payment_status === 'paid' ? 'default' : 'destructive'}
                        >
                          {sale.seller_payment_status === 'paid' ? 'Paid' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(sale.created_at), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        {sale.seller_payment_status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handlePaySeller(sale)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Pay Seller
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No sales data available yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {selectedPayment && (
        <SellerPaymentModal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          orderId={selectedPayment.orderId}
          sellerId={selectedPayment.sellerId}
          amount={selectedPayment.amount}
          sellerName={selectedPayment.sellerName}
        />
      )}
    </div>
  );
};

export default SalesAnalyticsTab;
