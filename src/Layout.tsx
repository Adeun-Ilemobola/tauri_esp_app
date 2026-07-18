import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";

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
import { useListenStore, usePortStore } from "./Hook/state";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner"

const navMain = [
  { label: "Dashboard", icon: "⊞", path: "" },
  { label: "Devices", icon: "⚡", badge: "3", path: "Devices" },
  // { label: "Flash Firmware", icon: "↑" },
]

const navSettings = [
  { label: "Port Settings", icon: "⚙", path: "PortSettings" },
  { label: "Logs", icon: "☰", path: "Logs" },
]

export function Layout() {
  const  startListeners = useListenStore((state) => state.startListeners)
  const  stopListeners = useListenStore((state) => state.stopListeners)
  const  portInfo = usePortStore((state) => state.portInfo)

  useEffect(() => {
    if (!portInfo.port) {
      stopListeners()
      return
    }
    startListeners()

    return () => {
      stopListeners()
    }
  }, [portInfo.port])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Toaster 
        richColors
        position="bottom-center"
      />
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className=" h-svh">
            <header className="flex h-12 items-center gap-2 border-b px-4">
              <SidebarTrigger />
              <span className="text-sm font-medium">ESP Tool</span>
            </header>
            <div className="flex-1 min-h-0 overflow-y-auto">   {/* the one real scroll container */}
              <Outlet />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

function AppSidebar() {
  const navigate = useNavigate();
  const modules= useListenStore((state)=> state.modules)

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
                <SidebarMenuItem
                  key={item.label}
                  onClick={() => {
                    const path = item.path.trim()
                    navigate(path === "Dashboard" ? "" : path)

                  }}
                >
                  <SidebarMenuButton>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {item.badge && <SidebarMenuBadge>{modules.length}</SidebarMenuBadge>}
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
                <SidebarMenuItem
                  key={item.label}
                  onClick={() => {
                    const path = item.path.trim()
                    navigate(path)

                  }}
                >
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