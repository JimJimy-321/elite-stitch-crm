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
            "h-screen bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out relative z-50 shadow-xl",
            collapsed ? "w-20" : "w-64"
        )}>
            {/* Header */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20 group hover:rotate-12 transition-transform">
                    <Scissors className="text-white w-6 h-6" />
                </div>
                {!collapsed && (
                    <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="font-black text-xl tracking-tight text-foreground leading-none">
                            SastrePro
                        </span>
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-[9px] text-primary font-black uppercase tracking-[0.2em] bg-primary/10 px-1.5 py-0.5 rounded">
                                {role}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Theme Toggle */}
            {!collapsed && (
                <div className="px-6 mb-4 animate-in fade-in duration-500">
                    <button
                        onClick={() => setIsDark(!isDark)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-secondary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-secondary/80 border border-transparent hover:border-border"
                    >
                        <div className="flex items-center gap-2 text-muted-foreground">
                            {isDark ? <Moon size={14} className="text-primary" /> : <Sun size={14} className="text-amber-500" />}
                            <span>{isDark ? 'Modo Oscuro' : 'Modo Claro'}</span>
                        </div>
                        <div className={cn(
                            "w-8 h-4 bg-slate-300 dark:bg-slate-700 rounded-full relative transition-colors",
                            isDark && "bg-primary/40"
                        )}>
                            <div className={cn(
                                "absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm",
                                isDark && "translate-x-4 bg-primary"
                            )} />
                        </div>
                    </button>
                </div>
            )}

            {/* Nav Toggle Button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-all z-50 border-2 border-background"
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
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
                            <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                            {!collapsed && <span className="text-sm font-semibold tracking-tight">{item.label}</span>}
                            {!collapsed && isActive && (
                                <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Info & Logout */}
            <div className="p-4 border-t border-border bg-card/50">
                {!collapsed && (
                    <div className="flex items-center gap-3 px-2 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shadow-inner">
                            JI
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold truncate text-foreground">Juan Ibarra</span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter truncate">SastrePro Elite</span>
                        </div>
                    </div>
                )}
                <button className={cn(
                    "sidebar-item w-full text-red-500 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 group",
                    collapsed && "justify-center px-0"
                )}>
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    {!collapsed && <span className="text-sm font-bold uppercase tracking-widest text-[10px]">Cerrar Sesión</span>}
                </button>
            </div>
        </div>
    );
}

