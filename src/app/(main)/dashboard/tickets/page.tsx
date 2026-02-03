"use client";

import React from 'react';
import { Ticket, Plus, Search, Filter } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export default function TicketsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tickets de Servicio</h1>
                    <p className="text-muted text-sm mt-1">Gestiona las órdenes y arreglos de todas tus sedes.</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    Nuevo Ticket
                </button>
            </div>

            <div className="glass-card p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 flex items-center gap-3 bg-secondary/50 px-4 py-2 rounded-xl border border-border">
                        <Search className="text-muted w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar por cliente, folio o prenda..."
                            className="bg-transparent border-none outline-none text-sm w-full"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl border border-border hover:bg-secondary/80 transition-colors">
                        <Filter size={18} className="text-muted" />
                        <span className="text-sm font-medium">Filtros</span>
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 border border-border">
                        <Ticket size={32} className="text-muted" />
                    </div>
                    <h3 className="text-lg font-bold">No hay tickets activos</h3>
                    <p className="text-muted text-sm max-w-xs mt-1">Empieza creando un nuevo ticket para registrar un servicio de sastrería.</p>
                </div>
            </div>
        </div>
    );
}
