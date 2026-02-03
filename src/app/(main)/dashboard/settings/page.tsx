"use client";

import React from 'react';
import { Settings as SettingsIcon, Bell, Lock, Smartphone, Palette, Database } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <SettingsIcon className="text-muted" />
                    Configuración del Sistema
                </h1>
                <p className="text-muted text-sm">Ajustes generales, seguridad y personalización de Elite Stitch.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <SettingsGroup
                    icon={Palette}
                    title="Personalización Visual"
                    description="Ajusta el tema, colores de marca y logotipos de tus sucursales."
                />
                <SettingsGroup
                    icon={Smartphone}
                    title="Configuración de WhatsApp"
                    description="Vincula tu número mediante el servidor MCP para el agente de IA."
                />
                <SettingsGroup
                    icon={Bell}
                    title="Notificaciones"
                    description="Gestiona las alertas para tickets listos y cierres de caja."
                />
                <SettingsGroup
                    icon={Lock}
                    title="Seguridad y Accesos"
                    description="Gestiona roles y permisos para tus encargados de sede."
                />
                <SettingsGroup
                    icon={Database}
                    title="Base de Datos Supabase"
                    description="Conexión API, respaldos y logs de transacciones."
                />
            </div>
        </div>
    );
}

function SettingsGroup({ icon: Icon, title, description }: any) {
    return (
        <div className="glass-card p-6 flex items-start gap-6 hover:bg-secondary/20 transition-all cursor-pointer">
            <div className="p-3 bg-secondary rounded-xl border border-border text-muted">
                <Icon size={24} />
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">{title}</h3>
                <p className="text-sm text-muted">{description}</p>
            </div>
            <div className="self-center">
                <span className="text-xs font-bold text-muted uppercase tracking-widest hover:text-white transition-colors">Configurar →</span>
            </div>
        </div>
    );
}
