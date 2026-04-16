'use client';

import { useState, useEffect } from 'react';
import { dashboardService } from '@/features/dashboard/services/dashboardService';
import { 
    Plus, 
    Search, 
    MoreVertical, 
    MapPin, 
    Users, 
    Activity, 
    Loader2, 
    X, 
    Smartphone, 
    ExternalLink,
    Check,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const META_APP_ID = "3780486202082501";
const META_CONFIG_ID = "1598768074758028";
const SYNC_VERSION = "V2.8 - BUILD FIX";

export default function BranchesPage() {
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // WhatsApp Form State
    const [waForm, setWaForm] = useState({
        phoneNumberId: '',
        wabaId: '',
        accessToken: '',
        phoneNumber: ''
    });
    const [isWaSubmitting, setIsWaSubmitting] = useState(false);
    const [isSdkLoaded, setIsSdkLoaded] = useState(false);
    const [isProcessingMeta, setIsProcessingMeta] = useState(false);

    // Native Registration State
    const [nativeStep, setNativeStep] = useState(0); // 0: Start, 1: OTP, 2: Linked
    const [otpCode, setOtpCode] = useState('');
    const [nativePhoneId, setNativePhoneId] = useState('');
    const [isNativeLoading, setIsNativeLoading] = useState(false);
    const [codeMethod, setCodeMethod] = useState<'SMS' | 'VOICE'>('SMS');

    const [formData, setFormData] = useState({
        name: '',
        address: ''
    });

    useEffect(() => {
        loadBranches();
        loadMetaSdk();
    }, []);

    const loadMetaSdk = () => {
        if ((window as any).FB) {
            setIsSdkLoaded(true);
            return;
        }
        (window as any).fbAsyncInit = function() {
            (window as any).FB.init({
                appId: META_APP_ID,
                cookie: true,
                xfbml: true,
                version: 'v21.0'
            });
            setIsSdkLoaded(true);
        };
        const script = document.createElement('script');
        script.src = "https://connect.facebook.net/es_LA/sdk.js";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
    };

    const loadBranches = async () => {
        try {
            const data = await dashboardService.getBranches();
            setBranches(data);
        } catch (error) {
            toast.error("Error al cargar sedes.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) throw new Error("No session");

            const orgId = session.user.user_metadata?.organization_id;

            if (selectedBranch) {
                await dashboardService.updateBranch(selectedBranch.id, formData);
                toast.success("Sede actualizada correctamente.");
            } else {
                await dashboardService.createBranch({ 
                    ...formData, 
                    organization_id: orgId 
                });
                toast.success("Sede creada correctamente.");
            }
            loadBranches();
            setIsModalOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Error al guardar sede.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Deseas eliminar esta sede? Se validará que no tenga órdenes activas.")) return;
        setIsDeleting(true);
        try {
            await dashboardService.deleteBranch(id);
            toast.success("Sede eliminada.");
            loadBranches();
        } catch (error: any) {
            toast.error(error.message || "Error al eliminar la sede.");
        }
    };

    const handleRegisterWhatsApp = async () => {
        if (!selectedBranch || !waForm.phoneNumberId) {
            toast.error("Faltan campos obligatorios (ID Teléfono)");
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
                setIsSettingsModalOpen(false);
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
        const phoneWithPlus = waForm.phoneNumber.startsWith('+') ? waForm.phoneNumber : `+${waForm.phoneNumber}`;
        setIsNativeLoading(true);
        try {
            const res = await fetch('/api/whatsapp/native/request-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    branchId: selectedBranch.id, 
                    phoneNumber: phoneWithPlus,
                    method: codeMethod
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setNativePhoneId(data.phoneId);
            setWaForm(prev => ({ 
                ...prev, 
                phoneNumberId: data.phoneId, 
                wabaId: data.wabaId || prev.wabaId 
            }));
            setNativeStep(1);
            toast.success(`Código solicitado por ${codeMethod === 'SMS' ? 'SMS' : 'Llamada'}.`);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsNativeLoading(false);
        }
    };

    const handleNativeVerifyCode = async () => {
        if (!otpCode) return;
        setIsNativeLoading(true);
        try {
            const res = await fetch('/api/whatsapp/native/verify-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ branchId: selectedBranch.id, phoneId: nativePhoneId, otpCode: otpCode })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success("¡WhatsApp vinculado!");
            setNativeStep(2);
            // Si el backend devolvió el phoneId, asegurarnos que esté en el formulario
            if (data.data?.phoneId) {
                setWaForm(prev => ({ ...prev, phoneNumberId: data.data.phoneId }));
            }
            loadBranches();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsNativeLoading(false);
        }
    };

    const handleDisconnectWhatsApp = async () => {
        if (!selectedBranch || !confirm("¿Estás seguro de desvincular WhatsApp? Se borrarán los IDs configurados.")) return;
        setIsNativeLoading(true);
        try {
            const { error } = await supabase
                .from('branches')
                .update({ 
                    wa_phone_number_id: null,
                    wa_phone_number: null,
                    wa_waba_id: null,
                    wa_access_token: null
                })
                .eq('id', selectedBranch.id);

            if (error) throw error;
            
            setWaForm(prev => ({ ...prev, phoneNumberId: '', phoneNumber: '', wabaId: '', accessToken: '' }));
            setNativeStep(0);
            toast.success("WhatsApp desvínculado.");
            loadBranches();
        } catch (error: any) {
            toast.error("Error al desvincular: " + error.message);
        } finally {
            setIsNativeLoading(false);
        }
    };

    const handleLaunchCoexistence = () => {
        if (!(window as any).FB) return;
        setIsProcessingMeta(true);
        
        const params = {
            config_id: META_CONFIG_ID,
            response_type: 'token,code',
            override_default_response_type: true
        };

        (window as any).FB.login((response: any) => {
            if (response.authResponse) {
                const code = response.authResponse.code;
                const token = response.authResponse.accessToken;
                console.log("Meta Auth Success:", response);
                
                if (token) {
                    setWaForm(prev => ({ ...prev, accessToken: token }));
                    fetchMetaDetails(token);
                } else if (code) {
                    toast.success("Código capturado, guardando...");
                    handleRegisterWhatsApp();
                }
            } else {
                toast.error("Vinculación cancelada.");
                setIsProcessingMeta(false);
            }
        }, {
            scope: 'whatsapp_business_management,whatsapp_business_messaging',
            extras: {
                feature: 'whatsapp_embedded_signup',
                setup: {
                    business: { name: selectedBranch.name },
                    solutions: ['CHAT_BOT'],
                }
            }
        });
    };

    const fetchMetaDetails = async (token: string) => {
        try {
            const res = await fetch(`https://graph.facebook.com/v21.0/me/whatsapp_business_accounts?access_token=${token}`);
            const accounts = await res.json();
            
            if (accounts.data?.[0]) {
                const wabaId = accounts.data[0].id;
                const phoneRes = await fetch(`https://graph.facebook.com/v21.0/${wabaId}/phone_numbers?access_token=${token}`);
                const phones = await phoneRes.json();
                
                if (phones.data?.[0]) {
                    setWaForm(prev => ({
                        ...prev,
                        wabaId: wabaId,
                        phoneNumberId: phones.data[0].id,
                        accessToken: token
                    }));
                    toast.success("IDs recuperados automáticamente.");
                    
                    // Auto-save logic
                    setTimeout(() => handleRegisterWhatsApp(), 1500);
                }
            }
        } catch (error) {
            console.error("Error fetching Meta details:", error);
            setIsProcessingMeta(false);
        }
    };

    const resetNativeRegistration = () => {
        setNativeStep(0);
        setOtpCode('');
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 p-6 rounded-3xl border border-white/50 backdrop-blur-sm">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3 italic">
                        <MapPin className="text-orange-500" size={32} /> SEDES
                    </h1>
                    <p className="text-slate-500 font-medium ml-1">Gestiona las ubicaciones de tu negocio.</p>
                </div>
                <button 
                    onClick={() => {
                        setSelectedBranch(null);
                        setFormData({ name: '', address: '' });
                        setIsModalOpen(true);
                    }}
                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-3 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Nueva Sucursal
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {branches.map((branch) => (
                    <div key={branch.id} className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                <Activity size={32} />
                            </div>
                            <div className="flex gap-2">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${branch.wa_phone_number_id ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                    {branch.wa_phone_number_id ? '• Online' : '• Offline'}
                                </span>
                                <button
                                    onClick={() => {
                                        setSelectedBranch(branch);
                                        setWaForm({
                                            phoneNumberId: branch.wa_phone_number_id || '',
                                            wabaId: branch.wa_waba_id || '',
                                            accessToken: branch.wa_access_token || '',
                                            phoneNumber: branch.wa_phone_number || ''
                                        });
                                        setNativeStep(branch.wa_phone_number_id ? 2 : 0);
                                        setIsSettingsModalOpen(true);
                                    }}
                                    className="p-3 hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    <MoreVertical size={20} className="text-slate-400" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-900 group-hover:text-orange-600 transition-colors uppercase italic">{branch.name}</h3>
                            <div className="flex items-center gap-2 text-slate-400 font-medium">
                                <MapPin size={16} />
                                <p className="text-sm">{branch.address}</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Encargado</p>
                                <p className="text-sm font-bold text-slate-700">Jim Jimy</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Estado</p>
                                <p className="text-sm font-black text-orange-500 italic">ACTIVO</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isSettingsModalOpen && selectedBranch && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-xl max-h-[90vh] overflow-hidden shadow-3xl animate-in zoom-in duration-300 border border-white/20">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black italic">{selectedBranch.name}</h3>
                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest px-2 py-0.5 bg-blue-50 rounded-full inline-block mt-2">{SYNC_VERSION}</p>
                            </div>
                            <button onClick={() => setIsSettingsModalOpen(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8 overflow-y-auto">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase text-orange-600 flex items-center gap-2"><Smartphone size={16} /> WhatsApp</h3>
                                <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 space-y-6">
                                    <input type="text" value={waForm.phoneNumber} onChange={e => setWaForm({...waForm, phoneNumber: e.target.value})} className="w-full border rounded-xl px-4 py-2 font-bold outline-none" placeholder="Número (+52...)" />
                                    
                                    <div className="pt-4 border-t border-slate-200">
                                        <div className="bg-white border border-orange-200 rounded-2xl p-6 space-y-4">
                                            {nativeStep === 0 && (
                                                <div className="space-y-4">
                                                    <div className="flex bg-slate-100 p-1 rounded-xl">
                                                        <button 
                                                            type="button"
                                                            onClick={() => setCodeMethod('SMS')} 
                                                            className={`flex-1 py-4 text-[9px] font-black uppercase rounded-lg transition-all ${codeMethod === 'SMS' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400'}`}
                                                        >
                                                            Mensaje SMS
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => setCodeMethod('VOICE')} 
                                                            className={`flex-1 py-4 text-[9px] font-black uppercase rounded-lg transition-all ${codeMethod === 'VOICE' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400'}`}
                                                        >
                                                            Llamada Voz
                                                        </button>
                                                    </div>
                                                    <button onClick={handleNativeRegisterInit} disabled={isNativeLoading} className="w-full bg-orange-500 text-white py-4 rounded-xl text-[11px] font-black uppercase shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">{isNativeLoading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Solicitar Código</button>
                                                </div>
                                            )}
                                            {nativeStep === 1 && (
                                                <div className="space-y-4 text-center">
                                                    <p className="text-[10px] font-black uppercase">Código Recibido</p>
                                                    <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))} className="w-full text-center text-2xl font-black tracking-widest outline-none border-b-2 border-orange-500" placeholder="000000" />
                                                    <button onClick={handleNativeVerifyCode} disabled={isNativeLoading} className="w-full bg-slate-900 text-white py-4 rounded-xl text-[11px] font-black uppercase active:scale-95">Verificar</button>
                                                    <button onClick={resetNativeRegistration} className="text-[10px] font-black text-rose-500 uppercase">Reiniciar</button>
                                                </div>
                                            )}
                                            {nativeStep === 2 && (
                                                <div className="space-y-4 text-center">
                                                    <div className="font-black text-emerald-600 uppercase mb-2">¡Vinculado con éxito!</div>
                                                    <button 
                                                        onClick={handleDisconnectWhatsApp}
                                                        className="w-full text-[9px] font-black text-rose-500 py-3 border border-rose-100 rounded-xl hover:bg-rose-50 transition-all uppercase"
                                                    >
                                                        Desvincular para Reconfigurar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-200 text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mt-2">Configuración de IDs (Detección Manual/Auto)</p>
                                    </div>
                                    <div className="pt-2 space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-[9px] font-black mb-1">ID TELÉFONO</p>
                                                <input type="text" value={waForm.phoneNumberId} onChange={e => setWaForm({...waForm, phoneNumberId: e.target.value})} className="w-full text-xs border rounded-lg px-3 py-2 outline-none focus:border-orange-500" placeholder="Ej: 52123..." />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black mb-1">ID WABA</p>
                                                <input type="text" value={waForm.wabaId} onChange={e => setWaForm({...waForm, wabaId: e.target.value})} className="w-full text-xs border rounded-lg px-3 py-2 outline-none focus:border-orange-500" placeholder="Ej: 1280..." />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black mb-1">TOKEN DE ACCESO (OPCIONAL/AUTO)</p>
                                            <input type="text" value={waForm.accessToken} onChange={e => setWaForm({...waForm, accessToken: e.target.value})} className="w-full text-[10px] border rounded-lg px-3 py-2 outline-none focus:border-orange-500 font-mono" placeholder="EAAB..." />
                                            {waForm.accessToken ? (
                                                <p className="text-[8px] text-emerald-600 font-bold mt-1 uppercase">✓ Token detectado</p>
                                            ) : (
                                                <p className="text-[8px] text-amber-500 font-bold mt-1 uppercase">⚠ Sin token (Funcionalidad limitada)</p>
                                            )}
                                        </div>
                                    </div>

                                    <button onClick={handleRegisterWhatsApp} disabled={isWaSubmitting} className="w-full bg-slate-900 text-white py-4 rounded-xl text-xs font-black uppercase hover:bg-emerald-600 transition-all flex items-center justify-center gap-3">{isWaSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Activity size={16} />} Guardar Ajustes</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-3xl animate-in zoom-in duration-300 border border-white/20">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-2xl font-black italic">{selectedBranch ? 'Editar Sede' : 'Nueva Sede'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateOrUpdate} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                                    placeholder="EJ: SEDE CENTRAL ELITE"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección Completa</label>
                                <input 
                                    type="text" 
                                    value={formData.address}
                                    onChange={e => setFormData({...formData, address: e.target.value.toUpperCase()})}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                                    placeholder="CALLE, NÚMERO, COLONIA..."
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                {selectedBranch ? 'Actualizar Información' : 'Crear Sede Operativa'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
