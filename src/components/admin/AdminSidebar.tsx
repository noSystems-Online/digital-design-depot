
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
  Package,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

const SidebarContent = ({ activeTab, onTabChange, isCollapsed, onToggleCollapse }: AdminSidebarProps & { isCollapsed: boolean; onToggleCollapse: () => void }) => (
  <TooltipProvider>
    <div className="flex h-full flex-col">
      <div className={cn("p-6 border-b", isCollapsed && "p-4")}>
        <div className="flex items-center justify-between">
          {!isCollapsed && <h2 className="text-lg font-semibold">Admin Panel</h2>}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="hidden md:flex"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            const buttonContent = (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-secondary",
                  isCollapsed && "justify-center px-2"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                {!isCollapsed && item.label}
              </Button>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    {buttonContent}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return buttonContent;
          })}
        </div>
      </ScrollArea>
    </div>
  </TooltipProvider>
);

const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

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
            isCollapsed={false}
            onToggleCollapse={() => {}}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:flex md:flex-col md:fixed md:inset-y-0 md:border-r md:bg-gray-50/50 transition-all duration-300",
        isCollapsed ? "md:w-16" : "md:w-64"
      )}>
        <SidebarContent 
          activeTab={activeTab} 
          onTabChange={onTabChange}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>
    </>
  );
};

export default AdminSidebar;
