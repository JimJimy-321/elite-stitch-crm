"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { Search, Bell, User, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex bg-background min-h-screen text-foreground font-sans">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4 bg-secondary/50 px-4 py-2 rounded-xl border border-border w-96">
            <Search className="text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar tickets, clientes..."
              className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted w-full"
            />
          </div>

          <div className="flex items-center gap-6">
            {/* Branch Selector (Simulado) */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg border border-border cursor-pointer hover:bg-secondary/80 transition-colors">
              <span className="text-xs font-medium text-muted uppercase">Sede:</span>
              <span className="text-sm font-semibold">Matriz Norte</span>
              <ChevronDown size={14} className="text-muted" />
            </div>

            <button className="relative text-muted hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full border-2 border-background" />
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-border cursor-pointer group">
              <div className="text-right">
                <p className="text-sm font-bold group-hover:text-accent transition-colors">Juan Ibarra</p>
                <p className="text-xs text-muted font-medium">Dueño (Elite)</p>
              </div>
              <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center border border-accent/30 overflow-hidden">
                <User className="text-accent w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
