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
  const userRole: 'superadmin' | 'owner' | 'manager' = 'superadmin'; // Cambiado a superadmin para validar flujo inicial

  return (
    <div className="flex bg-background min-h-screen text-foreground transition-colors duration-300">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} role={userRole} />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4 bg-secondary px-4 py-2.5 rounded-2xl border border-border w-96 transition-all focus-within:ring-2 focus-within:ring-primary/20 shadow-inner">
            <Search className="text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar tickets, clientes..."
              className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-full font-medium"
            />
          </div>

          <div className="flex items-center gap-6">
            {/* SaaS Status Badge */}
            {((userRole as string) === 'owner' || (userRole as string) === 'superadmin') && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full group cursor-pointer hover:bg-primary/20 transition-all">
                <Sparkles size={14} className="text-primary animate-pulse" />
                <span className="text-[10px] font-black text-primary uppercase tracking-tighter">
                  {userRole === 'superadmin' ? 'Infraestructura SastrePro' : 'Suscripción Pro Activa'}
                </span>
              </div>
            )}

            <div className="h-8 w-px bg-border mx-2" />

            <button className="relative p-2.5 text-muted-foreground hover:text-primary transition-all bg-secondary rounded-xl border border-border hover:border-primary/30 shadow-sm active:scale-90">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-bounce" />
            </button>

            <div className="flex items-center gap-2 pl-4 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black group-hover:text-primary transition-colors leading-none mb-1 text-foreground">Juan Ibarra</p>
                <div className="flex items-center justify-end gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.1em]">En línea</span>
                </div>
              </div>
              <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center border-2 border-primary/20 overflow-hidden group-hover:scale-110 active:scale-95 transition-all shadow-lg shadow-primary/20">
                <User className="text-white w-6 h-6" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-secondary/30">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

