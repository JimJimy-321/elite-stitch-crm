"use client";

import React from 'react';
import { Search, Filter, X, Scissors, Tag, User, LayoutGrid, List, Activity } from 'lucide-react';
import { useGarments } from '../hooks/useDashboardData';
import { cn } from '@/shared/lib/utils';

interface HistoryFiltersProps {
    onFilterChange: (filters: { garment?: string, seamstress_id?: string, status?: string, startDate?: string, endDate?: string }) => void;
    currentFilters: { garment?: string, seamstress_id?: string, status?: string, startDate?: string, endDate?: string };
    viewMode: 'cards' | 'list';
    onViewModeChange: (mode: 'cards' | 'list') => void;
}

export function HistoryFilters({ onFilterChange, currentFilters, viewMode, onViewModeChange }: HistoryFiltersProps) {
    const { garments } = useGarments();
    
    const seamstresses: any[] = []; 

    const statuses = [
        { id: 'received', label: 'RECIBIDO', color: 'text-amber-500' },
        { id: 'processing', label: 'EN PROCESO', color: 'text-orange-500' },
        { id: 'ready', label: 'LISTO', color: 'text-emerald-500' },
        { id: 'delivered', label: 'ENTREGADO', color: 'text-slate-500' },
    ];

    const today = new Date();
    const defaultStartDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
    const defaultEndDate = today.toISOString().split('T')[0];

    const hasFilters = currentFilters.garment || currentFilters.seamstress_id || currentFilters.status || 
                       (currentFilters.startDate && currentFilters.startDate !== defaultStartDate) || 
                       (currentFilters.endDate && currentFilters.endDate !== defaultEndDate);

    return (
        <div className="bg-white/50 backdrop-blur-md border border-slate-100 rounded-[2rem] p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-2xl text-orange-600">
                    <Filter size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Filtros</span>
                </div>

                {/* Selector de Estado */}
                <div className="relative group">
                    <select
                        className="appearance-none bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-8 h-10 text-[10px] font-bold uppercase tracking-tight text-slate-600 focus:border-orange-500 outline-none transition-all cursor-pointer"
                        value={currentFilters.status || ''}
                        onChange={(e) => onFilterChange({ ...currentFilters, status: e.target.value })}
                    >
                        <option value="">TODOS LOS ESTADOS</option>
                        {statuses.map(s => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                    </select>
                    <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={14} />
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

                {/* Filtros de Fecha */}
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        className="appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 h-10 text-[10px] font-bold uppercase tracking-tight text-slate-600 focus:border-orange-500 outline-none transition-all cursor-pointer"
                        value={currentFilters.startDate || ''}
                        onChange={(e) => onFilterChange({ ...currentFilters, startDate: e.target.value })}
                        title="Fecha de Inicio"
                    />
                    <span className="text-slate-300 text-[10px] font-bold">A</span>
                    <input
                        type="date"
                        className="appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 h-10 text-[10px] font-bold uppercase tracking-tight text-slate-600 focus:border-orange-500 outline-none transition-all cursor-pointer"
                        value={currentFilters.endDate || ''}
                        onChange={(e) => onFilterChange({ ...currentFilters, endDate: e.target.value })}
                        title="Fecha de Fin"
                    />
                </div>

                {hasFilters && (
                    <button
                        onClick={() => onFilterChange({ startDate: defaultStartDate, endDate: defaultEndDate })}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all text-[10px] font-black uppercase"
                    >
                        <X size={14} />
                        Limpiar
                    </button>
                )}
            </div>

            {/* Selector de Vista */}
            <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
                <button
                    onClick={() => onViewModeChange('cards')}
                    className={cn(
                        "p-2 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                        viewMode === 'cards' 
                            ? "bg-white text-orange-500 shadow-md" 
                            : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <LayoutGrid size={14} />
                    {!viewMode || viewMode === 'cards' ? 'Cards' : ''}
                </button>
                <button
                    onClick={() => onViewModeChange('list')}
                    className={cn(
                        "p-2 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                        viewMode === 'list' 
                            ? "bg-white text-orange-500 shadow-md" 
                            : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <List size={14} />
                    {viewMode === 'list' ? 'Lista' : ''}
                </button>
            </div>
        </div>
    );
}
