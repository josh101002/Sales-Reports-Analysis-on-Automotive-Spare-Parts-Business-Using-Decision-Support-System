import {
  BarChart3,
  Package,
  TrendingUp,
  Brain,
  Settings,
  Truck,
  Home,
  ChevronRight,
  LineChart,
  Target,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
} from "./ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { LucideProps } from "lucide-react";

interface AppSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function AppSidebar({ activeView, onViewChange }: AppSidebarProps) {
  interface MenuItem {
    title: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    key: string;
    subItems?: { title: string; key: string }[];
  }

  const menuItems: {
    title: string;
    items: MenuItem[];
  }[] = [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          icon: Home,
          key: "dashboard",
        },
      ],
    },
    {
      title: "Sales & Analytics",
      items: [
        {
          title: "Sales Reports",
          icon: BarChart3,
          key: "sales-reports",
        },
        {
          title: "Predictions & Trends",
          icon: LineChart,
          key: "predictions-trends",
        },
        {
          title: "Analytics",
          icon: TrendingUp,
          key: "analytics",
        },
        {
          title: "Recommendations",
          icon: Brain,
          key: "recommendations",
        },
      ],
    },
    {
      title: "Inventory Management",
      items: [
        {
          title: "Inventory",
          icon: Package,
          key: "inventory",
        },
        {
          title: "Suppliers",
          icon: Truck,
          key: "suppliers",
        },
      ],
    },
    {
      title: "Configuration",
      items: [
        {
          title: "Settings",
          icon: Settings,
          key: "settings",
        },
      ],
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#607D8B] flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sidebar-foreground">AutoParts Pro</h3>
            <p className="text-xs text-[#B0BEC5]">Sales Analytics</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    {item.subItems ? (
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={activeView === item.key ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                            <ChevronRight className="w-4 h-4 ml-auto transition-transform group-data-[state=open]:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                onClick={() => onViewChange(item.key)}
                                className={activeView === item.key ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                              >
                                <span>Overview</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            {item.subItems.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.key}>
                                <SidebarMenuSubButton
                                  onClick={() => onViewChange(subItem.key)}
                                  className={activeView === subItem.key ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                                >
                                  <span>{subItem.title}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton
                        onClick={() => onViewChange(item.key)}
                        className={activeView === item.key ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}