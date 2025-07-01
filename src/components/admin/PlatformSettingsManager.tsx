
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

interface PlatformSetting {
  id: string;
  key: string;
  value: any;
  description: string;
}

const PlatformSettingsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Record<string, any>>({});

  const { data: platformSettings, isLoading } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*');
      
      if (error) throw error;
      
      const settingsMap = data.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>);
      
      setSettings(settingsMap);
      return data as PlatformSetting[];
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Record<string, any>) => {
      const updates = Object.entries(updatedSettings).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('platform_settings')
          .update({ value: update.value, updated_at: update.updated_at })
          .eq('key', update.key);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Platform settings have been saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['platformSettings'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update settings: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isLoading) {
    return <div>Loading platform settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="platformFee">Platform Fee Percentage (%)</Label>
            <Input
              id="platformFee"
              type="number"
              step="0.1"
              value={settings.platform_fee_percentage || 10}
              onChange={(e) => updateSetting('platform_fee_percentage', parseFloat(e.target.value))}
            />
            <p className="text-sm text-gray-600 mt-1">
              Percentage deducted from each sale as platform fee
            </p>
          </div>

          <div>
            <Label htmlFor="minimumPayout">Minimum Payout Amount ($)</Label>
            <Input
              id="minimumPayout"
              type="number"
              step="0.01"
              value={settings.minimum_payout || 50}
              onChange={(e) => updateSetting('minimum_payout', parseFloat(e.target.value))}
            />
            <p className="text-sm text-gray-600 mt-1">
              Minimum amount required for seller payout
            </p>
          </div>

          <div>
            <Label htmlFor="payoutSchedule">Payout Schedule</Label>
            <Select
              value={settings.payout_schedule || 'weekly'}
              onValueChange={(value) => updateSetting('payout_schedule', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="manual">Manual Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-approve Orders</Label>
                <p className="text-sm text-gray-600">
                  Automatically approve digital product orders
                </p>
              </div>
              <Switch
                checked={settings.auto_approve_orders || false}
                onCheckedChange={(checked) => updateSetting('auto_approve_orders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Require OTC Verification</Label>
                <p className="text-sm text-gray-600">
                  Require admin verification for over-the-counter payments
                </p>
              </div>
              <Switch
                checked={settings.require_order_verification !== false}
                onCheckedChange={(checked) => updateSetting('require_order_verification', checked)}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button 
            onClick={handleSaveSettings}
            disabled={updateSettingsMutation.isPending}
            className="w-full md:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformSettingsManager;
