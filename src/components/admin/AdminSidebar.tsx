
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  BarChart3, 
  ClipboardCheck, 
  CreditCard, 
  Settings, 
  Users, 
  FolderOpen, 
  Newspaper, 
  Shield, 
  Wrench,
  Menu,
  Package
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const sidebarItems = [
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "verification", label: "Orders", icon: ClipboardCheck },
  { id: "products", label: "Products", icon: Package },
  { id: "gateways", label: "Payments", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "users", label: "Users", icon: Users },
  { id: "categories", label: "Categories", icon: FolderOpen },
  { id: "news", label: "News", icon: Newspaper },
  { id: "roles", label: "Roles", icon: Shield },
  { id: "config", label: "Config", icon: Wrench },
];

const SidebarContent = ({ activeTab, onTabChange }: AdminSidebarProps) => (
  <div className="flex h-full flex-col">
    <div className="p-6">
      <h2 className="text-lg font-semibold">Admin Panel</h2>
    </div>
    <ScrollArea className="flex-1 px-3">
      <div className="space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                activeTab === item.id && "bg-secondary"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  </div>
);

const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent 
            activeTab={activeTab} 
            onTabChange={(tab) => {
              onTabChange(tab);
              setOpen(false);
            }} 
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:border-r md:bg-gray-50/50">
        <SidebarContent activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </>
  );
};

export default AdminSidebar;
