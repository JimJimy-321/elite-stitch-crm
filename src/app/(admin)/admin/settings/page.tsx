"use client";

import React from 'react';
import { Settings, Save, Database, Globe, Lock, Cpu } from 'lucide-react';

export default function SaaSParametersPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl text-white">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    <Settings className="text-accent" />
                    Parámetros Globales del SaaS
                </h1>
                <p className="text-slate-400 text-sm">Configuración crítica de la infraestructura y límites de planes.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <ParamGroup title="Plan Básico" limits="1 Sucursal, 100 Clientes, No WhatsApp" />
                <ParamGroup title="Plan Profesional" limits="5 Sucursales, Clientes ilimitados, WhatsApp Incluido" />
                <ParamGroup title="Seguridad de Sesión" limits="JWT 24h, MFA habilitado, Rate Limit: 100 req/min" />
            </div>

            <div className="glass-card bg-slate-900 p-8 border-white/5 space-y-6">
                <div className="flex items-center gap-3 text-accent mb-2">
                    <Database size={20} />
                    <h3 className="font-bold">Mantenimiento de Datos</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                    Define los periodos de retención de logs y backups automáticos. Actualmente los tickets se archivan después de 24 meses de inactividad.
                </p>
                <div className="flex gap-4">
                    <button className="px-6 py-2.5 bg-accent text-white rounded-xl font-bold text-xs flex items-center gap-2">
                        <Save size={14} />
                        Guardar Cambios
                    </button>
                    <button className="px-6 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-xs">
                        Restaurar Valores por Defecto
                    </button>
                </div>
            </div>
        </div>
    );
}

function ParamGroup({ title, limits }: any) {
    return (
        <div className="glass-card bg-slate-900 p-6 flex items-center justify-between border-white/5">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-xl"><Cpu size={20} className="text-slate-500" /></div>
                <div>
                    <h4 className="font-bold">{title}</h4>
                    <p className="text-xs text-slate-500">{limits}</p>
                </div>
            </div>
            <button className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-white transition-colors">Editar</button>
        </div>
    );
}
