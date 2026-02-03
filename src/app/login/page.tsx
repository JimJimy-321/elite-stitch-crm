"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scissors, Mail, Lock, Eye, EyeOff, ArrowRight, Github } from 'lucide-react';
import { useAuthStore, UserRole } from '@/features/auth/store/authStore';

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { setUser } = useAuthStore();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulación de login con redirección basada en rol
        setTimeout(() => {
            let role: UserRole = 'manager';
            let redirectPath = '/dashboard';

            if (email.includes('admin')) {
                role = 'superadmin';
                redirectPath = '/admin';
            } else if (email.includes('owner')) {
                role = 'owner';
                redirectPath = '/dashboard';
            }

            const mockUser = {
                id: '1',
                name: email.split('@')[0],
                email: email,
                role: role
            };

            setUser(mockUser);
            router.push(redirectPath);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col lg:flex-row transition-colors duration-500">
            {/* Visual Side (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-950 relative overflow-hidden items-center justify-center p-20">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent.cyan/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 text-center">
                    <div className="w-24 h-24 bg-accent rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-accent/40 rotate-12">
                        <Scissors size={48} className="text-white -rotate-12" />
                    </div>
                    <h1 className="text-5xl font-black text-white mb-6 tracking-tight">
                        Sastre<span className="text-accent">Pro</span>
                    </h1>
                    <p className="text-slate-400 text-xl max-w-md mx-auto leading-relaxed">
                        La plataforma definitiva para la gestión de sastrerías y negocios textiles a gran escala.
                    </p>

                    <div className="mt-12 grid grid-cols-3 gap-8 border-t border-slate-800 pt-12">
                        <div>
                            <p className="text-3xl font-bold text-white">450+</p>
                            <p className="text-slate-500 text-sm">Sucursales</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">12k</p>
                            <p className="text-slate-500 text-sm">Tickets Hoy</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">99%</p>
                            <p className="text-slate-500 text-sm">Satisfacción</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Side */}
            <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 py-12 relative">
                <div className="max-w-md w-full mx-auto">
                    <div className="lg:hidden flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                            <Scissors size={24} className="text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">SastrePro</span>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-3xl font-extrabold text-foreground mb-2">Bienvenido de nuevo</h2>
                        <p className="text-muted">Ingresa tus credenciales para acceder a tu panel.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted uppercase tracking-widest ml-1">Email Corporativo</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ejemplo@sastrepro.com"
                                    className="w-full bg-slate-100 dark:bg-slate-800 border border-border rounded-xl pl-12 pr-4 py-3.5 outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all text-foreground"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-sm font-bold text-muted uppercase tracking-widest">Contraseña</label>
                                <a href="#" className="text-xs font-bold text-accent hover:underline">¿La olvidaste?</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-100 dark:bg-slate-800 border border-border rounded-xl pl-12 pr-12 py-3.5 outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all text-foreground"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary py-4 text-lg font-bold group relative overflow-hidden"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Entrar al Sistema
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-border space-y-4">
                        <p className="text-center text-sm text-muted">O accede con tu cuenta profesional</p>
                        <button className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-border py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-semibold">
                            <Github size={20} />
                            Continuar con GitHub
                        </button>
                    </div>

                    <p className="mt-10 text-center text-sm text-muted">
                        ¿No tienes cuenta? <span className="text-accent font-bold cursor-pointer hover:underline">Contactar a SastrePro Ventas</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
