"use client";

import React, { useState } from 'react';
import {
    Ticket,
    Users,
    TrendingUp,
    Clock,
    Package,
    AlertTriangle,
    Search,
    ChevronRight,
    Calendar,
    ArrowUpRight,
    Scissors,
    History,
    CheckCircle2,
    Plus,
    Activity,
    CreditCard,
    TrendingDown,
    ArrowLeft,
    Monitor,
    Store
} from 'lucide-react';
import { cn, formatCurrency } from '@/shared/lib/utils';
import { useNotas, useAdvancedNotas, useDashboardStats, useDailyFinancials, useActiveWorkQueue, useBranches } from '../hooks/useDashboardData';
import { useAuthStore } from '@/features/auth/store/authStore';
import { NotaDetailView } from './nota-details/NotaDetailView';
import { AdvancedNotaForm } from './AdvancedNotaForm';
import { Modal } from '@/shared/components/ui/Modal';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useRouter } from 'next/navigation';
import { Settings, Info, Sliders, Save, X } from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { toast } from 'sonner';

interface Props {
    user?: any;
}

export function ManagerDashboard({ user: initialUser }: Props) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isNewNotaModalOpen, setIsNewNotaModalOpen] = useState(false);
    
    // Config Modals
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [selectedNota, setSelectedNota] = useState<any>(null);
    const { stats, loading: statsLoading, refetch: refetchStats } = useDashboardStats(initialUser?.assigned_branch_id);
    const { financials, loading: finLoading, refetch: refetchFin } = useDailyFinancials(initialUser?.assigned_branch_id);
    const { queue: activeQueue, loading: queueLoading, refetch: refetchQueue } = useActiveWorkQueue(initialUser?.assigned_branch_id);

    const { user: currentUser } = useAuthStore();
    const { branches } = useBranches();
    const { notas, loading: notasLoading, refetch: refetchNotas } = useNotas(debouncedSearch, undefined, initialUser?.assigned_branch_id);
    const isLoading = notasLoading || statsLoading || finLoading || queueLoading;

    // Detect if we are in "Monitor Mode" (Owner looking at a branch)
    const isMonitorMode = currentUser?.role === 'owner' && initialUser?.assigned_branch_id;
    const monitoredBranch = branches.find(b => b.id === initialUser?.assigned_branch_id);

    React.useEffect(() => {
        const handleRefresh = () => {
            refetchNotas();
            refetchStats();
            refetchFin();
            refetchQueue();
        };
        window.addEventListener('cash-cut-refresh', handleRefresh);
        return () => window.removeEventListener('cash-cut-refresh', handleRefresh);
    }, [refetchNotas, refetchStats, refetchFin, refetchQueue]);

    // Lógica de Prioridades
    const today = new Date().toISOString().split('T')[0];
    const urgentNotas = notas.filter(t =>
        t.status !== 'delivered' &&
        (t.delivery_date === today || t.items?.some((i: any) => i.priority === 'express'))
    ).slice(0, 10);
    const overdueNotas = notas.filter(t => t.status !== 'delivered' && t.delivery_date < today).slice(0, 5);
    const abandonedNotas = notas.filter(t => {
        const lastUpdate = new Date(t.updated_at);
        const diffDays = Math.ceil((new Date().getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24));
        return t.status === 'ready' && diffDays >= 30;
    });

    // KPI Calc
    // const totalVenta = notas.reduce((acc, t) => acc + (t.total_amount || 0), 0);


    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Monitor Mode or Branch Info Banner */}
            {isMonitorMode ? (
                <div className="bg-orange-600 text-white p-4 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-500 border-b-4 border-orange-700">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                            <Monitor size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                                MODO MONITOR: <span className="text-orange-200 uppercase">{monitoredBranch?.name || 'Sucursal Seleccionada'}</span>
                            </h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-100 opacity-80">Estás visualizando las operaciones en tiempo real de esta sede</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => router.push('/dashboard')}
                        className="bg-white text-orange-600 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-50 transition-all flex items-center gap-2 shadow-lg active:scale-95"
                    >
                        <ArrowLeft size={16} />
                        Volver al Resumen
                    </button>
                </div>
            ) : (
                currentUser?.role === 'manager' && (
                    <div className="bg-slate-900 text-white p-4 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-500 border-b-4 border-orange-500">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-orange-500/20">
                                <Store size={24} className="text-orange-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                                    SEDE ACTUAL: <span className="text-orange-500 uppercase">{branches.find(b => b.id === currentUser?.assigned_branch_id)?.name || 'Cargando...'}</span>
                                </h2>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 opacity-80">Panel de control exclusivo para la gestión de esta sucursal</p>
                            </div>
                        </div>
                        <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 hidden md:block">
                             <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Acceso Verificado</span>
                        </div>
                    </div>
                )
            )}

            {/* Header / Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">


                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-4 uppercase">
                        CENTRO DE CONTROL <span className="text-orange-500">{isMonitorMode ? 'DE SEDE' : 'OPERATIVO'}</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">
                        {isMonitorMode ? `MONITOREANDO: ${monitoredBranch?.name?.toUpperCase()}` : 'SASTREPRO INTELLIGENCE V3.0'}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 w-full md:w-96 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all">
                        <Search className="text-slate-300" size={20} />
                        <input
                            type="text"
                            placeholder="BUSCAR NOTAS O CLIENTES..."
                            className="bg-transparent border-none outline-none text-sm font-bold w-full uppercase placeholder:text-slate-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsInfoModalOpen(true)}
                            className="bg-white text-slate-400 p-4 rounded-2xl shadow-xl shadow-slate-200/20 hover:text-orange-500 hover:bg-orange-50 transition-all border border-slate-100"
                            title="Información de Sucursal"
                        >
                            <Info size={24} />
                        </button>
                        <button
                            onClick={() => setIsSettingsModalOpen(true)}
                            className="bg-white text-slate-400 p-4 rounded-2xl shadow-xl shadow-slate-200/20 hover:text-orange-500 hover:bg-orange-50 transition-all border border-slate-100"
                            title="Ajustes de Sucursal"
                        >
                            <Settings size={24} />
                        </button>
                        <button
                            onClick={() => setIsNewNotaModalOpen(true)}
                            className="bg-orange-500 text-white p-4 rounded-2xl shadow-xl shadow-orange-500/30 hover:scale-110 active:scale-95 transition-all ml-2"
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Dashboard Speed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <KPICard title="VENTA BRUTA (NOTAS)" value={formatCurrency(financials?.grossSales || 0)} icon={Plus} color="orange" border="border-[3px] border-orange-500 shadow-orange-100" />
                <KPICard title="COBRANZA REAL" value={formatCurrency(financials?.income || 0)} icon={TrendingUp} color="emerald" border="border-[3px] border-emerald-500 shadow-emerald-100" />
                <KPICard title="EFECTIVO EN CAJA" value={formatCurrency(financials?.netCash || 0)} icon={Activity} color="emerald" border="border-[3px] border-slate-300 shadow-sm" />
                <KPICard title="PAGOS TARJETA/TRANSF." value={formatCurrency((financials?.breakdown?.methods?.card || 0) + (financials?.breakdown?.methods?.transfer || 0))} icon={CreditCard} color="blue" border="border-[3px] border-blue-500 shadow-blue-100" />
                <KPICard title="GASTOS (PERIODO)" value={formatCurrency(financials?.expense || 0)} icon={TrendingDown} color="rose" border="border-[3px] border-rose-500 shadow-rose-100" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
                {/* Main Queue */}
                <div className="xl:col-span-3 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                            <Activity size={16} className="text-orange-500" /> COLA DE TRABAJO ACTIVA
                        </h2>
                        <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase">{activeQueue.length} ÓRDENES</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {isLoading ? (
                            Array(8).fill(0).map((_, i) => <div key={i} className="h-40 bg-slate-100 rounded-[1.5rem] animate-pulse" />)
                        ) : (searchTerm ? notas : activeQueue).length > 0 ? (
                            (searchTerm ? notas : activeQueue).slice(0, 16).map((t: any) => (
                                <QuickNotaCard
                                    key={t.id}
                                    nota={t}
                                    onClick={() => {
                                        setSelectedNota(t);
                                        setIsDetailModalOpen(true);
                                    }}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                                <Package className="mx-auto text-slate-200 mb-4" size={48} />
                                <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">NO HAY NOTAS ACTIVAS</p>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => router.push(`/dashboard/notas?branchId=${initialUser?.assigned_branch_id}`)}
                        className="w-full py-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-orange-600 transition-all group flex items-center justify-center gap-3"
                    >
                        VER TODAS LAS NOTAS <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Sidebar Priority */}
                <div className="space-y-8">
                    {/* Urgentes */}
                    <div className="glass-card p-8 border-none shadow-2xl bg-white rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <h3 className="font-black text-slate-900 uppercase text-[11px] tracking-[0.2em] mb-6 flex items-center gap-3">
                            EXPRESS / HOY
                            <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                        </h3>
                        <div className="space-y-4">
                            {urgentNotas.length > 0 ? urgentNotas.map((t: any) => (
                                <div key={t.id} onClick={() => { setSelectedNota(t); setIsDetailModalOpen(true); }} className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl hover:bg-orange-100 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-orange-600 uppercase">NOTA {t.ticket_number}</span>
                                            <span className="text-[9px] font-bold text-orange-400 border-l border-orange-200 pl-2">
                                                {new Date(t.delivery_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>
                                        <History size={14} className="text-orange-400" />
                                    </div>
                                    <p className="text-xs font-black text-slate-800 truncate uppercase">{t.client?.full_name}</p>
                                    <p className="text-[10px] text-orange-600 font-bold mt-1 uppercase tracking-tight">
                                        {t.items?.some((i: any) => i.priority === 'express') ? 'SERVICIO EXPRESS' : 'PARA HOY'}
                                    </p>
                                </div>
                            )) : (
                                <p className="text-center py-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">Sin servicios express hoy</p>
                            )}
                        </div>
                    </div>

                    {/* Retrasados */}
                    {overdueNotas.length > 0 && (
                        <div className="glass-card p-8 border-none shadow-2xl bg-rose-50 rounded-[2.5rem]">
                            <h3 className="font-black text-rose-600 uppercase text-[11px] tracking-[0.2em] mb-6">RETRASADOS / VENCIDOS</h3>
                            <div className="space-y-4">
                                {overdueNotas.map((t: any) => (
                                    <div key={t.id} onClick={() => { setSelectedNota(t); setIsDetailModalOpen(true); }} className="p-4 bg-white/80 border border-rose-100 rounded-2xl hover:shadow-lg transition-all cursor-pointer group">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-rose-600 uppercase">NOTA {t.ticket_number}</span>
                                                <span className="text-[9px] font-bold text-rose-400 border-l border-rose-200 pl-2">
                                                    {new Date(t.delivery_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                                                </span>
                                            </div>
                                            <AlertTriangle size={14} className="text-rose-400" />
                                        </div>
                                        <p className="text-xs font-black text-slate-800 truncate uppercase">{t.client?.full_name}</p>
                                        <p className="text-[10px] text-rose-500 font-bold mt-1 uppercase">FECHA VENCIDA</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => { setIsDetailModalOpen(false); setSelectedNota(null); }}
                title={`Detalles de Nota - ${selectedNota?.ticket_number}`}
                className="max-w-7xl"
            >
                {selectedNota && (
                    <NotaDetailView
                        nota={selectedNota}
                        onUpdate={async () => {
                            // Update UI immediately for the selected nota if in a list
                            const [newNotes, newQueue] = await Promise.all([
                                refetchNotas(),
                                refetchQueue()
                            ]);
                            
                            // CRITICAL: Global financial refresh to keep KPIs in sync
                            await refetchFin(); 
                            await refetchStats();

                            // Look in both collections
                            const updated = [...newNotes, ...newQueue].find((t: any) => t.id === selectedNota.id);
                            if (updated) setSelectedNota(updated);
                        }}
                    />
                )}
            </Modal>

            <Modal
                isOpen={isNewNotaModalOpen}
                onClose={() => setIsNewNotaModalOpen(false)}
                title="Nueva Nota de Servicio"
                className="max-w-7xl"
            >
                <AdvancedNotaForm
                    onClose={() => setIsNewNotaModalOpen(false)}
                    forceBranchId={initialUser?.assigned_branch_id}
                    onSuccess={async () => {
                        setIsNewNotaModalOpen(false);
                        await refetchNotas();
                        await refetchStats();
                        await refetchFin();
                        await refetchQueue();
                    }}
                />
            </Modal>

            {/* Modal: Información de Sucursal */}
            <Modal
                isOpen={isInfoModalOpen}
                onClose={() => setIsInfoModalOpen(false)}
                title="Configuración de Sede"
                className="max-w-2xl"
            >
                <div className="p-8 space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nombre de la Sucursal</label>
                            <input 
                                type="text"
                                defaultValue={monitoredBranch?.name || branches.find(b => b.id === currentUser?.assigned_branch_id)?.name}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-orange-500 outline-none transition-all uppercase"
                                id="branch_name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Dirección Física</label>
                            <textarea 
                                defaultValue={monitoredBranch?.address || branches.find(b => b.id === currentUser?.assigned_branch_id)?.address}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-orange-500 outline-none transition-all uppercase resize-none h-32"
                                id="branch_address"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Teléfono de Contacto</label>
                                <input 
                                    type="text"
                                    defaultValue={monitoredBranch?.phone || branches.find(b => b.id === currentUser?.assigned_branch_id)?.phone}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-orange-500 outline-none transition-all"
                                    id="branch_phone"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">WhatsApp Business ID</label>
                                <input 
                                    type="text"
                                    disabled
                                    value={monitoredBranch?.phone_number_id || branches.find(b => b.id === currentUser?.assigned_branch_id)?.phone_number_id || 'SIN VINCULAR'}
                                    className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl p-4 font-bold text-slate-400 outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button 
                            onClick={() => setIsInfoModalOpen(false)}
                            className="flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-50 transition-all border-2 border-transparent"
                        >
                            Cancelar
                        </button>
                        <button 
                            disabled={isSaving}
                            onClick={async () => {
                                setIsSaving(true);
                                try {
                                    const name = (document.getElementById('branch_name') as HTMLInputElement).value;
                                    const address = (document.getElementById('branch_address') as HTMLTextAreaElement).value;
                                    const phone = (document.getElementById('branch_phone') as HTMLInputElement).value;
                                    
                                    await dashboardService.updateBranch(currentUser?.assigned_branch_id!, {
                                        name, address, phone
                                    });
                                    
                                    toast.success('SUCURSAL ACTUALIZADA CON ÉXITO');
                                    setIsInfoModalOpen(false);
                                    window.location.reload(); // Refresh to update all references
                                } catch (e) {
                                    toast.error('ERROR AL ACTUALIZAR SUCURSAL');
                                } finally {
                                    setIsSaving(false);
                                }
                            }}
                            className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2"
                        >
                            {isSaving ? 'Guardando...' : <><Save size={16} /> Guardar Cambios</>}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal: Ajustes Operativos */}
            <Modal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                title="Ajustes de Operación"
                className="max-w-2xl"
            >
                <div className="p-8 space-y-10">
                    <div className="space-y-8">
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                            <div className="space-y-1">
                                <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">Notificaciones Automáticas</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Enviar WhatsApp al terminar una prenda</p>
                            </div>
                            <div className="w-14 h-8 bg-orange-500 rounded-full relative p-1 cursor-pointer">
                                <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow-md" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                            <div className="space-y-1">
                                <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">Modo Express Forzado</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Marcar todas las notas nuevas como urgente</p>
                            </div>
                            <div className="w-14 h-8 bg-slate-200 rounded-full relative p-1 cursor-not-allowed">
                                <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md" />
                            </div>
                        </div>

                        <div className="p-6 bg-orange-50 rounded-[2rem] border border-orange-100/50">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-orange-500 text-white rounded-xl">
                                    <Sliders size={20} />
                                </div>
                                <h4 className="font-black text-orange-900 text-sm uppercase tracking-tight">Parámetros de Tiempo</h4>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-orange-700 uppercase">Días promedio entrega</span>
                                    <span className="font-black text-orange-900">3 DÍAS</span>
                                </div>
                                <div className="w-full h-2 bg-orange-200 rounded-full overflow-hidden">
                                    <div className="w-[60%] h-full bg-orange-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center p-6 border-2 border-dashed border-slate-100 rounded-[2rem]">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Más ajustes próximamente</p>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, color, border }: any) {
    const colorClasses: Record<string, string> = {
        orange: "bg-orange-50 text-orange-600",
        blue: "bg-blue-50 text-blue-600",
        purple: "bg-purple-50 text-purple-600",
        emerald: "bg-emerald-50 text-emerald-600"
    };

    return (
        <div className={cn("glass-card p-8 bg-white border-[3px] border-slate-300 shadow-xl shadow-slate-200/50 rounded-[2.5rem] transition-all hover:scale-[1.02]", border)}>
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-4 rounded-2xl", colorClasses[color])}>
                    <Icon size={24} />
                </div>
                <ArrowUpRight className="text-slate-200" size={20} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">{title}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
        </div>
    );
}

function QuickNotaCard({ nota, onClick }: { nota: any, onClick: () => void }) {
    const statusMap: Record<string, { label: string, color: string, bg: string }> = {
        received: { label: 'RECIBIDO', color: 'text-amber-600', bg: 'bg-amber-100' },
        processing: { label: 'EN PROCESO', color: 'text-orange-600', bg: 'bg-orange-100' },
        ready: { label: 'LISTO', color: 'text-emerald-600', bg: 'bg-emerald-100' },
        delivered: { label: 'ENTREGADO', color: 'text-slate-600', bg: 'bg-slate-100' }
    };
    const status = statusMap[nota.status] || statusMap.received;

    return (
        <div 
            onClick={onClick}
            className="p-5 bg-white border-[3px] border-slate-300 rounded-[2.5rem] hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-500/10 transition-all group cursor-pointer relative overflow-hidden active:scale-[0.98]"
        >
            <div className="flex justify-between items-start mb-3">
                <div>
                    <span className="text-[8px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 uppercase tracking-widest mb-1 shadow-sm block w-fit">NOTA {nota.ticket_number}</span>
                    <h4 className="font-black text-[13px] text-slate-800 truncate max-w-[110px] tracking-tight uppercase">{nota.client?.full_name}</h4>
                </div>
                <div className={cn("px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest shadow-sm", status.bg, status.color)}>
                    {status.label}
                </div>
            </div>

            {nota.items?.some((i: any) => i.priority === 'express') && (
                <div className="absolute top-0 right-0">
                    <div className="bg-red-500 text-white text-[6px] font-black px-3 py-0.5 rotate-45 translate-x-3 -translate-y-1 shadow-lg uppercase tracking-widest">
                        EXPRESS
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 overflow-hidden">
                    <div className="flex flex-wrap gap-1">
                        {nota.items?.slice(0, 2).map((item: any, i: number) => (
                            <div key={i} className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-start text-[7px] font-black text-slate-500 uppercase tracking-tighter truncate max-w-[90px]">
                                {item.garment_name || 'PRENDA'}
                            </div>
                        ))}
                        {nota.items?.length > 2 && (
                            <div className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[7px] font-black text-slate-400">
                                +{nota.items.length - 2}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <Calendar size={10} className="text-orange-500" />
                    <span className="text-[8px] font-black text-slate-500 uppercase">{new Date(nota.delivery_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</span>
                </div>
            </div>

            <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[8px] font-black text-slate-300 uppercase">Saldo</span>
                <span className={cn("text-[11px] font-black", nota.balance_due > 0 ? "text-amber-500" : "text-emerald-500")}>
                    {formatCurrency(Math.max(0, nota.balance_due))}
                </span>
            </div>
        </div>
    );
}
