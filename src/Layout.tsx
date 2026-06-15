import { Outlet } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
   SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme-provider"

const navMain = [
  { label: "Dashboard", icon: "⊞" },
  { label: "Serial Monitor", icon: "⌨", badge: "Live" },
  { label: "Devices", icon: "⚡", badge: "3" },
  { label: "Flash Firmware", icon: "↑" },
]

const navSettings = [
  { label: "Port Settings", icon: "⚙" },
  { label: "Baud Rate", icon: "≈" },
  { label: "Logs", icon: "☰" },
]

export function Layout() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <TooltipProvider>
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">ESP Tool</span>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
    </TooltipProvider>
    </ThemeProvider>
  );
}

function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3 font-semibold text-sm">
        ESP Tool
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navSettings.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3 text-xs text-muted-foreground">
        v0.1.0
      </SidebarFooter>
    </Sidebar>
  )
}