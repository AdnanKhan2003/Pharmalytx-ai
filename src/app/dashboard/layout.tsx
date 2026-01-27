"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Pill, Sparkles, BarChart3, ArchiveRestore, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession, signOut } from "next-auth/react"
import { SessionProvider } from "next-auth/react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <DashboardContent>{children}</DashboardContent>
        </SessionProvider>
    )
}

function DashboardContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const userRole = session?.user?.role || 'CASHIER' // Default to safest

    const allNavItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ['ADMIN', 'PHARMACIST', 'CASHIER'] },
        { name: "Inventory", href: "/dashboard/inventory", icon: Package, roles: ['ADMIN', 'PHARMACIST'] },
        { name: "Sales", href: "/dashboard/sales", icon: ShoppingCart, roles: ['ADMIN', 'PHARMACIST', 'CASHIER'] },
        { name: "Users", href: "/dashboard/users", icon: Users, roles: ['ADMIN'] },
        { name: "Suppliers", href: "/dashboard/suppliers", icon: Users, roles: ['ADMIN', 'PHARMACIST'] },
        { name: "Returns", href: "/dashboard/returns", icon: ArchiveRestore, roles: ['ADMIN', 'PHARMACIST'] },
        { name: "Reports", href: "/dashboard/reports", icon: BarChart3, roles: ['ADMIN'] },
        { name: "AI Forecast", href: "/dashboard/ai-forecasting", icon: Sparkles, roles: ['ADMIN', 'PHARMACIST'] },
        { name: "Settings", href: "/dashboard/settings", icon: Settings, roles: ['ADMIN', 'PHARMACIST', 'CASHIER'] },
    ]

    const navItems = allNavItems.filter(item => item.roles.includes(userRole))

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-black overflow-hidden transition-colors duration-300">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col z-20 transition-colors duration-300">
                <SidebarContent navItems={navItems} pathname={pathname} />
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                    <UserMenu />
                    <ThemeToggle />
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Mobile Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 md:hidden flex flex-col",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex justify-between items-center pr-4">
                    <SidebarContent navItems={navItems} pathname={pathname} />
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white absolute right-2 top-4">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="mt-auto p-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                    <UserMenu />
                    <ThemeToggle />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative w-full">
                {/* Decorative Gradients */}
                <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 pointer-events-none" />

                <div className="p-4 md:p-8 relative z-0">
                    <header className="mb-8 flex justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden text-gray-600 dark:text-gray-300"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    {pathname === '/dashboard' ? 'Overview' : pathname.split('/').pop()?.charAt(0).toUpperCase() + pathname.split('/').pop()!.slice(1)}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm hidden md:block">Welcome back, {session?.user?.name || 'User'}</p>
                            </div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 border-2 border-white dark:border-gray-800 shadow-sm flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold shrink-0">
                            {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </header>
                    {children}
                </div>
            </main>
        </div>
    )
}

import Image from "next/image"

function SidebarContent({ navItems, pathname }: { navItems: any[], pathname: string }) {
    return (
        <>
            <div className="p-6 flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0">
                    <Image
                        src="/transparent-logo.png"
                        alt="Pharmalytix AI Logo"
                        fill
                        className="object-contain"
                    />
                </div>
                <span className="font-bold text-lg text-gray-800 dark:text-gray-100 tracking-tight">Pharmalytix AI</span>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive ? "text-blue-600" : "text-gray-400")} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
        </>
    )
}

function UserMenu() {
    return (
        <button
            onClick={() => signOut()}
            className="flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
            <LogOut className="h-5 w-5" />
            Sign Out
        </button>
    )
}
