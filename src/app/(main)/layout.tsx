"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { Search, Bell, User, ChevronDown, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  // Simulación de sesión - En producción vendría de Supabase Auth
  const userRole = 'owner';

  return (
    <div className="flex bg-background-light dark:bg-background-dark min-h-screen text-foreground transition-colors duration-300">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} role={userRole} />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 border-b border-border bg-card-light/50 dark:bg-card-dark/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800/50 px-4 py-2.5 rounded-2xl border border-border w-96 transition-all focus-within:ring-2 focus-within:ring-accent/20">
            <Search className="text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar tickets, clientes..."
              className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted w-full"
            />
          </div>

          <div className="flex items-center gap-6">
            {/* SaaS Status Badge (Solo Dueño) */}
            {userRole === 'owner' && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full">
                <Sparkles size={14} className="text-accent" />
                <span className="text-[10px] font-bold text-accent uppercase tracking-tighter">Suscripción Pro Activa</span>
              </div>
            )}

            <div className="h-8 w-px bg-border mx-2" />

            <button className="relative p-2 text-muted hover:text-foreground transition-colors bg-slate-100 dark:bg-slate-800 rounded-xl border border-border">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-card-light dark:border-card-dark" />
            </button>

            <div className="flex items-center gap-3 pl-4 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold group-hover:text-accent transition-colors leading-none mb-1">Juan Ibarra</p>
                <div className="flex items-center justify-end gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="text-[10px] text-muted font-bold uppercase">En línea</span>
                </div>
              </div>
              <div className="w-11 h-11 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/30 overflow-hidden group-hover:scale-105 transition-transform">
                <User className="text-accent w-6 h-6" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
