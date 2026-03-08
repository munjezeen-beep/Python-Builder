import { Link, useLocation } from "wouter";
import { Radar, Users, KeySquare, Settings, Activity } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: Radar },
  { title: "Telegram Accounts", url: "/accounts", icon: Users },
  { title: "Target Keywords", url: "/keywords", icon: KeySquare },
  { title: "Radar Logs", url: "/logs", icon: Activity },
  { title: "AI Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="flex h-16 items-center border-b px-6 py-4 justify-center">
        <div className="flex items-center gap-2 overflow-hidden w-full font-display">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Radar className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold truncate group-data-[collapsible=icon]:hidden">
            Radar<span className="text-primary">Bot</span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-sans text-xs uppercase tracking-wider text-muted-foreground/70 mb-2">
            System Core
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.url} className="flex items-center gap-3 w-full font-medium">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
