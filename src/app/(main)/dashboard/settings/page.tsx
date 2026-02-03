"use client";

import React from 'react';
import { Settings as SettingsIcon, Bell, Lock, Smartphone, Palette, Database, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export default function SettingsPage() {
    return (
        <div className="max-w-4xl space-y-8 animate-fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                        <SettingsIcon className="text-orange-600" size={28} />
                    </div>
                    Configuración Global
                </h1>
                <p className="text-muted-foreground text-sm font-medium">Ajustes generales, seguridad y personalización avanzada de SastrePro.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <SettingsGroup
                    icon={Palette}
                    title="Personalización Visual"
                    description="Ajusta el tema oscuro/claro, colores de marca y logotipos de tus sucursales."
                    badge="Marketing"
                />
                <SettingsGroup
                    icon={Smartphone}
                    title="Conectividad WhatsApp"
                    description="Vincula tu número oficial mediante Gateway para el Agente de IA Ingestor."
                    badge="Crítico"
                />
                <SettingsGroup
                    icon={Bell}
                    title="Alertas y Notificaciones"
                    description="Gestiona las alertas push y SMS para tickets listos y cierres de caja."
                />
                <SettingsGroup
                    icon={Lock}
                    title="Seguridad y Roles"
                    description="Administra permisos granulares, 2FA y sesiones activas del personal."
                />
                <SettingsGroup
                    icon={Database}
                    title="Infraestructura Supabase"
                    description="Credenciales API, monitoreo de RLS y logs de auditoría técnica."
                />
            </div>

            {/* AI Suggestion Banner */}
            <div className="glass-card p-10 bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent border-l-[6px] border-l-orange-500 flex flex-col md:flex-row items-center justify-between group gap-8 shadow-2xl shadow-orange-500/10 rounded-[2.5rem] border-none">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-inner">
                        <Sparkles size={32} className="text-orange-500 animate-pulse" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-foreground tracking-tight">Asistente de Configuración IA</h4>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.1em] mt-2">Optimiza tu flujo de trabajo con recomendaciones inteligentes</p>
                    </div>
                </div>
                <button className="px-10 py-5 bg-orange-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/30 hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all">
                    Iniciar Consultoría IA
                </button>
            </div>
        </div>
    );
}

function SettingsGroup({ icon: Icon, title, description, badge }: any) {
    return (
        <div className="glass-card p-1 group cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.01] border-none shadow-xl bg-card">
            <div className="p-8 flex items-center gap-10 bg-card hover:bg-slate-50/50 transition-colors">
                <div className="p-5 bg-orange-50 rounded-[1.5rem] border border-orange-100 text-orange-600 group-hover:text-orange-700 group-hover:bg-orange-100 group-hover:border-orange-200 transition-all shadow-inner">
                    <Icon size={32} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-xl font-black text-foreground tracking-tight group-hover:text-orange-600 transition-colors">{title}</h3>
                        {badge && (
                            <span className="px-2.5 py-1 bg-orange-500/10 text-orange-600 text-[8px] font-black uppercase tracking-[0.15em] rounded-lg border border-orange-500/10 shadow-sm">
                                {badge}
                            </span>
                        )}
                    </div>
                    <p className="text-sm font-bold text-muted-foreground group-hover:text-slate-600 transition-colors leading-relaxed">
                        {description}
                    </p>
                </div>
                <div className="flex items-center gap-5">
                    <span className="hidden lg:block text-[10px] font-black text-orange-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                        Gestionar Ajustes
                    </span>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:text-white transition-all shadow-sm">
                        <ChevronRight size={20} />
                    </div>
                </div>
            </div>
        </div>
    );
}

