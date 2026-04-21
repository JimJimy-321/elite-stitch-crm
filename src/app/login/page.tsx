"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Scissors, Mail, Lock, Eye, EyeOff, ArrowRight, Monitor, UserCircle2 } from 'lucide-react';
import { useSupabaseAuth } from '@/features/auth/hooks/useSupabaseAuth';
import { translateError } from '@/shared/lib/error-handler';
import { cn } from '@/shared/lib/utils';
import { PinKeypad } from '@/shared/components/PinKeypad';
import { getDeviceToken, getAuthorizedBranch, setAuthorizedBranch } from '@/features/auth/lib/device-auth';

type LoginMode = 'owner' | 'terminal';

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<LoginMode>('owner');
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [authorizedBranch, setAuthorizedBranchData] = useState<{ id: string, name: string } | null>(null);

    const { signInWithEmail, signOut } = useSupabaseAuth();

    useEffect(() => {
        // Detectar si este dispositivo ya está autorizado para una sucursal
        const branch = getAuthorizedBranch();
        if (branch) {
            setAuthorizedBranchData(branch);
            setMode('terminal'); // Default a terminal si ya está autorizado
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await signInWithEmail(email, password) as any;
            const profile = data?.profile;

            // Bloquear acceso a encargados en modo Dueño
            if (mode === 'owner' && profile?.role !== 'owner' && profile?.role !== 'super_admin') {
                await signOut();
                throw new Error('Este acceso es exclusivo para dueños. Por favor usa la Terminal de Sucursal.');
            }

            if (profile?.role === 'super_admin' || profile?.role === 'owner') {
                router.push('/dashboard');
            } else {
                router.push('/dashboard/notas');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(translateError(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handlePinComplete = async (pin: string) => {
        if (!authorizedBranch) {
            setError('Dispositivo no vinculado a ninguna sucursal.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const deviceToken = getDeviceToken();
            
            if (!deviceToken) {
                throw new Error('Este dispositivo no está autorizado. Contacta al administrador.');
            }

            const response = await fetch('/api/auth/pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pin,
                    branchId: authorizedBranch.id,
                    deviceToken
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error de autenticación');
            }

            // Si el login fue exitoso, el API nos devuelve un link de redirección o sesión
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
            } else {
                router.push('/dashboard');
            }

        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row transition-colors duration-500 overflow-hidden" suppressHydrationWarning={true}>
            {/* Visual Side */}
            <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-slate-950 to-slate-900 relative overflow-hidden items-center justify-center p-20">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-600/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 w-full max-w-lg">
                    <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mb-10 shadow-3xl shadow-orange-500/40 rotate-12 transition-all duration-700">
                        <Scissors size={40} className="text-white" suppressHydrationWarning />
                    </div>

                    <h1 className="text-6xl font-black text-white mb-6 tracking-tighter leading-none">
                        Sastre<span className="text-orange-500">Pro</span>
                    </h1>

                    <p className="text-slate-400 text-lg leading-relaxed font-medium mb-12">
                        La inteligencia detrás de la sastrería moderna. 
                        {mode === 'terminal' ? ' Acceso rápido para el personal de sucursal.' : ' Gestión integral para dueños y administradores.'}
                    </p>

                    <div className="grid grid-cols-1 gap-4">
                        <button 
                            onClick={() => setMode('owner')}
                            className={cn(
                                "flex items-center gap-4 p-6 rounded-3xl border-2 transition-all group",
                                mode === 'owner' 
                                    ? "bg-white/5 border-orange-500/50 text-white shadow-xl shadow-orange-500/5" 
                                    : "bg-transparent border-white/5 text-slate-500 hover:bg-white/5"
                            )}
                        >
                            <UserCircle2 className={cn(mode === 'owner' ? "text-orange-500" : "text-slate-600")} size={32} />
                            <div className="text-left">
                                <div className="text-sm font-black uppercase tracking-widest">PORTAL ADMINISTRATIVO</div>
                                <div className="text-[10px] font-bold opacity-60 uppercase">DUEÑOS Y GERENTES GENERALES</div>
                            </div>
                        </button>

                        <button 
                            onClick={() => setMode('terminal')}
                            className={cn(
                                "flex items-center gap-4 p-6 rounded-3xl border-2 transition-all group",
                                mode === 'terminal' 
                                    ? "bg-white/5 border-orange-500/50 text-white shadow-xl shadow-orange-500/5" 
                                    : "bg-transparent border-white/5 text-slate-500 hover:bg-white/5"
                            )}
                        >
                            <Monitor className={cn(mode === 'terminal' ? "text-orange-500" : "text-slate-600")} size={32} />
                            <div className="text-left">
                                <div className="text-sm font-black uppercase tracking-widest">TERMINAL DE SUCURSAL</div>
                                <div className="text-[10px] font-bold opacity-60 uppercase">ENCARGADOS Y PERSONAL DE PISO</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Form Side */}
            <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 py-12 relative bg-white">
                <div className="max-w-md w-full mx-auto">
                    {/* Botones de modo móvil */}
                    <div className="lg:hidden flex gap-2 mb-12">
                        <button 
                            onClick={() => setMode('owner')}
                            className={cn("flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border-2", mode === 'owner' ? "bg-orange-500 text-white border-orange-500" : "text-slate-400 border-slate-100")}
                        >
                            ADMINISTRADOR
                        </button>
                        <button 
                            onClick={() => setMode('terminal')}
                            className={cn("flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border-2", mode === 'terminal' ? "bg-orange-500 text-white border-orange-500" : "text-slate-400 border-slate-100")}
                        >
                            PERSONAL
                        </button>
                    </div>

                    {mode === 'owner' ? (
                        <div className="animate-in slide-in-from-right-10 duration-500">
                            <div className="mb-12">
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3 uppercase">INGRESO DUEÑO</h2>
                                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest leading-relaxed">GESTIONA TU NEGOCIO Y ANALIZA EL RENDIMIENTO DE TUS SUCURSALES.</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-2xl text-sm font-bold">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">EMAIL PROFESIONAL</label>
                                    <div className="relative group">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 flex justify-center text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                            <Mail size={20} suppressHydrationWarning />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="dueño@sastrepro.com"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] pl-12 pr-4 py-4.5 outline-none focus:bg-white focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/5 transition-all text-slate-900 font-bold placeholder:text-slate-300"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">CONTRASEÑA</label>
                                        <a href="#" className="text-[10px] font-black text-orange-600 uppercase tracking-widest">¿OLVIDASTE TU CLAVE?</a>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 flex justify-center text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                            <Lock size={20} suppressHydrationWarning />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] pl-12 pr-12 py-4.5 outline-none focus:bg-white focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/5 transition-all text-slate-900 font-bold placeholder:text-slate-300"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 w-12 flex justify-center text-slate-300 hover:text-orange-500 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} suppressHydrationWarning /> : <Eye size={20} suppressHydrationWarning />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-orange-600 text-white py-5 rounded-[1.25rem] font-black text-xs uppercase tracking-[0.3em] group relative overflow-hidden shadow-2xl shadow-orange-600/20 hover:bg-orange-700 hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
                                >
                                    <span className="flex items-center justify-center gap-4">
                                        ENTRAR AL PANEL
                                        <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" />
                                    </span>
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-left-10 duration-500">
                            <PinKeypad 
                                onComplete={handlePinComplete}
                                loading={isLoading}
                                error={error}
                                title={authorizedBranch?.name ? `Sucursal: ${authorizedBranch.name}` : "Ingresa tu PIN"}
                            />
                        </div>
                    )}

                    <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col items-center gap-4">
                        <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-[0.2em]">
                            Protegido por SastrePro Artificial Intelligence & Security
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
