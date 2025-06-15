
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  roles: string[];
  created_at: string;
  seller_status: string | null;
  seller_info?: any;
}

interface SellerRegistrationModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

type SellerStatus = 'pending' | 'approved' | 'rejected';
type UserRole = 'buyer' | 'seller' | 'admin';

const SellerRegistrationModal = ({ user, isOpen, onClose }: SellerRegistrationModalProps) => {
  const queryClient = useQueryClient();

  const updateSellerStatusMutation = useMutation({
    mutationFn: async ({ userId, status, roles }: { userId: string; status: SellerStatus; roles: UserRole[] }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          seller_status: status,
          roles: roles
        })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast.success('Seller status updated successfully');
      onClose();
    },
    onError: (error) => {
      console.error('Error updating seller status:', error);
      toast.error('Failed to update seller status');
    }
  });

  const handleApprove = () => {
    if (!user) return;
    
    const newRoles = user.roles?.includes('seller') ? user.roles as UserRole[] : [...(user.roles || []), 'seller'] as UserRole[];
    updateSellerStatusMutation.mutate({
      userId: user.id,
      status: 'approved' as SellerStatus,
      roles: newRoles
    });
  };

  const handleReject = () => {
    if (!user) return;
    
    const newRoles = user.roles?.filter(role => role !== 'seller') as UserRole[] || [];
    updateSellerStatusMutation.mutate({
      userId: user.id,
      status: 'rejected' as SellerStatus,
      roles: newRoles
    });
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Seller Registration Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-sm font-mono bg-gray-50 p-2 rounded">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-sm">
                {user.first_name || user.last_name 
                  ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                  : 'Not provided'
                }
              </p>
            </div>
          </div>

          {/* Current Status */}
          <div>
            <label className="text-sm font-medium text-gray-500">Current Seller Status</label>
            <div className="mt-1">
              {user.seller_status ? (
                <Badge variant={
                  user.seller_status === 'approved' ? 'default' : 
                  user.seller_status === 'pending' ? 'secondary' : 'destructive'
                }>
                  {user.seller_status}
                </Badge>
              ) : (
                <span className="text-sm text-gray-400">No seller status</span>
              )}
            </div>
          </div>

          {/* Current Roles */}
          <div>
            <label className="text-sm font-medium text-gray-500">Current Roles</label>
            <div className="flex gap-2 mt-1">
              {(user.roles || ['buyer']).map((role) => (
                <Badge 
                  key={role} 
                  variant={role === 'admin' ? 'destructive' : role === 'seller' ? 'default' : 'secondary'}
                >
                  {role}
                </Badge>
              ))}
            </div>
          </div>

          {/* Seller Information */}
          {user.seller_info && (
            <div>
              <label className="text-sm font-medium text-gray-500">Seller Information</label>
              <div className="mt-1 bg-gray-50 p-3 rounded">
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(user.seller_info, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Registration Date */}
          <div>
            <label className="text-sm font-medium text-gray-500">Registration Date</label>
            <p className="text-sm">{format(new Date(user.created_at), "PPpp")}</p>
          </div>

          {/* Actions */}
          {user.seller_status === 'pending' && (
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleApprove}
                disabled={updateSellerStatusMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {updateSellerStatusMutation.isPending ? 'Processing...' : 'Approve Registration'}
              </Button>
              <Button
                onClick={handleReject}
                disabled={updateSellerStatusMutation.isPending}
                variant="destructive"
              >
                {updateSellerStatusMutation.isPending ? 'Processing...' : 'Reject Registration'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SellerRegistrationModal;
