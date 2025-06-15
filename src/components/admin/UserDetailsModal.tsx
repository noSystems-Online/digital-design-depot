
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  roles: string[];
  created_at: string;
  seller_status: string | null;
}

interface UserDetailsModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailsModal = ({ user, isOpen, onClose }: UserDetailsModalProps) => {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-sm font-mono bg-gray-50 p-2 rounded">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">User ID</label>
              <p className="text-sm font-mono bg-gray-50 p-2 rounded">{user.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">First Name</label>
              <p className="text-sm">{user.first_name || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Name</label>
              <p className="text-sm">{user.last_name || 'Not provided'}</p>
            </div>
          </div>

          {/* Roles */}
          <div>
            <label className="text-sm font-medium text-gray-500">Roles</label>
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

          {/* Seller Status */}
          <div>
            <label className="text-sm font-medium text-gray-500">Seller Status</label>
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

          {/* Account Information */}
          <div>
            <label className="text-sm font-medium text-gray-500">Account Created</label>
            <p className="text-sm">{format(new Date(user.created_at), "PPpp")}</p>
          </div>

          {/* Full Name Display */}
          <div>
            <label className="text-sm font-medium text-gray-500">Display Name</label>
            <p className="text-sm">
              {user.first_name || user.last_name 
                ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                : 'No name provided'
              }
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
