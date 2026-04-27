"use client";

import React, { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { useBranches } from '@/features/dashboard/hooks/useDashboardData';
import { dashboardService } from '@/features/dashboard/services/dashboardService';
import { 
    getDeviceFingerprint, 
    saveDeviceToken, 
    getDeviceFriendlyName,
    setAuthorizedBranch // NUEVO: Para guardar info de sucursal
} from '@/features/auth/lib/device-auth'; // Cambio de import
import { Monitor, ShieldCheck, Check, Loader2, Info, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';

interface DeviceLinkingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DeviceLinkingModal({ isOpen, onClose }: DeviceLinkingModalProps) {
    const { branches, loading: loadingBranches } = useBranches();
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [isAuthorizing, setIsAuthorizing] = useState(false);

    const handleAuthorize = async () => {
        if (!selectedBranchId) {
            toast.error("Por favor selecciona una sucursal");
            return;
        }

        const selectedBranch = branches.find(b => b.id === selectedBranchId);
        if (!selectedBranch) return;

        setIsAuthorizing(true);
        try {
            const fingerprint = await getDeviceFingerprint();
            const friendlyName = getDeviceFriendlyName();
            
            const result = await dashboardService.authorizeCurrentDevice(
                selectedBranchId,
                fingerprint,
                friendlyName
            );

            if (result.success) {
                // 1. Guardar el token (fingerprint)
                saveDeviceToken(result.device_token);
                
                // 2. Guardar la información de la sucursal (lo que LoginPage busca)
                setAuthorizedBranch(selectedBranch.id, selectedBranch.name);
                
                // Notificar a la página de login (si está abierta en otra pestaña)
                window.dispatchEvent(new Event('storage'));
                
                toast.success("¡Dispositivo vinculado con éxito!");
                
                // Cierra el modal después de un momento
                setTimeout(() => {
                    onClose();
                }, 2000);
            }
        } catch (error: any) {
            toast.error("Error: " + error.message);
        } finally {
            setIsAuthorizing(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Vincular Terminal">
            <div className="space-y-6">
                <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                        <Monitor size={80} />
                    </div>
                    <div className="relative z-10 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500 rounded-xl">
                                <ShieldCheck size={20} />
                            </div>
                            <h3 className="text-lg font-black italic">Autorización de Equipo</h3>
                        </div>
                        <p className="text-slate-300 text-xs font-medium leading-relaxed">
                            Vincula esta computadora a una sucursal para activar el acceso por <span className="text-white font-bold underline">PIN de seguridad</span>.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Seleccionar Sucursal</label>
                        <div className="grid grid-cols-1 gap-2">
                            {loadingBranches ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="animate-spin text-orange-500" size={24} />
                                </div>
                            ) : branches.map((branch) => (
                                <button
                                    key={branch.id}
                                    type="button"
                                    onClick={() => setSelectedBranchId(branch.id)}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left",
                                        selectedBranchId === branch.id 
                                            ? "border-orange-500 bg-orange-50 text-orange-950 shadow-md" 
                                            : "border-slate-100 hover:border-slate-200 text-slate-600"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center",
                                            selectedBranchId === branch.id ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400"
                                        )}>
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <p className="font-black text-sm uppercase italic">{branch.name}</p>
                                            <p className="text-[10px] opacity-70 truncate max-w-[200px]">{branch.address}</p>
                                        </div>
                                    </div>
                                    {selectedBranchId === branch.id && <Check size={20} className="text-orange-600" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3">
                        <div className="text-amber-500 shrink-0">
                            <Info size={18} />
                        </div>
                        <p className="text-[10px] text-amber-700 font-medium leading-tight">
                            Este equipo quedará autorizado permanentemente para la sucursal seleccionada.
                        </p>
                    </div>

                    <button
                        onClick={handleAuthorize}
                        disabled={isAuthorizing || !selectedBranchId}
                        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                        {isAuthorizing ? (
                            <><Loader2 className="animate-spin" size={20} /> Vinculando...</>
                        ) : (
                            <>{typeof window !== 'undefined' && localStorage.getItem('sp_device_auth_token') ? 'Re-vincular este Equipo' : 'Vincular este Equipo'} <Check size={18} /></>
                        )}
                    </button>
                    
                    {typeof window !== 'undefined' && localStorage.getItem('sp_device_auth_token') && (
                        <button 
                            onClick={() => {
                                if (confirm('¿Deseas desvincular este equipo? Dejará de funcionar como terminal hasta que lo vuelvas a vincular.')) {
                                    localStorage.removeItem('sp_device_auth_token');
                                    localStorage.removeItem('sp_authorized_branch');
                                    toast.success("Equipo desvinculado localmente.");
                                    window.location.reload();
                                }
                            }}
                            className="w-full bg-slate-100 text-slate-400 py-3 rounded-xl font-bold uppercase text-[9px] hover:bg-rose-50 hover:text-rose-600 transition-all"
                        >
                            ✕ Desvincular este equipo
                        </button>
                    )}
                    
                    <button
                        onClick={onClose}
                        className="w-full bg-transparent text-slate-400 py-2 rounded-xl font-bold uppercase text-[9px] hover:text-slate-600 transition-all"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </Modal>
    );
}
