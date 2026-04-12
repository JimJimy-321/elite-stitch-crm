"use client";

import React, { useMemo, Suspense } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { OwnerDashboard } from '@/features/dashboard/components/OwnerDashboard';
import { ManagerDashboard } from '@/features/dashboard/components/ManagerDashboard';
import { Shield, Activity, Server, Store, ArrowLeft } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4 animate-pulse">
                <div className="w-12 h-12 bg-slate-100 rounded-full" />
                <div className="h-4 w-48 bg-slate-100 rounded" />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}

function DashboardContent() {
    const { user } = useAuthStore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const branchId = searchParams.get('branchId');

    if (!user) return null;

    // View for Super Admin
    if (user.role === 'super_admin' && !branchId) {
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

    // Main Conditional Rendering Logic
    return (
        <div className="space-y-6">
            {user.role !== 'manager' && branchId && (
                <div className="flex items-center justify-between bg-orange-500/5 p-4 rounded-2xl border border-orange-500/10 backdrop-blur-sm animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/20">
                            <Store size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest leading-none mb-1">Modo Monitor Detallado</p>
                            <h2 className="text-sm font-black text-slate-900 tracking-tight">Estás visualizando el flujo operativo de la sede</h2>
                        </div>
                    </div>
                    <button 
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all active:scale-95 shadow-sm"
                    >
                        <ArrowLeft size={14} />
                        Volver al General
                    </button>
                </div>
            )}

            {((user.role as string) === 'manager') || branchId ? (
                <ManagerDashboard user={branchId ? { ...user, assigned_branch_id: branchId } : user} />
            ) : (
                <OwnerDashboard user={user} />
            )}
        </div>
    );
}

