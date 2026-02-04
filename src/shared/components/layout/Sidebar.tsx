"use client";

import React, { useState } from 'react';
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
    Sparkles,
    Activity
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useSupabaseAuth } from '@/features/auth/hooks/useSupabaseAuth';

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    role: 'super_admin' | 'owner' | 'manager';
}

export function Sidebar({ collapsed, setCollapsed, role }: SidebarProps) {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const { signOut } = useSupabaseAuth();

    const menuByRole = {
        super_admin: [
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
            { icon: Sparkles, label: 'Inteligencia', href: '/dashboard/intelligence' },
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
            <div className="p-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl shadow-orange-500/40 group hover:rotate-6 transition-all border border-orange-400">
                    <Scissors className="text-white w-6 h-6" />
                </div>
                {!collapsed && (
                    <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="font-black text-2xl tracking-tighter text-foreground leading-none">
                            SastrePro
                        </span>
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-[9px] text-orange-600 font-black uppercase tracking-[0.25em] bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100 uppercase">
                                {role?.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Nav Toggle Button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-24 w-7 h-7 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 shadow-xl hover:text-orange-500 hover:scale-110 active:scale-95 transition-all z-50 hover:border-orange-500/30"
            >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {currentMenu.map((item: any) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative",
                                isActive
                                    ? "bg-white shadow-xl shadow-slate-200/50 border border-slate-100 text-orange-600"
                                    : "text-slate-400 hover:bg-white/50 hover:text-slate-600",
                                collapsed && "justify-center px-0"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 transition-all duration-300", isActive ? "text-orange-500 scale-110" : "group-hover:scale-110")} />
                            {!collapsed && <span className="text-sm font-black tracking-tight">{item.label}</span>}
                            {!collapsed && isActive && (
                                <div className="ml-auto w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Info & Logout */}
            <div className="p-6 border-t border-slate-50 bg-slate-50/30">
                {!collapsed && (
                    <div className="flex items-center gap-4 px-2 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-100 flex items-center justify-center text-orange-600 font-black text-xs shadow-inner uppercase">
                            {user?.full_name?.substring(0, 2) || 'SP'}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-black truncate text-foreground tracking-tight">{user?.full_name || 'Usuario'}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
                                {user?.role === 'super_admin' ? 'Infraestructura' : 'SastrePro Elite'}
                            </span>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => signOut()}
                    className={cn(
                        "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group w-full text-rose-500 hover:bg-rose-50 hover:text-rose-600",
                        collapsed && "justify-center px-0"
                    )}
                >
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    {!collapsed && <span className="text-[10px] font-black uppercase tracking-[0.2em]">Cerrar Sesión</span>}
                </button>
            </div>
        </div>
    );
}
