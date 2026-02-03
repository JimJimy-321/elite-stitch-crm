"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { Shield, Bell, User } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex bg-background-light dark:bg-background-dark min-h-screen text-foreground transition-colors duration-300">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} role="superadmin" />

            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <header className="h-20 border-b border-border bg-slate-900 text-white flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <Shield className="text-accent" size={24} />
                        <h2 className="font-bold text-lg tracking-tight uppercase tracking-widest text-slate-400">Panel de Control Global</h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/10">
                            <Bell size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-bold leading-none mb-1">Super Admin</p>
                                <span className="text-[10px] text-accent font-bold uppercase tracking-widest">Root Access</span>
                            </div>
                            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center border border-accent/30 font-bold">SA</div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
}
