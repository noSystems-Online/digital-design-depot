
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagementTab from "@/components/admin/UserManagementTab";
import CategoryManagementTab from "@/components/admin/CategoryManagementTab";
import NewsManagementTab from "@/components/admin/NewsManagementTab";
import RoleManagementTab from "@/components/admin/RoleManagementTab";
import SalesAnalyticsTab from "@/components/admin/SalesAnalyticsTab";
import AppConfigTab from "@/components/admin/AppConfigTab";
import PaymentGatewayManager from "@/components/admin/PaymentGatewayManager";
import PlatformSettingsManager from "@/components/admin/PlatformSettingsManager";
import OrderVerificationManager from "@/components/admin/OrderVerificationManager";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
          
          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="verification">Orders</TabsTrigger>
              <TabsTrigger value="gateways">Payments</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="config">Config</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              <SalesAnalyticsTab />
            </TabsContent>

            <TabsContent value="verification" className="space-y-6">
              <OrderVerificationManager />
            </TabsContent>

            <TabsContent value="gateways" className="space-y-6">
              <PaymentGatewayManager />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <PlatformSettingsManager />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <UserManagementTab />
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <CategoryManagementTab />
            </TabsContent>

            <TabsContent value="news" className="space-y-6">
              <NewsManagementTab />
            </TabsContent>

            <TabsContent value="roles" className="space-y-6">
              <RoleManagementTab />
            </TabsContent>

            <TabsContent value="config" className="space-y-6">
              <AppConfigTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
