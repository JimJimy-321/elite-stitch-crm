"use client";

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { Store, MapPin, User, ExternalLink, Activity, Plus, Smartphone, Star, X, Loader2, MoreVertical, Edit2, Trash2, Settings } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useBranches, useStaffProfiles } from '@/features/dashboard/hooks/useDashboardData';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/authStore';
import { dashboardService } from '@/features/dashboard/services/dashboardService';
import { toast } from 'sonner';
import { whatsappService } from '@/features/dashboard/services/whatsappService';

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
    
    const [isSdkLoaded, setIsSdkLoaded] = useState(false);
    const [isProcessingMeta, setIsProcessingMeta] = useState(false);

    // Estados para Registro Nativo (Sin popup)
    const [nativeStep, setNativeStep] = useState<0 | 1 | 2>(0);
    const [nativePhoneId, setNativePhoneId] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [isNativeLoading, setIsNativeLoading] = useState(false);
    
    // Configuración de Meta
    const META_APP_ID = '3780486202082501';
    const META_CONFIG_ID = '1598768074758028';

    // Persistencia de estado de registro nativo
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const savedStep = sessionStorage.getItem('wa_native_step');
        const savedPhoneId = sessionStorage.getItem('wa_native_phone_id');
        const savedForm = sessionStorage.getItem('wa_form_data');

        if (savedStep) setNativeStep(parseInt(savedStep) as any);
        if (savedPhoneId) setNativePhoneId(savedPhoneId);
        if (savedForm) setWaForm(JSON.parse(savedForm));
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        sessionStorage.setItem('wa_native_step', nativeStep.toString());
        sessionStorage.setItem('wa_native_phone_id', nativePhoneId);
        sessionStorage.setItem('wa_form_data', JSON.stringify(waForm));
    }, [nativeStep, nativePhoneId, waForm]);

    const resetNativeRegistration = () => {
        setNativeStep(0);
        setNativePhoneId('');
        setOtpCode('');
        sessionStorage.removeItem('wa_native_step');
        sessionStorage.removeItem('wa_native_phone_id');
        toast.info("Flujo de registro reiniciado.");
    };

    // Manejar la inicialización y retorno del SDK de Meta
    useEffect(() => {
        (window as any).fbAsyncInit = function() {
            try {
                (window as any).FB.init({
                    appId: META_APP_ID,
                    cookie: true,
                    xfbml: true,
                    version: 'v21.0'
                });
                setIsSdkLoaded(true);
                console.log("SDK de Meta inicializado (v21.0)");
            } catch (err) {
                console.error("Error en FB.init:", err);
            }
        };

        if ((window as any).FB && !isSdkLoaded) {
            (window as any).fbAsyncInit();
        }

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code && typeof window !== 'undefined' && window.opener && window.opener !== window) {
            console.log("Popup detectado con code. Escaneando IDs...");
            const phone_id = urlParams.get('phone_number_id');
            const waba_id = urlParams.get('waba_id');

            try {
                window.opener.postMessage({ 
                    type: 'WA_EMBEDDED_SIGNUP_EVENT', 
                    event: 'FINISH',
                    data: { 
                        code,
                        phone_number_id: phone_id,
                        waba_id: waba_id
                    } 
                }, window.location.origin);
            } catch (err) {
                console.error("Error enviando mensaje al padre:", err);
            }
            
            document.body.innerHTML = `
                <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;background:#fff;font-family:sans-serif;text-align:center;padding:20px;">
                    <div style="color:#10b981;font-size:48px;margin-bottom:20px;">✓</div>
                    <h2 style="margin:0;font-weight:900;">Conexión con Meta Exitosa</h2>
                    <p style="color:#64748b;margin-top:10px;">Capturando credenciales...</p>
                </div>
            `;
            setTimeout(() => window.close(), 2500);
            return;
        }
    }, [isSdkLoaded]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (!event.origin.includes("facebook.com") && 
                !event.origin.includes("sastrepro.com") && 
                event.origin !== window.location.origin) return;
            
            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                console.log("Mensaje recibido del Popup:", data);
                
                if (data.type === 'WA_EMBEDDED_SIGNUP_EVENT' || (data.event === 'FINISH' && data.data)) {
                    toast.info("Capturando datos de vinculación...");
                    
                    const payload = data.data || data;
                    const { phone_number_id, waba_id } = payload;
                    
                    if (phone_number_id || waba_id) {
                        toast.success("¡IDs de Meta capturados por mensaje!");
                        
                        setWaForm(prev => {
                            const newForm = {
                                ...prev,
                                phoneNumberId: phone_number_id || prev.phoneNumberId,
                                wabaId: waba_id || prev.wabaId
                            };
                            return newForm;
                        });
                        
                        // Si ya tenemos token, intentamos avanzar
                        if (waForm.accessToken) {
                            setIsProcessingMeta(false);
                        }
                    }
                }
            } catch (e) {
                console.warn("Error procesando mensaje del popup:", e);
            }
        };

        window.addEventListener('message', handleMessage);
        console.log("🚀 SastrePro V2.2 - Sincronización Meta Activa");
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleLaunchCoexistence = () => {
        const fb = (window as any).FB;
        if (!fb) {
            toast.error("El SDK de Meta aun no carga. Reintenta en 1 segundo.");
            return;
        }

        toast.info("Conectando con Meta... Completa los pasos en la ventana.");
        
        try {
            fb.login((response: any) => {
                if (response.authResponse) {
                    const { accessToken, code } = response.authResponse;
                    if (accessToken || code) {
                        setWaForm(prev => ({
                            ...prev,
                            accessToken: accessToken || code || prev.accessToken
                        }));
                    }
                    toast.success("¡Permisos de Meta obtenidos!");
                    // Fallback: Si no hemos recibido los IDs por mensaje, los buscamos de forma activa
                    if (accessToken || code) {
                        fetchMetaDetails(accessToken || code);
                    }
                } else {
                    toast.error("No se completó la vinculación.");
                }
            }, {
                config_id: META_CONFIG_ID,
                response_type: 'token,code',
                override_default_response_type: true,
                scope: 'whatsapp_business_management,whatsapp_business_messaging,business_management'
            });
        } catch (err: any) {
            toast.error("Error al abrir Meta: " + err.message);
        }
    };

    const fetchMetaDetails = (token: string) => {
        setIsProcessingMeta(true);
        toast.info("Recuperando detalles de tu cuenta de Meta...");
        
        const fb = (window as any).FB;
        fb.api('/me/whatsapp_business_accounts', (response: any) => {
            console.log("Respuesta WABAs:", response);
            if (response && response.data && response.data.length > 0) {
                // Buscamos el que coincida con el nombre visto en la captura o simplemente el primero si es el único
                const account = response.data[0]; 
                const wabaId = account.id;
                
                toast.success(`Cuenta detectada: ${account.name || 'WhatsApp Business'}`);
                
                // Ahora buscamos el Phone ID de esa cuenta
                fb.api(`/${wabaId}/phone_numbers`, (phoneResponse: any) => {
                    console.log("Respuesta Phone Numbers:", phoneResponse);
                    if (phoneResponse && phoneResponse.data && phoneResponse.data.length > 0) {
                        const phoneId = phoneResponse.data[0].id;
                        
                        setWaForm(prev => ({
                            ...prev,
                            wabaId,
                            phoneNumberId: phoneId,
                            accessToken: token
                        }));
                        
                        toast.success("Credenciales vinculadas automáticamente.");
                        setIsProcessingMeta(false);
                    } else {
                        toast.error("No se encontraron números de teléfono en la cuenta.");
                        setIsProcessingMeta(false);
                    }
                });
            } else {
                toast.error("No se encontraron Cuentas de WhatsApp Business vinculadas.");
                setIsProcessingMeta(false);
            }
        });
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
            toast.error("Error al crear sucursal.");
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
            toast.error("Error al actualizar sucursal.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteBranch = async (branch: any) => {
        if (!confirm(`¿Estás SEGURO de eliminar la sede "${branch.name}"?\nEsta acción no se puede deshacer.`)) return;
        try {
            await deleteBranch(branch.id);
            toast.success("Sede eliminada correctamente.");
        } catch (error: any) {
            toast.error(error.message || "Error al eliminar la sede.");
        }
    };

    const handleRegisterWhatsApp = async () => {
        if (!selectedBranch || !waForm.phoneNumberId || !waForm.accessToken) {
            toast.error("Faltan campos obligatorios");
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
                toast.success("Configuración guardada correctamente.");
                setSettingsModalOpen(false);
                window.location.reload(); 
            } else {
                toast.error(`Error: ${result.error}`);
            }
        } catch (error) {
            toast.error("Error inesperado al configurar WhatsApp.");
        } finally {
            setIsWaSubmitting(false);
        }
    };

    const handleNativeRegisterInit = async () => {
        if (!waForm.phoneNumber || !selectedBranch) {
            toast.error("El número es obligatorio.");
            return;
        }
        setIsNativeLoading(true);
        try {
            const res = await fetch('/api/whatsapp/native/request-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ branchId: selectedBranch.id, phoneNumber: waForm.phoneNumber })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setNativePhoneId(data.phoneId);
            setNativeStep(1);
            toast.success("Enviado. Revisa tu SMS.");
        } catch (err: any) {
            toast.error(`Error: ${err.message}`);
        } finally {
            setIsNativeLoading(false);
        }
    };

    const handleNativeVerifyCode = async () => {
        if (!otpCode || otpCode.length < 6) return;
        setIsNativeLoading(true);
        try {
            const res = await fetch('/api/whatsapp/native/verify-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ branchId: selectedBranch.id, phoneId: nativePhoneId, otpCode })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setNativeStep(2);
            toast.success("¡Vinculado con éxito!");
        } catch (err: any) {
            toast.error(`Error: ${err.message}`);
        } finally {
            setIsNativeLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative">
            <Script 
                src="https://connect.facebook.net/en_US/sdk.js" 
                strategy="afterInteractive"
                onLoad={() => {
                    if ((window as any).FB) (window as any).fbAsyncInit();
                }}
            />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <Store className="text-orange-600" size={28} />
                        </div>
                        Tus Sucursales
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Control centralizado en tiempo real.</p>
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
                    </div>
                ) : branches.length > 0 ? (
                    branches.map(branch => (
                        <div key={branch.id} className="glass-card group hover:scale-[1.01] transition-all duration-300 border-none shadow-2xl bg-card overflow-hidden border-t-4 border-t-orange-500 rounded-[2rem]">
                            <div className="p-8 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-orange-50 rounded-[1.5rem] flex items-center justify-center border border-orange-200 shadow-inner">
                                            <Store className="text-slate-400 group-hover:text-orange-500 transition-colors" size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-foreground group-hover:text-orange-600 transition-colors tracking-tight">{branch.name}</h3>
                                            <div className={cn(
                                                "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] mt-2 px-2.5 py-1 rounded-full border w-fit shadow-sm",
                                                branch.metadata?.online !== false ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-red-500 bg-red-50 border-red-100"
                                            )}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full", branch.metadata?.online !== false ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                                                {branch.metadata?.online !== false ? 'Online' : 'Offline'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <button 
                                            onClick={() => setActiveDropdown(activeDropdown === branch.id ? null : branch.id)}
                                            className="p-3 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-orange-500 transition-all active:scale-95 shadow-sm"
                                        >
                                            <MoreVertical size={20} />
                                        </button>
                                        {activeDropdown === branch.id && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                                                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 animate-in zoom-in-95 duration-200 origin-top-right">
                                                    <button onClick={() => { setSelectedBranch(branch); setEditBranchData({ name: branch.name, address: branch.address || '' }); setEditModalOpen(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left"><Edit2 size={16} className="text-blue-500" /> Editar Info</button>
                                                    <button onClick={() => { setSelectedBranch(branch); setWaForm({ phoneNumberId: branch.wa_phone_number_id || '', wabaId: branch.wa_waba_id || '', accessToken: branch.wa_access_token || '', phoneNumber: branch.wa_phone_number || '' }); setSettingsModalOpen(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left"><Settings size={16} className="text-slate-500" /> Ajustes</button>
                                                    <div className="my-2 border-t border-slate-100" />
                                                    <button onClick={() => { handleDeleteBranch(branch); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"><Trash2 size={16} /> Eliminar</button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4 px-1">
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600"><MapPin size={16} className="text-orange-500" /><span>{branch.address || 'Ubicación no registrada'}</span></div>
                                    <div className="flex items-center gap-2 p-3 bg-white/50 rounded-xl border border-slate-200/50 shadow-sm"><User size={16} className="text-orange-500" /><div><p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Encargado Responsable</p><p className="text-sm font-black text-slate-950">{profiles.find(p => p.assigned_branch_id === branch.id)?.full_name || branch.metadata?.manager || "SIN ASIGNAR"}</p></div></div>
                                </div>
                                <div className="pt-8 border-t border-slate-100 grid grid-cols-2 gap-8 relative text-center">
                                    <div><p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Actividad</p><p className="text-3xl font-black text-slate-900 tracking-tighter">Normal</p></div>
                                    <div><p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">ID</p><p className="text-3xl font-black text-orange-600 tracking-tighter uppercase">{branch.id.substring(0, 3)}</p></div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => router.push(`/dashboard?branchId=${branch.id}`)} className="flex-1 bg-orange-500 text-white px-4 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-orange-500/20 hover:bg-orange-600 flex items-center justify-center gap-3">Monitor Detallado <Activity size={18} /></button>
                                    <button onClick={() => toast.info("Funcionalidad Móvil en construcción")} className="bg-orange-100 px-5 py-4 rounded-2xl text-orange-700 transition-all shadow-sm"><Smartphone size={20} /></button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full border-4 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-20 bg-slate-50/50">
                        <Store className="text-slate-300 mb-6" size={60} /><h3 className="text-2xl font-black tracking-tight">No hay sucursales</h3>
                    </div>
                )}
                <div onClick={() => setCreateModalOpen(true)} className="border-4 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-12 group hover:border-orange-500/30 hover:bg-orange-500/5 transition-all cursor-pointer bg-slate-50/50">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl"><Plus className="text-slate-400 group-hover:text-orange-500" size={40} /></div>
                    <h3 className="text-xl font-black group-hover:text-orange-600 transition-colors tracking-tight">Añadir Sucursal</h3>
                </div>
            </div>

            {/* Modals simplificados para legibilidad */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4">
                    <div className="bg-white border-[3px] border-slate-300 rounded-[2.5rem] w-full max-w-md overflow-hidden p-6 animate-in zoom-in-95">
                        <h2 className="text-xl font-black mb-6">Editar Sucursal</h2>
                        <form onSubmit={handleUpdateBranch} className="space-y-4">
                            <input type="text" required value={editBranchData.name} onChange={e => setEditBranchData({...editBranchData, name: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 outline-none" placeholder="Nombre" />
                            <input type="text" value={editBranchData.address} onChange={e => setEditBranchData({...editBranchData, address: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 outline-none" placeholder="Dirección" />
                            <button type="submit" disabled={isSubmitting} className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl active:scale-95">{isSubmitting ? "Guardando..." : "Guardar"}</button>
                            <button type="button" onClick={() => setEditModalOpen(false)} className="w-full text-xs font-black text-slate-400 uppercase">Cancelar</button>
                        </form>
                    </div>
                </div>
            )}

            {isSettingsModalOpen && selectedBranch && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4">
                    <div className="bg-white border-[3px] border-slate-300 rounded-[2.5rem] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
                        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-black tracking-tight">{selectedBranch.name}</h2>
                            <button onClick={() => setSettingsModalOpen(false)} className="p-2 bg-white rounded-full"><X size={20} /></button>
                        </div>
                        <div className="p-8 space-y-8 overflow-y-auto">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase text-orange-600 flex items-center gap-2"><Smartphone size={16} /> WhatsApp</h3>
                                <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 space-y-6">
                                    <input type="text" value={waForm.phoneNumber} onChange={e => setWaForm({...waForm, phoneNumber: e.target.value})} className="w-full border rounded-xl px-4 py-2 font-bold outline-none" placeholder="Número (+52...)" />
                                    
                                    <div className="pt-4 border-t border-slate-200">
                                        <div className="bg-white border border-orange-200 rounded-2xl p-6 space-y-4">
                                            {nativeStep === 0 && (
                                                <button onClick={handleNativeRegisterInit} disabled={isNativeLoading} className="w-full bg-orange-500 text-white py-4 rounded-xl text-[11px] font-black uppercase shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">{isNativeLoading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Registro Directo SMS</button>
                                            )}
                                            {nativeStep === 1 && (
                                                <div className="space-y-4 text-center">
                                                    <p className="text-[10px] font-black uppercase">Código SMS</p>
                                                    <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))} className="w-full text-center text-2xl font-black tracking-widest outline-none border-b-2 border-orange-500" placeholder="000000" />
                                                    <button onClick={handleNativeVerifyCode} disabled={isNativeLoading} className="w-full bg-slate-900 text-white py-4 rounded-xl text-[11px] font-black uppercase active:scale-95">Verificar</button>
                                                    <button onClick={resetNativeRegistration} className="text-[10px] font-black text-rose-500 uppercase">Reiniciar</button>
                                                </div>
                                            )}
                                            {nativeStep === 2 && <div className="text-center font-black text-emerald-600 uppercase">¡Vinculado con éxito!</div>}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-200 text-center">
                                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-4">
                                            <p className="text-[10px] font-black text-blue-800 uppercase">Método Meta Assistant</p>
                                            <div className="flex gap-2 justify-center">
                                                <div className="text-[10px] font-bold bg-white px-2 py-1 rounded border">App: {META_APP_ID}</div>
                                                <div className="text-[10px] font-bold bg-white px-2 py-1 rounded border">Cfg: {META_CONFIG_ID}</div>
                                            </div>
                                            <button 
                                                onClick={handleLaunchCoexistence} 
                                                disabled={!isSdkLoaded || isProcessingMeta} 
                                                className={`w-full py-4 rounded-xl text-[11px] font-black uppercase shadow-lg active:scale-95 flex items-center justify-center gap-2 ${isProcessingMeta ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 text-white animate-pulse'}`}
                                            >
                                                {isProcessingMeta ? (
                                                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> VINCULANDO...</>
                                                ) : isSdkLoaded ? (
                                                    <><ExternalLink size={16} /> !!! ABRIR ASISTENTE (SYNC V2.2) !!!</>
                                                ) : "Cargando..."}
                                            </button>
                                        </div>
                                    </div>

                                    <button onClick={handleRegisterWhatsApp} disabled={isWaSubmitting} className="w-full bg-slate-900 text-white py-4 rounded-xl text-xs font-black uppercase hover:bg-emerald-600 transition-all flex items-center justify-center gap-3">{isWaSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Activity size={16} />} Guardar Ajustes</button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase text-slate-400">Estado</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => updateBranch(selectedBranch.id, { metadata: { ...selectedBranch.metadata, online: true } }).then(() => setSettingsModalOpen(false))} className={cn("p-4 rounded-2xl border-2 font-black text-[10px] uppercase", selectedBranch.metadata?.online !== false ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-400")}>Online</button>
                                    <button onClick={() => updateBranch(selectedBranch.id, { metadata: { ...selectedBranch.metadata, online: false } }).then(() => setSettingsModalOpen(false))} className={cn("p-4 rounded-2xl border-2 font-black text-[10px] uppercase", selectedBranch.metadata?.online === false ? "border-rose-500 bg-rose-50 text-rose-700" : "bg-slate-50 text-slate-400")}>Offline</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4">
                    <div className="bg-white border-[3px] border-slate-300 rounded-[2.5rem] w-full max-w-md overflow-hidden p-8 animate-in zoom-in-95">
                        <h2 className="text-xl font-black mb-6">Nueva Sucursal</h2>
                        <form onSubmit={handleCreateBranch} className="space-y-4">
                            <input type="text" required value={newBranchData.name} onChange={e => setNewBranchData({...newBranchData, name: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-4 font-bold outline-none" placeholder="Nombre de la sede" />
                            <input type="text" value={newBranchData.address} onChange={e => setNewBranchData({...newBranchData, address: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-4 font-bold outline-none" placeholder="Dirección" />
                            <button type="submit" disabled={isSubmitting} className="w-full bg-orange-500 text-white font-black py-4 rounded-xl text-xs uppercase shadow-xl hover:bg-orange-600 transition-all">{isSubmitting ? "Creando..." : "Crear Sede"}</button>
                            <button type="button" onClick={() => setCreateModalOpen(false)} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest">Cancelar</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
