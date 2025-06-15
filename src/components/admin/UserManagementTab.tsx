
import React, { useState, useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronUp, ChevronDown, Search, Filter, Eye, Settings } from "lucide-react";
import SellerRegistrationModal from "@/components/SellerRegistrationModal";
import UserDetailsModal from "./UserDetailsModal";

type UserSortField = 'email' | 'first_name' | 'last_name' | 'created_at' | 'roles';
type UserSortDirection = 'asc' | 'desc';

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  roles: string[];
  created_at: string;
  seller_status: string | null;
}

const UserManagementTab = () => {
  const [usersCurrentPage, setUsersCurrentPage] = useState(1);
  const [usersSortField, setUsersSortField] = useState<UserSortField>('created_at');
  const [usersSortDirection, setUsersSortDirection] = useState<UserSortDirection>('desc');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userSellerStatusFilter, setUserSellerStatusFilter] = useState<string>('all');
  const [selectedUserForRegistration, setSelectedUserForRegistration] = useState<UserProfile | null>(null);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<UserProfile | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  const itemsPerPage = 10;

  // Fetch all users with admin privileges
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      console.log('Fetching all users for admin...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      console.log('Successfully fetched users:', data?.length || 0);
      return data as UserProfile[];
    },
  });

  const handleUsersSort = (field: UserSortField) => {
    if (usersSortField === field) {
      setUsersSortDirection(usersSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setUsersSortField(field);
      setUsersSortDirection('asc');
    }
    setUsersCurrentPage(1);
  };

  const filteredAndSortedUsers = useMemo(() => {
    if (!users) return [];
    
    // Filter users
    let filtered = users.filter(user => {
      // Search filter
      const matchesSearch = userSearchTerm === '' || 
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (user.first_name && user.first_name.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
        (user.last_name && user.last_name.toLowerCase().includes(userSearchTerm.toLowerCase()));

      // Role filter
      const matchesRole = userRoleFilter === 'all' || 
        (user.roles && user.roles.includes(userRoleFilter));

      // Seller status filter
      const matchesSellerStatus = userSellerStatusFilter === 'all' ||
        (userSellerStatusFilter === 'none' && !user.seller_status) ||
        user.seller_status === userSellerStatusFilter;

      return matchesSearch && matchesRole && matchesSellerStatus;
    });
    
    // Sort users
    return filtered.sort((a, b) => {
      let aValue: any = a[usersSortField];
      let bValue: any = b[usersSortField];
      
      if (usersSortField === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (usersSortField === 'roles') {
        aValue = (aValue || ['buyer']).join(',');
        bValue = (bValue || ['buyer']).join(',');
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      } else {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }
      
      if (usersSortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [users, usersSortField, usersSortDirection, userSearchTerm, userRoleFilter, userSellerStatusFilter]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (usersCurrentPage - 1) * itemsPerPage;
    return filteredAndSortedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedUsers, usersCurrentPage]);

  const usersTotalPages = Math.ceil((filteredAndSortedUsers?.length || 0) / itemsPerPage);

  const UsersSortButton = ({ field, children }: { field: UserSortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleUsersSort(field)}
      className="flex items-center space-x-1 hover:bg-muted/50 p-1 rounded transition-colors"
    >
      <span>{children}</span>
      {usersSortField === field && (
        usersSortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
      )}
    </button>
  );

  const renderPaginationItems = (currentPageParam: number, totalPagesParam: number, setPageFunc: (page: number) => void) => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPageParam - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPagesParam, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => setPageFunc(1)}
            isActive={false}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(<PaginationItem key="ellipsis1"><PaginationEllipsis /></PaginationItem>);
      }
    }

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <PaginationItem key={page}>
          <PaginationLink
            onClick={() => setPageFunc(page)}
            isActive={currentPageParam === page}
            className="cursor-pointer"
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPagesParam) {
      if (endPage < totalPagesParam - 1) {
        items.push(<PaginationItem key="ellipsis2"><PaginationEllipsis /></PaginationItem>);
      }
      items.push(
        <PaginationItem key={totalPagesParam}>
          <PaginationLink
            onClick={() => setPageFunc(totalPagesParam)}
            isActive={false}
            className="cursor-pointer"
          >
            {totalPagesParam}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  const handleViewUserDetails = (user: UserProfile) => {
    setSelectedUserForDetails(user);
    setIsDetailsModalOpen(true);
  };

  const handleManageSellerRegistration = (user: UserProfile) => {
    setSelectedUserForRegistration(user);
    setIsRegistrationModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Users filter controls */}
      <div className="flex gap-4 items-center mb-4 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search users..."
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="buyer">Buyer</SelectItem>
              <SelectItem value="seller">Seller</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={userSellerStatusFilter} onValueChange={setUserSellerStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by seller status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Seller Statuses</SelectItem>
              <SelectItem value="none">No Seller Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {usersLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : users && users.length > 0 ? (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <UsersSortButton field="email">Email</UsersSortButton>
                  </TableHead>
                  <TableHead>
                    <UsersSortButton field="first_name">First Name</UsersSortButton>
                  </TableHead>
                  <TableHead>
                    <UsersSortButton field="last_name">Last Name</UsersSortButton>
                  </TableHead>
                  <TableHead>
                    <UsersSortButton field="roles">Roles</UsersSortButton>
                  </TableHead>
                  <TableHead>Seller Status</TableHead>
                  <TableHead>
                    <UsersSortButton field="created_at">Joined</UsersSortButton>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.first_name || '-'}</TableCell>
                    <TableCell>{user.last_name || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {(user.roles || ['buyer']).map((role) => (
                          <Badge 
                            key={role} 
                            variant={role === 'admin' ? 'destructive' : role === 'seller' ? 'default' : 'secondary'}
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.seller_status ? (
                        <Badge variant={
                          user.seller_status === 'approved' ? 'default' : 
                          user.seller_status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {user.seller_status}
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{format(new Date(user.created_at), "PPP")}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUserDetails(user)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      {(user.seller_status === 'pending' || user.roles?.includes('seller')) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageSellerRegistration(user)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Manage Seller
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            Showing {paginatedUsers.length} of {filteredAndSortedUsers.length} users
            {userSearchTerm || userRoleFilter !== 'all' || userSellerStatusFilter !== 'all' ? 
              ` (filtered from ${users.length} total)` : ''}
          </div>
          
          {usersTotalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setUsersCurrentPage(Math.max(1, usersCurrentPage - 1))}
                      className={usersCurrentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {renderPaginationItems(usersCurrentPage, usersTotalPages, setUsersCurrentPage)}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setUsersCurrentPage(Math.min(usersTotalPages, usersCurrentPage + 1))}
                      className={usersCurrentPage === usersTotalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-2">No users found</h2>
          <p className="text-gray-600">No users have registered yet.</p>
        </div>
      )}

      <SellerRegistrationModal
        user={selectedUserForRegistration}
        isOpen={isRegistrationModalOpen}
        onClose={() => {
          setIsRegistrationModalOpen(false);
          setSelectedUserForRegistration(null);
        }}
      />

      <UserDetailsModal
        user={selectedUserForDetails}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedUserForDetails(null);
        }}
      />
    </div>
  );
};

export default UserManagementTab;
