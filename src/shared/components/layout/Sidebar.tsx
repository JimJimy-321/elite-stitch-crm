"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Ticket,
    Users,
    Wallet,
    MessageSquare,
    Settings,
    Scissors,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Store
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Ticket, label: 'Tickets', href: '/dashboard/tickets' },
    { icon: Users, label: 'Clientes', href: '/dashboard/clients' },
    { icon: Wallet, label: 'Caja', href: '/dashboard/finance' },
    { icon: MessageSquare, label: 'Mensajes', href: '/dashboard/messages' },
    { icon: Store, label: 'Sucursales', href: '/dashboard/branches', ownerOnly: true },
    { icon: Settings, label: 'Ajustes', href: '/dashboard/settings' },
];

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
    const pathname = usePathname();

    return (
        <div className={cn(
            "h-screen bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out relative",
            collapsed ? "w-20" : "w-64"
        )}>
            {/* Header */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <Scissors className="text-white w-5 h-5" />
                </div>
                {!collapsed && (
                    <span className="font-bold text-xl tracking-tight text-white whitespace-nowrap">
                        Elite Stitch
                    </span>
                )}
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform z-50"
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "sidebar-item",
                                isActive && "sidebar-item-active",
                                collapsed && "justify-center px-0"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-accent" : "text-muted")} />
                            {!collapsed && <span>{item.label}</span>}
                            {!collapsed && isActive && (
                                <div className="ml-auto w-1.5 h-1.5 bg-accent rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border">
                <button className={cn(
                    "sidebar-item w-full text-red-400 hover:bg-red-500/10 hover:text-red-300",
                    collapsed && "justify-center px-0"
                )}>
                    <LogOut className="w-5 h-5" />
                    {!collapsed && <span>Cerrar Sesión</span>}
                </button>
            </div>
        </div>
    );
}
