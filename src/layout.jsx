import { Outlet } from "react-router-dom"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function Layout() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-12 items-center gap-2 border-b px-4">
                    <SidebarTrigger />
                </header>
                <main className="p-4">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}