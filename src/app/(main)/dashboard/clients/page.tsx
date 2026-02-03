"use client";

import React from 'react';
import { Users, UserPlus, Search } from 'lucide-react';

export default function ClientsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Directorio de Clientes</h1>
                    <p className="text-muted text-sm mt-1">Base de datos centralizada de clientes y sus medidas.</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <UserPlus size={18} />
                    Registrar Cliente
                </button>
            </div>

            <div className="glass-card p-6">
                <div className="flex items-center gap-3 bg-secondary/50 px-4 py-2 rounded-xl border border-border mb-6">
                    <Search className="text-muted w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, teléfono o email..."
                        className="bg-transparent border-none outline-none text-sm w-full"
                    />
                </div>

                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 border border-border">
                        <Users size={32} className="text-muted" />
                    </div>
                    <h3 className="text-lg font-bold">Tu lista de clientes está vacía</h3>
                    <p className="text-muted text-sm max-w-xs mt-1">Los clientes registrados aquí podrán recibir actualizaciones vía WhatsApp automáticamente.</p>
                </div>
            </div>
        </div>
    );
}
