"use client";

import React from 'react';
import { Ticket, Plus, Search, Filter, Sparkles, Activity, Clock, ChevronRight, User as UserIcon, MapPin } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useNotas, useDashboardStats } from '@/features/dashboard/hooks/useDashboardData';
import { Modal } from '@/shared/components/ui/Modal';
import { AdvancedNotaForm } from '@/features/dashboard/components/AdvancedNotaForm';
import { NotaDetailView } from '@/features/dashboard/components/nota-details/NotaDetailView';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useState } from 'react';

export default function NotasPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const { notas, loading: notasLoading, refetch } = useNotas(debouncedSearch) as any;
    const { stats, loading: statsLoading } = useDashboardStats();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNota, setSelectedNota] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const isLoading = notasLoading || statsLoading;

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <Ticket className="text-orange-600" size={28} />
                        </div>
                        Notas de Servicio
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Gestiona las órdenes, arreglos y entregas pendientes de todas tus sedes.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/30 hover:bg-orange-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    Nueva Nota
                </button>
            </div>

            <div className="glass-card border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
                <div className="p-10">
                    <div className="flex flex-col md:flex-row gap-6 mb-10">
                        <div className="flex-1 flex items-center gap-4 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 focus-within:ring-4 focus-within:ring-orange-500/10 focus-within:border-orange-500/30 transition-all shadow-inner">
                            <Search className="text-slate-300" size={20} />
                            <input
                                type="text"
                                placeholder="BUSCAR POR FOLIO, NOMBRE O TELÉFONO..."
                                className="bg-transparent border-none outline-none text-[15px] w-full font-bold text-foreground placeholder:text-slate-300 uppercase"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                            />
                        </div>
                        <button
                            onClick={() => alert("Los filtros avanzados se activarán en el siguiente módulo de reportes.")}
                            className="flex items-center gap-3 px-8 py-4 bg-white rounded-2xl border border-slate-100 hover:bg-orange-50 hover:border-orange-500/20 transition-all font-black text-[11px] uppercase tracking-widest text-slate-600 shadow-sm group"
                        >
                            <Filter size={18} className="text-orange-500 group-hover:rotate-12 transition-transform" />
                            Filtros Avanzados
                        </button>
                    </div>

                    {/* Stats bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                        <MiniNotaStat label="Recibidos" value={stats?.received?.toString() || "0"} color="text-amber-500" bg="bg-amber-50" />
                        <MiniNotaStat label="En Proceso" value={stats?.processing?.toString() || "0"} color="text-orange-500" bg="bg-orange-50" />
                        <MiniNotaStat label="Listos" value={stats?.ready?.toString() || "0"} color="text-emerald-500" bg="bg-emerald-50" />
                        <MiniNotaStat label="Entregados" value={stats?.delivered?.toString() || "0"} color="text-slate-500" bg="bg-slate-50" />
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                            <div className="w-16 h-16 bg-slate-100 rounded-full mb-4"></div>
                            <div className="h-4 w-48 bg-slate-100 rounded"></div>
                        </div>
                    ) : notas.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {notas.map((n: any) => (
                                <NotaCard
                                    key={n.id}
                                    nota={n}
                                    onClick={() => {
                                        setSelectedNota(n);
                                        setIsDetailModalOpen(true);
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/30 group hover:bg-orange-500/[0.02] hover:border-orange-500/20 transition-all duration-700">
                            <div className="relative mb-10">
                                <div className="w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center border border-slate-100 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                                    <Ticket size={56} className="text-slate-200 group-hover:text-orange-500 transition-colors" />
                                </div>
                                <div className="absolute -top-3 -right-3 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-xl animate-bounce border-4 border-white">
                                    <Plus size={20} className="text-white" />
                                </div>
                            </div>

                            <div className="space-y-3 max-w-sm px-6">
                                <h3 className="text-2xl font-black text-foreground tracking-tight">Tu mesa de trabajo está limpia</h3>
                                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                    No hay notas activas en este momento. Registra un nuevo servicio para comenzar a trackear tus entregas con <span className="text-orange-600 font-bold underline decoration-orange-500/30 decoration-4">SastrePro Intelligence</span>.
                                </p>
                            </div>

                            <button className="mt-12 flex items-center gap-3 px-10 py-4 bg-foreground text-background rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-foreground/20 group/btn">
                                <Sparkles size={18} className="text-orange-500 animate-pulse" />
                                Registrar Primera Nota
                                <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Nueva Orden de Servicio"
                className="max-w-5xl"
            >
                <AdvancedNotaForm
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        refetch?.();
                    }}
                />
            </Modal>

            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => { setIsDetailModalOpen(false); setSelectedNota(null); }}
                title={`Detalles de Nota - ${selectedNota?.ticket_number}`}
                className="max-w-5xl"
            >
                {selectedNota && (
                    <NotaDetailView
                        nota={selectedNota}
                        onUpdate={async () => {
                            const newNotas = await refetch();
                            if (selectedNota) {
                                const updated = newNotas.find((n: any) => n.id === selectedNota.id);
                                if (updated) setSelectedNota(updated);
                            }
                        }}
                    />
                )}
            </Modal>
        </div>
    );
}

function MiniNotaStat({ label, value, color, bg }: { label: string, value: string, color: string, bg: string }) {
    return (
        <div className={cn(
            "p-6 rounded-[1.75rem] border border-slate-100 text-center transition-all shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 group",
            bg
        )}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{label}</p>
            <p className={cn("text-3xl font-black tracking-tighter", color)}>{value}</p>
        </div>
    );
}

function NotaCard({ nota, onClick }: { nota: any, onClick: () => void }) {
    const statusMap: Record<string, { label: string, color: string, bg: string }> = {
        received: { label: 'Recibido', color: 'text-amber-600', bg: 'bg-amber-100' },
        processing: { label: 'En Proceso', color: 'text-orange-600', bg: 'bg-orange-100' },
        ready: { label: 'Listo', color: 'text-emerald-600', bg: 'bg-emerald-100' },
        delivered: { label: 'Entregado', color: 'text-slate-600', bg: 'bg-slate-100' }
    };

    const status = statusMap[nota.status] || statusMap.received;

    return (
        <div
            onClick={onClick}
            className="p-5 bg-white border-2 border-orange-50 rounded-[2rem] hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-500/10 transition-all group cursor-pointer"
        >
            <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{nota.ticket_number}</span>
                    <h4 className="font-black text-lg text-foreground truncate max-w-[150px]">{nota.notes || 'Arreglo general'}</h4>
                </div>
                <div className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest", status.bg, status.color)}>
                    {status.label}
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-slate-500">
                    <UserIcon size={16} className="text-orange-500" />
                    <span className="text-sm font-bold truncate">{nota.client?.full_name || 'Sin cliente'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                    <MapPin size={16} className="text-orange-500" />
                    <span className="text-sm font-bold truncate">{nota.branch?.name || 'Sucursal Principal'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                    <Clock size={16} className="text-orange-500" />
                    <span className="text-sm font-bold">{new Date(nota.delivery_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</span>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 block mb-1">Total</span>
                    <span className="text-xl font-black text-foreground">${Number(nota.total_amount).toLocaleString('es-MX')}</span>
                </div>
                <button className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-orange-500 hover:text-white transition-all shadow-inner">
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
