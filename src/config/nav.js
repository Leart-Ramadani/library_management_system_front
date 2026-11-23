import { LayoutDashboard, BookOpen, ArrowLeftRight, BookMarked, Users, Shield } from "lucide-react"

export const navItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ["super_admin", "operator", "student"] },
    { title: "Users", url: "/users", icon: Shield, roles: ["super_admin"] },
    { title: "Book categories", url: "/categories", icon: Users, roles: ["super_admin", "operator"] },
    { title: "Books", url: "/books", icon: BookOpen, roles: ["super_admin", "operator"] },
    { title: "System Settings", url: "/system-settings", icon: ArrowLeftRight, roles: ["super_admin"] },
    { title: "Loans", url: "/loans", icon: BookMarked, roles: ["super_admin", "operator", "student"] },
    { title: "Penalties", url: "/my-penalties", icon: BookMarked, roles: ["super_admin", "operator", "student"] },
]