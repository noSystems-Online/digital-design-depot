
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface PayPalConfig {
  id?: string;
  client_id: string;
  environment: 'sandbox' | 'live';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const PayPalConfigManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<PayPalConfig>({
    client_id: '',
    environment: 'sandbox',
    is_active: true
  });

  const { data: paypalConfig, isLoading } = useQuery({
    queryKey: ['paypal-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('paypal_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (configData: PayPalConfig) => {
      if (paypalConfig?.id) {
        const { data, error } = await supabase
          .from('paypal_config')
          .update(configData)
          .eq('id', paypalConfig.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('paypal_config')
          .insert(configData)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paypal-config'] });
      toast({
        title: "Success",
        description: "PayPal configuration saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save configuration: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (paypalConfig) {
      setConfig({
        ...paypalConfig,
        environment: paypalConfig.environment as 'sandbox' | 'live'
      });
    }
  }, [paypalConfig]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(config);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          PayPal Configuration
          <Badge variant={config.environment === 'live' ? 'default' : 'secondary'}>
            {config.environment.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client_id">PayPal Client ID</Label>
            <Input
              id="client_id"
              value={config.client_id}
              onChange={(e) => setConfig(prev => ({ ...prev, client_id: e.target.value }))}
              placeholder="Enter PayPal Client ID"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="environment"
              checked={config.environment === 'live'}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, environment: checked ? 'live' : 'sandbox' }))
              }
            />
            <Label htmlFor="environment">
              Use Live Environment (uncheck for Sandbox)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={config.is_active}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, is_active: checked }))
              }
            />
            <Label htmlFor="is_active">
              Enable PayPal Payments
            </Label>
          </div>

          <Button 
            type="submit" 
            disabled={saveMutation.isPending || isLoading}
            className="w-full"
          >
            {saveMutation.isPending ? "Saving..." : "Save Configuration"}
          </Button>
        </form>

        {config.environment === 'live' && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Live Mode:</strong> Make sure you have updated your PayPal Client Secret 
              in Supabase secrets for the live environment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PayPalConfigManager;
