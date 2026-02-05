"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { Search, Bell, User, ChevronDown, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useSupabaseAuth } from '@/features/auth/hooks/useSupabaseAuth';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuthStore();

  const isSearchHidden = pathname === '/dashboard' || pathname?.startsWith('/dashboard/tickets');

  // Inicializar sincronización con Supabase
  useSupabaseAuth();

  // Proteger ruta
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  const userRole = user.role;

  return (
    <div className="flex bg-slate-50 min-h-screen text-foreground transition-colors duration-300">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} role={userRole} />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 border-b border-slate-100 bg-white/80 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-40 shadow-sm">
          {!isSearchHidden ? (
            <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 w-96 transition-all focus-within:ring-4 focus-within:ring-orange-500/10 focus-within:border-orange-500/30 shadow-inner">
              <Search className="text-slate-300 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar tickets, clientes o facturas..."
                className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-slate-300 w-full font-bold"
              />
            </div>
          ) : <div />}

          <div className="flex items-center gap-6">
            {/* SaaS Status Badge */}
            {(userRole === 'owner' || userRole === 'super_admin') && (
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-orange-500/5 border border-orange-500/20 rounded-full group cursor-pointer hover:bg-orange-500/10 transition-all shadow-sm">
                <Sparkles size={14} className="text-orange-600 animate-pulse" />
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">
                  {userRole === 'super_admin' ? 'Infraestructura SastrePro' : 'Suscripción Pro Activa'}
                </span>
              </div>
            )}

            <div className="h-10 w-px bg-slate-100 mx-2" />

            <button className="relative p-3 text-slate-400 hover:text-orange-600 transition-all bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-500/30 shadow-sm active:scale-90 hover:bg-white">
              <Bell size={22} />
              <span className="absolute top-3 right-3 w-3 h-3 bg-rose-500 rounded-full border-4 border-white shadow-lg animate-bounce" />
            </button>

            <div className="flex items-center gap-4 pl-4 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-[15px] font-black group-hover:text-orange-600 transition-colors leading-none mb-1 text-foreground">{user?.full_name}</p>
                <div className="flex items-center justify-end gap-1.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">En línea</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden group-hover:scale-110 active:scale-95 transition-all shadow-xl shadow-slate-200/50 group-hover:border-orange-500/30">
                <div className="w-full h-full bg-orange-500 flex items-center justify-center">
                  <User className="text-white w-7 h-7" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50/50">
          <div className="max-w-[1700px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
