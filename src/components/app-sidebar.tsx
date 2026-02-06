import { Calendar, LayoutDashboard, Settings, LogIn } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/tanstack-react-start"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Jobs Dashboard",
    url: "/",
    icon: Calendar,
  },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border pb-4 pt-4">
        <div className="flex items-center gap-2 px-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <LayoutDashboard className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold text-sidebar-foreground">BuzzThing</span>
            <span className="text-xs text-sidebar-foreground/70">v0.0.1</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link to={item.url} activeProps={{ className: "bg-accent text-accent-foreground font-medium" }}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <Link to="/" >
                    <Settings />
                    <span>Configuration</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-4">
            <ModeToggle />
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <LogIn className="size-4" />
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        ) : (
          <>
            <SignedIn>
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <UserButton />
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
                <ModeToggle />
              </div>
            </SignedIn>
            <SignedOut>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <SignInButton mode="modal">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </Button>
                  </SignInButton>
                </div>
                <ModeToggle />
              </div>
            </SignedOut>
          </>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
