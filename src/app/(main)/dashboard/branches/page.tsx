"use client";

import React, { useState } from 'react';
import { Store, MapPin, User, ExternalLink, Activity, Plus, Smartphone, Star, X, Loader2, MoreVertical, Edit2, Trash2, Settings } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useBranches, useStaffProfiles } from '@/features/dashboard/hooks/useDashboardData';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/authStore';
import { dashboardService } from '@/features/dashboard/services/dashboardService';

export default function BranchesPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { branches, loading: branchesLoading, createBranch, updateBranch, deleteBranch } = useBranches();
    const { profiles, loading: profilesLoading } = useStaffProfiles(user?.organization_id);
    const loading = branchesLoading || profilesLoading;
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<any>(null);
    const [newBranchData, setNewBranchData] = useState({ name: '', address: '' });
    const [editBranchData, setEditBranchData] = useState({ name: '', address: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [waForm, setWaForm] = useState({ 
        phoneNumberId: '', 
        wabaId: '', 
        accessToken: '', 
        phoneNumber: '' 
    });
    const [isWaSubmitting, setIsWaSubmitting] = useState(false);
    const [metaAppId, setMetaAppId] = useState('3780486202082501');
    const [capturedMetaIDs, setCapturedMetaIDs] = useState<{phone_number_id: string, waba_id: string} | null>(null);

    // Manejar el retorno de Meta (Capturar el code de la URL y los postMessage)
    React.useEffect(() => {
        // 1. Detectar 'code' en la URL (Redirección tradicional)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
            console.log("Meta OAuth Code detectado:", code);
            // Si hay un code, mostramos un mensaje más amigable
            // En el futuro esto podría disparar un intercambio automático de tokens
        }

        // 2. Escuchar mensajes del popup (Embedded Signup Flow)
        const handleMessage = (event: MessageEvent) => {
            // Solo procesar mensajes de Facebook
            if (event.origin !== "https://www.facebook.com") return;
            
            try {
                // El formato de Meta puede ser string o objeto
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                
                if (data.type === 'WA_EMBEDDED_SIGNUP_EVENT' && data.event === 'FINISH') {
                    const { phone_number_id, waba_id } = data.data;
                    console.log("Meta IDs capturados con éxito:", { phone_number_id, waba_id });

                    // Guardar IDs capturados para feedback visual
                    setCapturedMetaIDs({ phone_number_id, waba_id });

                    // Auto-llenar el formulario
                    setWaForm(prev => ({
                        ...prev,
                        phoneNumberId: phone_number_id || prev.phoneNumberId,
                        wabaId: waba_id || prev.wabaId
                    }));

                    // Notificar al usuario y abrir el modal si hay una sucursal lista
                    // alert(`✓ Conexión con Meta exitosa.\n\nPhone ID: ${phone_number_id}\nWABA ID: ${waba_id}\n\nLos códigos se han cargado automáticamente en el formulario.`);
                }
            } catch (e) {
                // Ignorar otros mensajes
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleLaunchCoexistence = () => {
        const extras = JSON.stringify({
            setup: {
                mobile_number_coexistence: true
            }
        });
        
        const redirectUri = window.location.origin + '/dashboard/branches';
        const scope = 'whatsapp_business_management,whatsapp_business_messaging';
        
        // Optimizamos para que use 'display=popup' y funcione mejor con el event listener
        const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${metaAppId}&display=popup&extras=${encodeURIComponent(extras)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
        
        window.open(url, 'MetaSignup', 'width=600,height=700,status=no,resizable=yes');
    };

    const handleCreateBranch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBranchData.name.trim()) return;
        setIsSubmitting(true);
        try {
            await createBranch(newBranchData);
            setCreateModalOpen(false);
            setNewBranchData({ name: '', address: '' });
        } catch (error) {
            console.error("Error creating branch:", error);
            alert("Error al crear sucursal.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateBranch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBranch || !editBranchData.name.trim()) return;
        setIsSubmitting(true);
        try {
            await updateBranch(selectedBranch.id, editBranchData);
            setEditModalOpen(false);
            setSelectedBranch(null);
        } catch (error) {
            console.error("Error updating branch:", error);
            alert("Error al actualizar sucursal.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteBranch = async (branch: any) => {
        if (!confirm(`¿Estás SEGURO de eliminar la sede "${branch.name}"?\nEsta acción no se puede deshacer y fallará si hay tickets registrados.`)) return;
        
        try {
            await deleteBranch(branch.id);
            alert("Sede eliminada correctamente.");
        } catch (error: any) {
            console.error("Error deleting branch:", error);
            alert(error.message || "Error al eliminar la sede.");
        }
    };

    const handleRegisterWhatsApp = async () => {
        if (!selectedBranch || !waForm.phoneNumberId || !waForm.accessToken) {
            alert("Por favor completa los campos obligatorios (Phone ID y Access Token)");
            return;
        }

        setIsWaSubmitting(true);
        try {
            const response = await fetch('/api/whatsapp/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    branchId: selectedBranch.id,
                    ...waForm
                })
            });

            const result = await response.json();

            if (result.success) {
                alert("✓ WhatsApp configurado y vinculado con Meta correctamente.");
                setSettingsModalOpen(false);
                // Actualizar lista local de sucursales
                window.location.reload(); 
            } else {
                alert(`Error: ${result.error}\n${result.details?.error?.message || ''}`);
            }
        } catch (error) {
            console.error("WA Register Error:", error);
            alert("Ocurrió un error inesperado al configurar WhatsApp.");
        } finally {
            setIsWaSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <Store className="text-orange-600" size={28} />
                        </div>
                        Tus Sucursales
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Control centralizado de todas tus sedes operativas en tiempo real.</p>
                </div>
                <button 
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-orange-500 text-white py-4 px-8 flex items-center gap-3 group shadow-2xl shadow-orange-500/30 rounded-2xl hover:bg-orange-600 active:scale-95 transition-all">
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-[0.15em]">Nueva Sucursal</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {loading ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center animate-pulse">
                        <div className="w-16 h-16 bg-slate-100 rounded-full mb-4"></div>
                        <div className="h-4 w-48 bg-slate-100 rounded"></div>
                    </div>
                ) : branches.length > 0 ? (
                    branches.map(branch => (
                        <div key={branch.id} className="glass-card group hover:scale-[1.01] transition-all duration-300 border-none shadow-2xl bg-card overflow-hidden border-t-4 border-t-orange-500 rounded-[2rem]">
                            <div className="p-8 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-orange-50 rounded-[1.5rem] flex items-center justify-center border border-orange-200 group-hover:border-orange-300 transition-all shadow-inner">
                                            <Store className="text-slate-400 group-hover:text-orange-500 transition-colors" size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-foreground group-hover:text-orange-600 transition-colors tracking-tight">{branch.name}</h3>
                                            <div className={cn(
                                                "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] mt-2 px-2.5 py-1 rounded-full border w-fit shadow-sm",
                                                branch.metadata?.online !== false
                                                    ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                                                    : "text-red-500 bg-red-50 border-red-100"
                                            )}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full", branch.metadata?.online !== false ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                                                {branch.metadata?.online !== false ? 'Online' : 'Offline'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <button 
                                            onClick={() => setActiveDropdown(activeDropdown === branch.id ? null : branch.id)}
                                            className="p-3 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-orange-500 transition-all active:scale-95 shadow-sm group/btn"
                                        >
                                            <MoreVertical size={20} className="group-hover/btn:rotate-90 transition-transform" />
                                        </button>

                                        {activeDropdown === branch.id && (
                                            <>
                                                <div 
                                                    className="fixed inset-0 z-40" 
                                                    onClick={() => setActiveDropdown(null)}
                                                />
                                                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 animate-in zoom-in-95 duration-200 origin-top-right">
                                                    <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 border-b border-slate-50">Acciones de Sede</div>
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedBranch(branch);
                                                            setEditBranchData({ name: branch.name, address: branch.address || '' });
                                                            setEditModalOpen(true);
                                                            setActiveDropdown(null);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left group/item"
                                                    >
                                                        <Edit2 size={16} className="text-blue-500 group-hover/item:scale-110 transition-transform" />
                                                        Editar Información
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedBranch(branch);
                                                            setWaForm({
                                                                phoneNumberId: branch.wa_phone_number_id || '',
                                                                wabaId: branch.wa_waba_id || '',
                                                                accessToken: branch.wa_access_token || '',
                                                                phoneNumber: branch.wa_phone_number || ''
                                                            });
                                                            setSettingsModalOpen(true);
                                                            setActiveDropdown(null);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left group/item"
                                                    >
                                                        <Settings size={16} className="text-slate-500 group-hover/item:rotate-45 transition-transform" />
                                                        Ajustes y Parámetros
                                                    </button>
                                                    <div className="my-2 border-t border-slate-100" />
                                                    <button 
                                                        onClick={() => {
                                                            handleDeleteBranch(branch);
                                                            setActiveDropdown(null);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left group/item"
                                                    >
                                                        <Trash2 size={16} className="group-hover/item:scale-110 transition-transform" />
                                                        Eliminar Sede
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 px-1">
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                                        <MapPin size={16} className="text-orange-500" />
                                        <span>{branch.address || 'Ubicación no registrada'}</span>
                                    </div>
                                     <div className="flex items-center gap-2 p-3 bg-white/50 rounded-xl border border-slate-200/50 shadow-sm">
                                        <User size={16} className="text-orange-500" />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter leading-none mb-1">Encargado Responsable</p>
                                            <p className="text-sm font-black text-slate-950 tracking-tight leading-none">
                                                {profiles.find(p => p.assigned_branch_id === branch.id)?.full_name || branch.metadata?.manager || (
                                                    <span className="text-rose-600 italic font-black">SIN ENCARGADO ASIGNADO</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-100 grid grid-cols-2 gap-8 relative">
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                                            <Activity size={12} className="text-orange-500" />
                                            Actividad
                                        </p>
                                        <p className="text-3xl font-black text-slate-900 tracking-tighter">Normal</p>
                                    </div>
                                    <div className="space-y-2 text-right">
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2 justify-end">
                                            Sucursal ID
                                            <Star size={12} className="text-orange-500/50" />
                                        </p>
                                        <p className="text-3xl font-black text-orange-600 tracking-tighter uppercase">{branch.id.substring(0, 3)}</p>
                                    </div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-10 bg-slate-100 hidden md:block" />
                                </div>

                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => router.push(`/dashboard?branchId=${branch.id}`)}
                                        className="flex-1 bg-orange-500 text-white px-4 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-orange-500/20 hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group"
                                    >
                                        Monitor Detallado
                                        <Activity size={18} className="group-hover:rotate-12 transition-transform" />
                                    </button>
                                    <button 
                                        onClick={() => alert("Funcionalidad Móvil en construcción")}
                                        className="bg-orange-100 hover:bg-orange-200 border border-orange-200 px-5 py-4 rounded-2xl text-orange-700 hover:text-orange-600 transition-all shadow-sm"
                                    >
                                        <Smartphone size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full border-4 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-20 bg-slate-50/50">
                        <Store className="text-slate-300 mb-6" size={60} />
                        <h3 className="text-2xl font-black text-foreground tracking-tight">No hay sucursales registradas</h3>
                        <p className="text-sm font-medium text-muted-foreground mt-2">Comienza añadiendo tu primera sede operativa.</p>
                    </div>
                )}

                {/* Add Card */}
                <div 
                    onClick={() => setCreateModalOpen(true)}
                    className="border-4 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-12 group hover:border-orange-500/30 hover:bg-orange-500/5 transition-all cursor-pointer bg-slate-50/50">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl border border-slate-100">
                        <Plus className="text-slate-400 group-hover:text-orange-500" size={40} />
                    </div>
                    <h3 className="text-xl font-black text-foreground group-hover:text-orange-600 transition-colors tracking-tight">Añadir Sucursal</h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-2">Expande tu imperio SastrePro</p>
                </div>
            </div>

            {/* Edit Branch Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4 animate-in fade-in duration-300">
                    <div className="bg-white border-[3px] border-slate-300 rounded-[2.5rem] shadow-[0_0_120px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden animate-in zoom-in-95 curve-bounce duration-500">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-xl font-black">Editar Sucursal</h2>
                            <button 
                                onClick={() => setEditModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateBranch} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nombre de la Sucursal <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                                    placeholder="Ej. Sede Norte"
                                    value={editBranchData.name}
                                    onChange={e => setEditBranchData({...editBranchData, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Dirección</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                                    placeholder="Dirección completa"
                                    value={editBranchData.address}
                                    onChange={e => setEditBranchData({...editBranchData, address: e.target.value})}
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="animate-spin" size={20} /> Guardando...</>
                                ) : (
                                    "Guardar Cambios"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Settings Modal (Placeholder content with actual logic for basic settings) */}
            {isSettingsModalOpen && selectedBranch && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4 animate-in fade-in duration-300">
                    <div className="bg-white border-[3px] border-slate-300 rounded-[2.5rem] shadow-[0_0_120px_rgba(0,0,0,0.5)] w-full max-w-lg overflow-hidden animate-in zoom-in-95 curve-bounce duration-500">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-black">Ajustes: {selectedBranch.name}</h2>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Configuración técnica y operativa de la sede</p>
                            </div>
                            <button 
                                onClick={() => setSettingsModalOpen(false)}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-orange-600 flex items-center gap-2">
                                    <Smartphone size={16} />
                                    Conectividad WhatsApp (Sede)
                                </h3>
                                <div className="glass-card p-6 border-orange-100 bg-orange-50/30 space-y-5">
                                    {capturedMetaIDs && (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3 animate-in zoom-in-95">
                                            <div className="bg-emerald-500 p-1.5 rounded-lg">
                                                <Star className="text-white" size={14} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-emerald-700 uppercase">IDs capturados con éxito</p>
                                                <p className="text-[9px] text-emerald-600 font-medium">Meta ha devuelto tus credenciales automáticamente.</p>
                                            </div>
                                            <button 
                                                onClick={() => setCapturedMetaIDs(null)}
                                                className="text-[9px] font-bold text-emerald-700 underline"
                                            >
                                                Limpiar
                                            </button>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Phone Number ID <span className="text-red-500">*</span></label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-orange-500 transition-all shadow-sm"
                                                placeholder="Ej. 104829384729"
                                                value={waForm.phoneNumberId}
                                                onChange={e => setWaForm(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">WABA ID</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-orange-500 transition-all shadow-sm"
                                                placeholder="WhatsApp Business Account ID"
                                                value={waForm.wabaId}
                                                onChange={e => setWaForm(prev => ({ ...prev, wabaId: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Access Token (Permanent) <span className="text-red-500">*</span></label>
                                        <input 
                                            type="password" 
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-orange-500 transition-all shadow-sm"
                                            placeholder={waForm.accessToken ? '••••••••••••••••' : 'EAAB...'}
                                            value={waForm.accessToken}
                                            onChange={e => setWaForm(prev => ({ ...prev, accessToken: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Número de Teléfono Visible</label>
                                        <input 
                                            type="text" 
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-orange-500 transition-all shadow-sm"
                                            placeholder="+52 1 234 567 8901"
                                            value={waForm.phoneNumber}
                                            onChange={e => setWaForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-blue-50 rounded-lg">
                                                <Star className="text-blue-600 animate-pulse" size={14} />
                                            </div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-800">Activación de Coexistencia (Recomendado)</h4>
                                        </div>
                                        
                                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-3">
                                            <p className="text-[10px] text-blue-900 font-medium leading-relaxed">
                                                Este asistente configurará el <strong>Modo Híbrido</strong>. Tu WhatsApp Business seguirá funcionando en tu aplicación móvil mientras sincronizamos los datos con SastrePro.
                                            </p>
                                            
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-blue-700 uppercase">App ID de Meta</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none"
                                                    value={metaAppId}
                                                    onChange={e => setMetaAppId(e.target.value)}
                                                />
                                            </div>

                                            <button 
                                                onClick={handleLaunchCoexistence}
                                                className="w-full bg-blue-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                                            >
                                                <ExternalLink size={14} />
                                                Vincular con App Móvil (Modo Híbrido)
                                            </button>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleRegisterWhatsApp}
                                        disabled={isWaSubmitting}
                                        className="w-full bg-slate-900 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {isWaSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Smartphone size={16} />}
                                        Vincular con Meta API
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <Activity size={14} />
                                    Estado Operativo
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => updateBranch(selectedBranch.id, { metadata: { ...selectedBranch.metadata, online: true } }).then(() => setSettingsModalOpen(false))}
                                        className={cn(
                                            "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                                            selectedBranch.metadata?.online !== false ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                                        )}
                                    >
                                        <div className={cn("w-3 h-3 rounded-full", selectedBranch.metadata?.online !== false ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-slate-300")} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">En Línea</span>
                                    </button>
                                    <button 
                                        onClick={() => updateBranch(selectedBranch.id, { metadata: { ...selectedBranch.metadata, online: false } }).then(() => setSettingsModalOpen(false))}
                                        className={cn(
                                            "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                                            selectedBranch.metadata?.online === false ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                                        )}
                                    >
                                        <div className={cn("w-3 h-3 rounded-full", selectedBranch.metadata?.online === false ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" : "bg-slate-300")} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Mantenimiento</span>
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
                                <Activity size={18} className="text-orange-500 mt-0.5" />
                                <p className="text-[10px] font-medium text-orange-800 leading-relaxed uppercase tracking-wider">
                                    El aislamiento de mensajes por sucursal asegura que cada sede gestione sus propios tickets y clientes de WhatsApp de forma independiente.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

