import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings } from "lucide-react";

interface PayPalConfig {
  id: string;
  client_id: string;
  environment: string;
  is_active: boolean;
}

const AppConfigTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [paypalConfig, setPaypalConfig] = useState({
    client_id: "",
    environment: "sandbox",
    is_active: true
  });

  const [appSettings, setAppSettings] = useState({
    siteName: "Digital Marketplace",
    siteDescription: "Buy and sell digital products",
    allowGuestCheckout: false,
    requireEmailVerification: true,
    defaultCurrency: "USD",
    commissionRate: 5
  });

  // Fetch PayPal configuration
  const { data: paypalData, isLoading: paypalLoading } = useQuery({
    queryKey: ['paypalConfig'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('paypal_config')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    },
  });

  useEffect(() => {
    if (paypalData) {
      setPaypalConfig({
        client_id: paypalData.client_id || "",
        environment: paypalData.environment || "sandbox",
        is_active: paypalData.is_active || true
      });
    }
  }, [paypalData]);

  const paypalMutation = useMutation({
    mutationFn: async (config: typeof paypalConfig) => {
      if (paypalData?.id) {
        const { error } = await supabase
          .from('paypal_config')
          .update(config)
          .eq('id', paypalData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('paypal_config')
          .insert([config]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paypalConfig'] });
      toast({
        title: "Success",
        description: "PayPal configuration updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update PayPal configuration: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handlePayPalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    paypalMutation.mutate(paypalConfig);
  };

  const handleAppSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show a success message since we haven't implemented app settings storage
    toast({
      title: "Success",
      description: "App settings would be saved here (not implemented yet).",
    });
  };

  if (paypalLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PayPal Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            PayPal Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePayPalSubmit} className="space-y-4">
            <div>
              <Label htmlFor="client_id">PayPal Client ID</Label>
              <Input
                id="client_id"
                value={paypalConfig.client_id}
                onChange={(e) => setPaypalConfig(prev => ({ ...prev, client_id: e.target.value }))}
                placeholder="Enter PayPal Client ID"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="environment">Environment</Label>
              <Select 
                value={paypalConfig.environment} 
                onValueChange={(value) => setPaypalConfig(prev => ({ ...prev, environment: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={paypalConfig.is_active}
                onCheckedChange={(checked) => setPaypalConfig(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Enable PayPal</Label>
            </div>

            <Button type="submit" disabled={paypalMutation.isPending}>
              {paypalMutation.isPending ? "Saving..." : "Save PayPal Configuration"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* General App Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAppSettingsSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={appSettings.siteName}
                  onChange={(e) => setAppSettings(prev => ({ ...prev, siteName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Select 
                  value={appSettings.defaultCurrency} 
                  onValueChange={(value) => setAppSettings(prev => ({ ...prev, defaultCurrency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input
                id="siteDescription"
                value={appSettings.siteDescription}
                onChange={(e) => setAppSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                min="0"
                max="100"
                value={appSettings.commissionRate}
                onChange={(e) => setAppSettings(prev => ({ ...prev, commissionRate: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="allowGuestCheckout"
                  checked={appSettings.allowGuestCheckout}
                  onCheckedChange={(checked) => setAppSettings(prev => ({ ...prev, allowGuestCheckout: checked }))}
                />
                <Label htmlFor="allowGuestCheckout">Allow Guest Checkout</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="requireEmailVerification"
                  checked={appSettings.requireEmailVerification}
                  onCheckedChange={(checked) => setAppSettings(prev => ({ ...prev, requireEmailVerification: checked }))}
                />
                <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
              </div>
            </div>

            <Button type="submit">
              Save App Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppConfigTab;
