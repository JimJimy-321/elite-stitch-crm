"use client";

import React, { useState, useEffect } from 'react';
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
    Store,
    ShieldCheck,
    UserCog,
    Megaphone,
    CreditCard,
    Sun,
    Moon
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    role: 'superadmin' | 'owner' | 'manager';
}

export function Sidebar({ collapsed, setCollapsed, role }: SidebarProps) {
    const pathname = usePathname();
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) root.classList.add('dark');
        else root.classList.remove('dark');
    }, [isDark]);

    const menuByRole = {
        superadmin: [
            { icon: ShieldCheck, label: 'Admin Global', href: '/admin' },
            { icon: UserCog, label: 'Dueños', href: '/admin/owners' },
            { icon: MessageSquare, label: 'API WhatsApp', href: '/admin/whatsapp' },
            { icon: Settings, label: 'Parámetros', href: '/admin/settings' },
        ],
        owner: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
            { icon: Store, label: 'Sucursales', href: '/dashboard/branches' },
            { icon: UserCog, label: 'Encargados', href: '/dashboard/managers' },
            { icon: Megaphone, label: 'Marketing', href: '/dashboard/marketing' },
            { icon: CreditCard, label: 'Membresía', href: '/dashboard/billing' },
            { icon: Settings, label: 'Ajustes', href: '/dashboard/settings' },
        ],
        manager: [
            { icon: LayoutDashboard, label: 'Operativo', href: '/dashboard' },
            { icon: Ticket, label: 'Tickets', href: '/dashboard/tickets' },
            { icon: Users, label: 'Clientes', href: '/dashboard/clients' },
            { icon: Wallet, label: 'Caja', href: '/dashboard/finance' },
            { icon: MessageSquare, label: 'Mensajes', href: '/dashboard/messages' },
        ]
    };

    const currentMenu = menuByRole[role] || menuByRole.manager;

    return (
        <div className={cn(
            "h-screen bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out relative",
            collapsed ? "w-20" : "w-64"
        )}>
            {/* Header */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/20">
                    <Scissors className="text-white w-6 h-6" />
                </div>
                {!collapsed && (
                    <div className="flex flex-col">
                        <span className="font-bold text-xl tracking-tight text-foreground leading-none">
                            SastrePro
                        </span>
                        <span className="text-[10px] text-accent font-bold uppercase tracking-widest mt-1">
                            {role}
                        </span>
                    </div>
                )}
            </div>

            {/* Theme Toggle */}
            {!collapsed && (
                <div className="px-6 mb-4">
                    <button
                        onClick={() => setIsDark(!isDark)}
                        className="w-full flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold transition-all"
                    >
                        <div className="flex items-center gap-2 text-muted">
                            {isDark ? <Moon size={14} /> : <Sun size={14} />}
                            <span>{isDark ? 'Modo Oscuro' : 'Modo Claro'}</span>
                        </div>
                        <div className={cn(
                            "w-8 h-4 bg-slate-200 dark:bg-slate-700 rounded-full relative transition-colors",
                            isDark && "bg-accent"
                        )}>
                            <div className={cn(
                                "absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform",
                                isDark && "translate-x-4"
                            )} />
                        </div>
                    </button>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform z-50"
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto overflow-x-hidden">
                {currentMenu.map((item) => {
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

            {/* User Info & Logout */}
            <div className="p-4 border-t border-border">
                {!collapsed && (
                    <div className="flex items-center gap-3 px-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold text-xs">
                            JI
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold truncate">Juan Ibarra</span>
                            <span className="text-[10px] text-muted truncate">Admin Plan Pro</span>
                        </div>
                    </div>
                )}
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
