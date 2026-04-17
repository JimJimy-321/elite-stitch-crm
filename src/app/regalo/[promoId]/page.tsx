'use client';

import { useState, useEffect, use } from 'react';
import { marketingService } from '@/features/dashboard/services/marketingService';
import { 
    Gift, 
    Sparkles, 
    Smartphone, 
    CheckCircle2, 
    Loader2, 
    ArrowRight,
    MapPin,
    Copy,
    Share2,
    Ticket
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import Image from 'next/image';

interface GiftPageProps {
    params: Promise<{ promoId: string }>;
}

export default function GiftPage({ params }: GiftPageProps) {
    const { promoId } = use(params);
    const [promo, setPromo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isClaiming, setIsClaiming] = useState(false);
    const [claimedData, setClaimedData] = useState<any>(null);
    
    const [formData, setFormData] = useState({
        full_name: '',
        phone: ''
    });

    useEffect(() => {
        loadPromo();
    }, [promoId]);

    async function loadPromo() {
        try {
            const data = await marketingService.getPromotionPublic(promoId);
            if (data) {
                setPromo(data);
            }
        } catch (error) {
            console.error("Error loading promo:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleClaim(e: React.FormEvent) {
        e.preventDefault();
        
        if (formData.phone.length < 10) {
            toast.error("Por favor ingresa un número válido");
            return;
        }

        setIsClaiming(true);
        try {
            const response = await fetch('/api/marketing/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    promoId,
                    ...formData,
                    branch_id: promo.branch?.id || null
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Error al reclamar recompensa");
            }
            
            setClaimedData(result);
            toast.success("¡Felicidades! Recompensa reclamada.");
        } catch (error: any) {
            toast.error(error.message || "Error al reclamar recompensa");
        } finally {
            setIsClaiming(false);
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 gap-4">
                <Loader2 className="animate-spin text-orange-500" size={48} />
                <p className="text-slate-400 font-bold italic animate-pulse">Preparando tu regalo especial...</p>
            </div>
        );
    }

    if (!promo) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center gap-6">
                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center text-slate-600">
                    <Gift size={48} />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-white italic">PROMOCIÓN NO DISPONIBLE</h1>
                    <p className="text-slate-400 max-w-xs">Parece que este enlace ha expirado o la promoción ya no está vigente.</p>
                </div>
                <button 
                    onClick={() => window.location.reload()}
                    className="bg-orange-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest"
                >Reintentar</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500 selection:text-white overflow-hidden relative font-sans">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-600/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />

            <div className="relative z-10 max-w-lg mx-auto px-6 py-12 flex flex-col min-h-screen">
                {/* Brand Header */}
                <div className="flex flex-col items-center gap-2 mb-12 text-center">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-[2rem] shadow-2xl mb-4">
                         <h2 className="text-xl font-black italic tracking-tighter">
                            SASTRE<span className="text-orange-500">PRO</span>
                        </h2>
                    </div>
                    {promo.branch?.name && (
                        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400">
                            <MapPin size={12} className="text-orange-500" />
                            {promo.branch.name}
                        </div>
                    )}
                </div>

                {!claimedData ? (
                    <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        {/* Hero Section */}
                        <div className="space-y-4 text-center">
                            <div className="inline-flex items-center gap-2 bg-orange-600/20 text-orange-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-500/30">
                                <Sparkles size={12} /> Exclusivo para Clientes Elite
                            </div>
                            <h1 className="text-5xl font-black italic leading-[0.9] tracking-tighter uppercase">
                                ¡TIENES UN <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-300 italic ring-offset-orange-500">REGALO</span><br />
                                ESPERANDO!
                            </h1>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed px-4">
                                Gracias por tu preferencia. Regístrate en segundos para obtener tu recompensa especial y usarla en tu próxima visita.
                            </p>
                        </div>

                        {/* Reward Preview Card */}
                        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-1 shadow-2xl">
                            <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2.8rem] p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:scale-110 transition-transform duration-700">
                                    <Gift size={120} />
                                </div>
                                <div className="space-y-1 relative z-10">
                                    <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest mb-2 block">TU BENEFICIO</span>
                                    <h3 className="text-3xl font-black italic uppercase tracking-tight">
                                        {promo.discount_type === 'percentage' 
                                            ? `${promo.discount_value}% DE DESCUENTO` 
                                            : `$${promo.discount_value} DE DESCUENTO`
                                        }
                                    </h3>
                                    <p className="text-slate-500 text-xs font-medium">{promo.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Registration Form */}
                        <form onSubmit={handleClaim} className="space-y-4 pt-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-5 tracking-widest">Nombre Completo</label>
                                <input 
                                    required
                                    placeholder="Juan Pérez"
                                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-5 text-white placeholder:text-slate-600 font-bold focus:bg-white/10 focus:border-orange-500 outline-none transition-all shadow-xl"
                                    value={formData.full_name}
                                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-5 tracking-widest">WhatsApp / Teléfono</label>
                                <div className="relative">
                                    <input 
                                        required
                                        type="tel"
                                        placeholder="55XXXXXXXX"
                                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-5 text-white placeholder:text-slate-600 font-bold focus:bg-white/10 focus:border-orange-500 outline-none transition-all shadow-xl"
                                        value={formData.phone}
                                        onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                                    />
                                    <Smartphone className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700" size={20} />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isClaiming}
                                className="w-full bg-orange-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-slate-900 transform transition-all active:scale-95 flex items-center justify-center gap-3 mt-4 shadow-2xl shadow-orange-900/50"
                            >
                                {isClaiming ? <Loader2 className="animate-spin" size={20} /> : <><Gift size={20} /> Obtener mi Regalo</>}
                            </button>
                            <p className="text-center text-[9px] font-black text-slate-600 uppercase tracking-widest">Tus datos están seguros. Solo los usamos para identificarte en SastrePro.</p>
                        </form>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-10 animate-in zoom-in-95 fade-in duration-700">
                        {/* Success View */}
                        <div className="relative h-40 w-40 flex items-center justify-center">
                            <div className="absolute inset-0 bg-orange-500 blur-[80px] opacity-30 animate-pulse" />
                            <div className="bg-white text-orange-600 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl relative z-10 border-[10px] border-orange-500/10">
                                <CheckCircle2 size={64} />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h2 className="text-4xl font-black italic leading-none tracking-tighter uppercase">¡LISTO PARA <br /> <span className="text-orange-500">ESTRENAR!</span></h2>
                            <p className="text-slate-400 text-sm font-medium">Aquí tienes tu código exclusivo. Presentalo en caja al momento de pagar.</p>
                        </div>

                        {/* Discount Card Card */}
                        <div className="w-full bg-white text-slate-900 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden text-center group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                                <Ticket size={120} />
                            </div>
                            <div className="space-y-1 relative z-10">
                                <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest block mb-2">CÓDIGO DE DESCUENTO</span>
                                <h4 className="text-5xl font-black italic tracking-tight uppercase select-all">
                                    {promo.discount_code}
                                </h4>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500" />
                        </div>

                        <div className="w-full space-y-4">
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(promo.discount_code);
                                    toast.success("Código copiado al portapapeles");
                                }}
                                className="w-full bg-white/10 border border-white/20 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
                            >
                                <Copy size={16} /> Copiar Código
                            </button>
                            <button 
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: 'Mi Regalo SastrePro',
                                            text: `¡Mira mi código de regalo en SastrePro: ${promo.discount_code}!`,
                                            url: window.location.href
                                        });
                                    }
                                }}
                                className="w-full bg-slate-900 text-slate-400 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:text-white transition-all"
                            >
                                <Share2 size={16} /> Compartir Cupón
                            </button>
                        </div>

                        <div className="text-slate-600 text-[10px] font-black text-center uppercase tracking-widest pt-8">
                             Ubicación: {promo.branch?.address || 'Todas las sucursales'}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <div className="p-10 text-center opacity-20 relative z-10">
                <p className="text-[9px] font-black uppercase tracking-[0.3em]">Built with SastrePro AI Engine</p>
            </div>
        </div>
    );
}
