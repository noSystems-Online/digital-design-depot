
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton";

const SellerRoute = () => {
  const { isSellerApproved, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!isSellerApproved) {
    return <Navigate to="/sell" replace />;
  }

  return <Outlet />;
};

export default SellerRoute;
