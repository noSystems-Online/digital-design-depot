
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Settings } from "lucide-react";

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

const PaymentGatewayManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: gateways, isLoading } = useQuery({
    queryKey: ['paymentGateways', 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as PaymentGateway[];
    }
  });

  const updateGatewayMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PaymentGateway> }) => {
      const { error } = await supabase
        .from('payment_gateways')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payment gateway updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['paymentGateways'] });
      setIsDialogOpen(false);
      setEditingGateway(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update gateway: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const toggleGatewayStatus = async (id: string, currentStatus: boolean) => {
    updateGatewayMutation.mutate({
      id,
      updates: { is_active: !currentStatus }
    });
  };

  const handleEditGateway = (gateway: PaymentGateway) => {
    setEditingGateway(gateway);
    setIsDialogOpen(true);
  };

  const handleSaveGateway = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingGateway) return;

    const formData = new FormData(e.currentTarget);
    const updates = {
      fees: {
        fixed: parseFloat(formData.get('fixedFee') as string) || 0,
        percentage: parseFloat(formData.get('percentageFee') as string) || 0
      }
    };

    updateGatewayMutation.mutate({
      id: editingGateway.id,
      updates
    });
  };

  if (isLoading) {
    return <div>Loading payment gateways...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Payment Gateway Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fixed Fee</TableHead>
                <TableHead>Percentage Fee</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gateways?.map((gateway) => (
                <TableRow key={gateway.id}>
                  <TableCell className="font-medium">{gateway.name}</TableCell>
                  <TableCell>
                    <Badge variant={gateway.type === 'online' ? 'default' : 'secondary'}>
                      {gateway.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={gateway.is_active}
                      onCheckedChange={() => toggleGatewayStatus(gateway.id, gateway.is_active)}
                    />
                  </TableCell>
                  <TableCell>${gateway.fees.fixed}</TableCell>
                  <TableCell>{gateway.fees.percentage}%</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditGateway(gateway)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment Gateway</DialogTitle>
          </DialogHeader>
          {editingGateway && (
            <form onSubmit={handleSaveGateway} className="space-y-4">
              <div>
                <Label>Gateway Name</Label>
                <Input value={editingGateway.name} disabled />
              </div>
              
              <div>
                <Label htmlFor="fixedFee">Fixed Fee ($)</Label>
                <Input
                  id="fixedFee"
                  name="fixedFee"
                  type="number"
                  step="0.01"
                  defaultValue={editingGateway.fees.fixed}
                />
              </div>
              
              <div>
                <Label htmlFor="percentageFee">Percentage Fee (%)</Label>
                <Input
                  id="percentageFee"
                  name="percentageFee"
                  type="number"
                  step="0.1"
                  defaultValue={editingGateway.fees.percentage}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateGatewayMutation.isPending}>
                  {updateGatewayMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentGatewayManager;
