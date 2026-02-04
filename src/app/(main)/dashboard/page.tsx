"use client";

import React from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { OwnerDashboard } from '@/features/dashboard/components/OwnerDashboard';
import { ManagerDashboard } from '@/features/dashboard/components/ManagerDashboard';
import { Shield, Activity, Database, Server } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) return null;

  // Detección de rol y renderizado condicional del panel correspondiente
  if (user.role === 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-indigo-500/10 rounded-[2.5rem] flex items-center justify-center border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
          <Shield size={48} className="text-indigo-600" />
        </div>
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-4xl font-black tracking-tight text-foreground">Acceso de Infraestructura</h1>
          <p className="text-muted-foreground font-medium leading-relaxed">
            Como <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Super Admin</span>, tu panel principal de gestión se encuentra en la infraestructura global.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <Link href="/admin" className="p-6 glass-card border-none hover:bg-indigo-50 transition-all group">
            <Activity className="text-indigo-600 mb-4 group-hover:scale-110 transition-transform" />
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Ir a Admin</p>
          </Link>
          <Link href="/admin/settings" className="p-6 glass-card border-none hover:bg-indigo-50 transition-all group">
            <Server className="text-indigo-600 mb-4 group-hover:scale-110 transition-transform" />
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Sistemas</p>
          </Link>
        </div>
      </div>
    );
  }

  if (user.role === 'manager') {
    return <ManagerDashboard user={user} />;
  }

  // Por defecto (Owner o cualquier otro rol autorizado en (main))
  return <OwnerDashboard user={user} />;
}
