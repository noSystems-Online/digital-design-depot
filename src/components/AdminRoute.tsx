
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
