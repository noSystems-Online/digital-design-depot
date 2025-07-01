
import { useState } from "react";
import UserManagementTab from "@/components/admin/UserManagementTab";
import CategoryManagementTab from "@/components/admin/CategoryManagementTab";
import NewsManagementTab from "@/components/admin/NewsManagementTab";
import RoleManagementTab from "@/components/admin/RoleManagementTab";
import SalesAnalyticsTab from "@/components/admin/SalesAnalyticsTab";
import AppConfigTab from "@/components/admin/AppConfigTab";
import PaymentGatewayManager from "@/components/admin/PaymentGatewayManager";
import PlatformSettingsManager from "@/components/admin/PlatformSettingsManager";
import OrderVerificationManager from "@/components/admin/OrderVerificationManager";
import ProductManagementTab from "@/components/admin/ProductManagementTab";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("analytics");

  const renderTabContent = () => {
    switch (activeTab) {
      case "analytics":
        return <SalesAnalyticsTab />;
      case "verification":
        return <OrderVerificationManager />;
      case "products":
        return <ProductManagementTab />;
      case "gateways":
        return <PaymentGatewayManager />;
      case "settings":
        return <PlatformSettingsManager />;
      case "users":
        return <UserManagementTab />;
      case "categories":
        return <CategoryManagementTab />;
      case "news":
        return <NewsManagementTab />;
      case "roles":
        return <RoleManagementTab />;
      case "config":
        return <AppConfigTab />;
      default:
        return <SalesAnalyticsTab />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Main Content */}
        <div className="flex-1 md:ml-16 lg:ml-64 transition-all duration-300">
          <main className="py-8 pb-32">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <div className="md:hidden">
                  <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
                </div>
              </div>
              
              <div className="space-y-6">
                {renderTabContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
