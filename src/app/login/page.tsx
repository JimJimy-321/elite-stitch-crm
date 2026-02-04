"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scissors, Mail, Lock, Eye, EyeOff, ArrowRight, Github } from 'lucide-react';
import { useSupabaseAuth } from '@/features/auth/hooks/useSupabaseAuth';

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { signInWithEmail } = useSupabaseAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await signInWithEmail(email, password) as any;

            if (data?.profile?.role === 'super_admin') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row transition-colors duration-500 overflow-hidden">
            {/* Visual Side (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-orange-900 to-orange-800 relative overflow-hidden items-center justify-center p-20">
                {/* Dynamic Background Effects */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-600/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 w-full max-w-2xl">
                    <div className="w-24 h-24 bg-orange-500 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-3xl shadow-orange-500/40 rotate-12 hover:rotate-0 transition-all duration-700 border border-orange-400">
                        <Scissors size={48} className="text-white" />
                    </div>

                    <h1 className="text-7xl font-black text-white mb-8 tracking-tighter leading-none">
                        Sastre<span className="text-orange-500">Pro</span>
                        <span className="block text-2xl font-bold text-slate-400 tracking-normal mt-4">Intelligence & CRM</span>
                    </h1>

                    <p className="text-slate-400 text-xl max-w-lg leading-relaxed font-medium">
                        Impulsando la eficiencia operativa de las sastrerías modernas con <span className="text-white font-bold">Inteligencia Artificial</span> y gestión omnicanal.
                    </p>

                    <div className="mt-16 grid grid-cols-3 gap-12 border-t border-white/[0.05] pt-16">
                        <div className="space-y-1">
                            <p className="text-4xl font-black text-white tracking-tighter">450+</p>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-orange-500/70">Sucursales</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-4xl font-black text-white tracking-tighter">12k</p>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-orange-500/70">Tickets Hoy</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-4xl font-black text-white tracking-tighter">99%</p>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-orange-500/70">Satisfacción</p>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 right-0 p-12 opacity-10">
                    <div className="text-[120px] font-black text-white select-none pointer-events-none">SASTRE</div>
                </div>
            </div>

            {/* Form Side */}
            <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 py-12 relative bg-white">
                <div className="max-w-md w-full mx-auto">
                    <div className="lg:hidden flex items-center gap-4 mb-12">
                        <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/20">
                            <Scissors size={28} className="text-white" />
                        </div>
                        <span className="text-3xl font-black tracking-tighter text-slate-900">SastrePro</span>
                    </div>

                    <div className="mb-12">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Bienvenido</h2>
                        <p className="text-slate-500 font-medium">Ingresa tus credenciales para acceder al núcleo de tu negocio.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        {error && (
                            <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-2xl text-sm font-bold">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Profesional</label>
                            <div className="relative group">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 flex justify-center text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nombre@empresa.com"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] pl-12 pr-4 py-4.5 outline-none focus:bg-white focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/5 transition-all text-slate-900 font-bold placeholder:text-slate-300"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contraseña de Acceso</label>
                                <a href="#" className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline decoration-2">¿Olvidaste tu clave?</a>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 flex justify-center text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                    <Lock size={20} />
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
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-orange-600 text-white py-5 rounded-[1.25rem] font-black text-xs uppercase tracking-[0.3em] group relative overflow-hidden shadow-2xl shadow-orange-600/20 hover:bg-orange-700 hover:shadow-orange-500/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                            ) : (
                                <span className="flex items-center justify-center gap-4">
                                    Iniciar Sesión Directa
                                    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" />
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-12 border-t border-slate-50 space-y-6">
                        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Autenticación Segura Corporativa</p>
                        <button className="w-full flex items-center justify-center gap-4 bg-white border border-slate-100 py-4.5 rounded-[1.25rem] hover:bg-slate-50 hover:border-slate-200 transition-all font-black text-[11px] uppercase tracking-widest text-slate-600 shadow-sm">
                            <Github size={20} className="text-slate-900" />
                            Acceder con GitHub Enterprise
                        </button>
                    </div>

                    <p className="mt-12 text-center text-xs font-medium text-slate-500">
                        ¿Requieres soporte profesional? <span className="text-orange-600 font-bold cursor-pointer hover:underline">SastrePro Concierge</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
