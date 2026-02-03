"use client";

import React from 'react';
import { Settings as SettingsIcon, Bell, Lock, Smartphone, Palette, Database, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export default function SettingsPage() {
    return (
        <div className="max-w-4xl space-y-8 animate-fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                        <SettingsIcon className="text-primary" size={28} />
                    </div>
                    Configuración del Sistema
                </h1>
                <p className="text-muted-foreground text-sm">Ajustes generales, seguridad y personalización avanzada de SastrePro.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <SettingsGroup
                    icon={Palette}
                    title="Personalización Visual"
                    description="Ajusta el tema oscuro/claro, colores de marca y logotipos de tus sucursales."
                    badge="UI/UX"
                />
                <SettingsGroup
                    icon={Smartphone}
                    title="Conectividad WhatsApp"
                    description="Vincula tu número oficial mediante Gateway para el Agente de IA Ingestor."
                    badge="Critical"
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
            <div className="glass-card p-6 bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-l-primary flex items-center justify-between group">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles size={24} className="text-primary animate-pulse" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-foreground">Asistente de Configuración IA</h4>
                        <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mt-1">¿Necesitas ayuda para optimizar tu flujo de trabajo?</p>
                    </div>
                </div>
                <button className="px-6 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                    Iniciar Consultoría
                </button>
            </div>
        </div>
    );
}

function SettingsGroup({ icon: Icon, title, description, badge }: any) {
    return (
        <div className="glass-card p-1 group cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.01]">
            <div className="p-8 flex items-center gap-8 bg-card/50 hover:bg-card transition-colors">
                <div className="p-4 bg-secondary rounded-2xl border border-border text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 group-hover:border-primary/20 transition-all shadow-inner">
                    <Icon size={28} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-black text-foreground tracking-tight">{title}</h3>
                        {badge && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded-md border border-primary/20">
                                {badge}
                            </span>
                        )}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors leading-relaxed">
                        {description}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="hidden sm:block text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                        Gestionar
                    </span>
                    <div className="p-2.5 bg-secondary rounded-xl border border-border group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all shadow-sm">
                        <ChevronRight size={18} />
                    </div>
                </div>
            </div>
        </div>
    );
}

