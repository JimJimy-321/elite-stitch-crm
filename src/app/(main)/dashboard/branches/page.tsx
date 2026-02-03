"use client";

import React from 'react';
import { Store, MapPin, Phone, User, ExternalLink } from 'lucide-react';

const branches = [
    { id: 1, name: "Matriz Norte", address: "Av. Reforma 123", manager: "Sofia Casillas", status: "Open" },
    { id: 2, name: "Sede Sur", address: "Plaza Las Américas #45", manager: "Pedro Sanchez", status: "Open" },
    { id: 3, name: "Elite Este", address: "Col. Industrial G8", manager: "Lucía Mendez", status: "Closed" },
    { id: 4, name: "Centro Histórico", address: "Calle Madero 10", manager: "Roberto Ruiz", status: "Open" },
];

export default function BranchesPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Mis Sucursales</h1>
                <p className="text-muted text-sm">Administración y monitoreo de tus 4 puntos de venta.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {branches.map(branch => (
                    <div key={branch.id} className="glass-card p-6 group hover:border-accent/40 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center border border-border group-hover:bg-accent/10 group-hover:border-accent/30 transition-colors">
                                    <Store className="text-muted group-hover:text-accent transition-colors" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold group-hover:text-white">{branch.name}</h3>
                                    <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                        En línea
                                    </div>
                                </div>
                            </div>
                            <ExternalLink size={18} className="text-muted group-hover:text-white transition-colors" />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-muted">
                                <MapPin size={16} />
                                <span>{branch.address}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted">
                                <User size={16} />
                                <span>Encargado: {branch.manager}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] text-muted font-bold uppercase mb-0.5">Tickets Mes</p>
                                <p className="text-lg font-bold">142</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted font-bold uppercase mb-0.5">Ingresos Hoy</p>
                                <p className="text-lg font-bold text-accent">$2,450</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
