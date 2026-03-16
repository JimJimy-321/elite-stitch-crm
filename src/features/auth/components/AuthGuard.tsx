'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useSupabaseAuth } from '@/features/auth/hooks/useSupabaseAuth';
import { Scissors } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isInitialized } = useAuthStore();
    useSupabaseAuth(); // Initialize auth listener

    if (!isInitialized) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
                <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/40 animate-bounce">
                    <Scissors className="text-white w-8 h-8" />
                </div>
                <p className="mt-4 text-sm font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">
                    Cargando SastrePro...
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
