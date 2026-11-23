import { Link, useLocation, useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { navItems } from "@/config/nav"

export function AppSidebar() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const items = navItems.filter((item) => item.roles.includes(user.role))
  const isActive = (url) => (url === "/" ? pathname === "/" : pathname.startsWith(url))

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    isActive={isActive(item.url)}
                    render={<Link to={item.url} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 text-sm">
          <div className="font-medium">{user.name}</div>
          <div className="text-muted-foreground capitalize">{user.role}</div>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut /> Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}