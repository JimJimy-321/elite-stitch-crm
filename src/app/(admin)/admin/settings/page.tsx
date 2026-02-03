"use client";

import React from 'react';
import { Settings, Save, Database, Globe, Lock, Cpu } from 'lucide-react';

export default function SaaSParametersPage() {
    return (
        <div className="space-y-8 animate-fade-in max-w-4xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                        <Settings className="text-orange-600" size={28} />
                    </div>
                    Parámetros Globales del SaaS
                </h1>
                <p className="text-muted-foreground text-sm font-medium">Configuración crítica de la infraestructura y límites de planes.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <ParamGroup title="Plan Básico" limits="1 Sucursal, 100 Clientes, No WhatsApp" />
                <ParamGroup title="Plan Profesional" limits="5 Sucursales, Clientes ilimitados, WhatsApp Incluido" />
                <ParamGroup title="Seguridad de Sesión" limits="JWT 24h, MFA habilitado, Rate Limit: 100 req/min" />
            </div>

            <div className="glass-card bg-card border-none shadow-2xl p-10 space-y-8 rounded-[2.5rem]">
                <div className="flex items-center gap-4 text-orange-600">
                    <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                        <Database size={24} />
                    </div>
                    <h3 className="text-xl font-black tracking-tight text-foreground">Mantenimiento de Datos</h3>
                </div>
                <p className="text-sm font-bold text-muted-foreground leading-relaxed max-w-2xl">
                    Define los periodos de retención de logs y backups automáticos. Actualmente los tickets se archivan después de 24 meses de inactividad para optimizar el rendimiento de la base de datos global.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                    <button className="px-10 py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-orange-500/30 hover:bg-orange-600 transition-all active:scale-95">
                        <Save size={16} />
                        Guardar Configuración
                    </button>
                    <button className="px-10 py-4 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-orange-600 hover:border-orange-500/30 transition-all">
                        Restaurar Valores por Defecto
                    </button>
                </div>
            </div>
        </div>
    );
}

function ParamGroup({ title, limits }: any) {
    return (
        <div className="glass-card bg-card p-6 flex items-center justify-between border-none shadow-xl hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center gap-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-[1.25rem] border border-slate-100 shadow-inner group-hover:bg-orange-50 transition-colors">
                    <Cpu size={24} className="text-slate-400 group-hover:text-orange-600 transition-colors" />
                </div>
                <div>
                    <h4 className="text-lg font-black text-foreground tracking-tight">{title}</h4>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{limits}</p>
                </div>
            </div>
            <button className="px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 hover:bg-orange-50 rounded-xl transition-all border border-transparent hover:border-orange-500/20">
                Configurar
            </button>
        </div>
    );
}
