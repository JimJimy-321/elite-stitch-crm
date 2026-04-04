"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { Search, Bell, User, ChevronDown, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { Scissors } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuthStore();

  const isSearchHidden = pathname === '/dashboard' || pathname?.startsWith('/dashboard/notas');

  if (!user) return null;

  const userRole = user.role;

  return (
    <AuthGuard>
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
                  placeholder="Buscar notas, clientes o facturas..."
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

              <div className="flex items-center gap-4 pl-4 group opacity-0 pointer-events-none">
                <div className="text-right hidden sm:block">
                  <p className="text-[15px] font-black group-hover:text-orange-600 transition-colors leading-none mb-1 text-foreground">{user?.full_name}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div 
            id="main-content-area"
            className={cn(
                "flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50",
                pathname === '/dashboard/mensajes' ? "p-0" : "p-10"
            )}
          >
            <div className="max-w-[1700px] mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
