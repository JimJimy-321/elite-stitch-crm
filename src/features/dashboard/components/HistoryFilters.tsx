"use client";

import React from 'react';
import { Search, Filter, X, Scissors, Tag, User } from 'lucide-react';
import { useGarments } from '../hooks/useDashboardData';
import { cn } from '@/shared/lib/utils';

interface HistoryFiltersProps {
    onFilterChange: (filters: { garment?: string, seamstress_id?: string }) => void;
    currentFilters: { garment?: string, seamstress_id?: string };
}

export function HistoryFilters({ onFilterChange, currentFilters }: HistoryFiltersProps) {
    const { garments } = useGarments();
    
    // Para sastre, por ahora usaremos una lista vacía o buscaremos perfiles si el usuario lo requiere.
    // En este paso, nos enfocamos en Prenda que es lo más común.
    const seamstresses: any[] = []; 

    const hasFilters = currentFilters.garment || currentFilters.seamstress_id;

    return (
        <div className="bg-white/50 backdrop-blur-md border border-slate-100 rounded-[2rem] p-4 flex flex-wrap items-center gap-4 shadow-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-2xl text-orange-600">
                <Filter size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Filtros</span>
            </div>

            {/* Selector de Prenda */}
            <div className="relative group">
                <select
                    className="appearance-none bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-8 h-10 text-[10px] font-bold uppercase tracking-tight text-slate-600 focus:border-orange-500 outline-none transition-all cursor-pointer"
                    value={currentFilters.garment || ''}
                    onChange={(e) => onFilterChange({ ...currentFilters, garment: e.target.value })}
                >
                    <option value="">TODAS LAS PRENDAS</option>
                    {garments.map(g => (
                        <option key={g.id} value={g.name}>{g.name.toUpperCase()}</option>
                    ))}
                </select>
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={14} />
            </div>

            {/* Selector de Sastre (Placeholder / Futuro) */}
            <div className="relative group">
                <select
                    className="appearance-none bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-8 h-10 text-[10px] font-bold uppercase tracking-tight text-slate-600 focus:border-orange-500 outline-none transition-all cursor-pointer"
                    value={currentFilters.seamstress_id || ''}
                    onChange={(e) => onFilterChange({ ...currentFilters, seamstress_id: e.target.value })}
                >
                    <option value="">TODOS LOS SASTRES</option>
                    {seamstresses.map(s => (
                        <option key={s.id} value={s.id}>{s.full_name?.toUpperCase()}</option>
                    ))}
                </select>
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={14} />
            </div>

            {hasFilters && (
                <button
                    onClick={() => onFilterChange({})}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all text-[10px] font-black uppercase"
                >
                    <X size={14} />
                    Limpiar
                </button>
            )}
        </div>
    );
}
