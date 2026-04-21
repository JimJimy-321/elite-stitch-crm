'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { marketingService } from '@/features/dashboard/services/marketingService';
import { dashboardService } from '@/features/dashboard/services/dashboardService';
import { 
    Tag, 
    Plus, 
    QrCode, 
    Users, 
    TrendingUp, 
    Calendar, 
    ChevronRight, 
    Download,
    Loader2,
    X,
    Gift,
    Trash2,
    CheckCircle2,
    AlertCircle,
    MessageSquare,
    Check,
    Edit3,
    BarChart3,
    Clock,
    Layout,
    ArrowRight,
    Heart,
    DollarSign,
    Scissors
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';

export default function MarketingPage() {
    const { user } = useAuthStore();
    const [promotions, setPromotions] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState<any>(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'promotions' | 'templates'>('promotions');
    const [templates, setTemplates] = useState<any[]>([]);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

    const [newPromo, setNewPromo] = useState({
        name: '',
        description: '',
        discount_code: '',
        discount_value: 0,
        discount_type: 'percentage',
        target_branch_id: '',
        ends_at: ''
    });

    useEffect(() => {
        if (user?.organization_id) {
            loadData();
        }
    }, [user]);

    async function loadData() {
        if (!user?.organization_id) return;
        const orgId = user.organization_id;
        setIsLoading(true);
        try {
            const [promoData, branchData, templateData] = await Promise.all([
                marketingService.getPromotions(orgId),
                dashboardService.getBranches(orgId),
                marketingService.getTemplates(orgId)
            ]);
            setPromotions(promoData);
            setBranches(branchData);
            setTemplates(templateData);
        } catch (error: any) {
            toast.error("Error al cargar datos: " + error.message);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCreate() {
        if (!newPromo.name || !newPromo.discount_code) {
            toast.error("Nombre y código son obligatorios");
            return;
        }

        try {
            setIsCreating(true);
            await marketingService.createPromotion({
                ...newPromo,
                organization_id: user!.organization_id,
                target_branch_id: newPromo.target_branch_id || null
            });
            toast.success("Promoción creada con éxito");
            setIsCreating(false);
            setNewPromo({
                name: '',
                description: '',
                discount_code: '',
                discount_value: 0,
                discount_type: 'percentage',
                target_branch_id: '',
                ends_at: ''
            });
            loadData();
        } catch (error: any) {
            toast.error("Error al crear: " + error.message);
            setIsCreating(false);
        }
    }

    const downloadQR = (id: string, name: string) => {
        const svg = document.getElementById(`qr-${id}`);
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width + 40;
            canvas.height = img.height + 40;
            if (ctx) {
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 20, 20);
                const pngFile = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.download = `QR-SASTREPRO-${name.toUpperCase()}.png`;
                downloadLink.href = `${pngFile}`;
                downloadLink.click();
            }
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="animate-spin text-orange-500" size={40} />
                <p className="text-slate-400 font-bold animate-pulse">Cargando Estrategia de Marketing...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black italic text-slate-900 tracking-tight flex items-center gap-3">
                        MARKETING <span className="text-orange-600">& FIDELIZACIÓN</span>
                    </h1>
                    <p className="text-slate-500 font-medium tracking-tight">Crea promociones y gestiona tus plantillas de WhatsApp para automatizar tu negocio.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white border rounded-2xl px-4 py-2 flex items-center gap-4 shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-400">Total Redenciones</span>
                            <span className="text-xl font-black text-slate-900">{promotions.reduce((acc, p) => acc + (p.claims_count || 0), 0)}</span>
                        </div>
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-[2rem] max-w-md border border-slate-200 shadow-inner">
                <button 
                    onClick={() => setActiveTab('promotions')}
                    className={cn(
                        "flex-1 py-4 px-6 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-3",
                        activeTab === 'promotions' 
                            ? "bg-white text-orange-600 shadow-xl shadow-slate-200 transform scale-[1.02]" 
                            : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <Tag size={18} /> Campañas
                </button>
                <button 
                    onClick={() => setActiveTab('templates')}
                    className={cn(
                        "flex-1 py-4 px-6 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-3",
                        activeTab === 'templates' 
                            ? "bg-white text-orange-600 shadow-xl shadow-slate-200 transform scale-[1.02]" 
                            : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <MessageSquare size={18} /> Plantillas
                </button>
            </div>

            {activeTab === 'promotions' ? (

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lateral: Crear Promoción */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
                        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                            <Tag size={180} />
                        </div>
                        
                        <div className="relative z-10 space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black italic">Nueva Campaña</h2>
                                <p className="text-slate-400 text-sm font-medium">Lanza una promoción en segundos para tus sucursales.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Nombre de la Promoción</label>
                                    <input 
                                        placeholder="Ej: Regalo por Apertura"
                                        className="w-full bg-slate-800 border-none rounded-2xl px-4 py-4 text-white placeholder:text-slate-600 font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                                        value={newPromo.name}
                                        onChange={e => setNewPromo({...newPromo, name: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Código SastrePro</label>
                                        <input 
                                            placeholder="BIENVENIDO10"
                                            className="w-full bg-slate-800 border-none rounded-2xl px-4 py-4 text-white placeholder:text-slate-600 font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                                            value={newPromo.discount_code}
                                            onChange={e => setNewPromo({...newPromo, discount_code: e.target.value.toUpperCase()})}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Valor</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-slate-800 border-none rounded-2xl px-4 py-4 text-white font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                                            value={newPromo.discount_value}
                                            onChange={e => setNewPromo({...newPromo, discount_value: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 p-1 bg-slate-800 rounded-2xl">
                                    <button 
                                        onClick={() => setNewPromo({...newPromo, discount_type: 'percentage'})}
                                        className={cn(
                                            "flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all",
                                            newPromo.discount_type === 'percentage' ? "bg-orange-600 text-white" : "text-slate-400 hover:text-white"
                                        )}
                                    >Porcentaje (%)</button>
                                    <button 
                                        onClick={() => setNewPromo({...newPromo, discount_type: 'fixed'})}
                                        className={cn(
                                            "flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all",
                                            newPromo.discount_type === 'fixed' ? "bg-orange-600 text-white" : "text-slate-400 hover:text-white"
                                        )}
                                    >Fijo ($)</button>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Sucursal (Opcional)</label>
                                    <select 
                                        className="w-full bg-slate-800 border-none rounded-2xl px-4 py-4 text-white font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none appearance-none"
                                        value={newPromo.target_branch_id}
                                        onChange={e => setNewPromo({...newPromo, target_branch_id: e.target.value})}
                                    >
                                        <option value="">Todas las sucursales</option>
                                        {branches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <button 
                                    onClick={handleCreate}
                                    disabled={isCreating}
                                    className="w-full bg-orange-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 hover:scale-[1.02] transform transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-orange-900/40"
                                >
                                    {isCreating ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                                    Activar Promoci\u00F3n
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Principal: Listado de Promociones */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black italic text-slate-900 tracking-tight flex items-center gap-3">
                            Campañas <span className="text-slate-300">Activas</span>
                        </h2>
                        <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {promotions.length} Promos
                        </div>
                    </div>

                    {promotions.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center gap-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                <Gift size={40} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-lg font-black text-slate-900 italic">Sin promociones activas</h4>
                                <p className="text-slate-400 text-sm font-medium">Crea tu primera campaña para empezar a captar clientes.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {promotions.map((promo) => (
                                <div key={promo.id} className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col">
                                    <div className="p-6 pb-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black uppercase py-0.5 px-2 bg-orange-50 text-orange-600 rounded-full border border-orange-100">
                                                        {promo.discount_type === 'percentage' ? `${promo.discount_value}% OFF` : `$${promo.discount_value} OFF`}
                                                    </span>
                                                    <span className="text-[10px] font-black uppercase text-slate-400">
                                                        {promo.branch?.name || 'GLOBAL'}
                                                    </span>
                                                </div>
                                                <h4 className="text-xl font-black italic text-slate-900 group-hover:text-orange-600 transition-colors uppercase tracking-tight">
                                                    {promo.name}
                                                </h4>
                                            </div>
                                            <div className="bg-slate-50 w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition-all">
                                                <ChevronRight size={20} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Summary ROI */}
                                    <div className="grid grid-cols-4 gap-2 p-4 bg-slate-50 border-y border-slate-100">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase">Leads</span>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Users size={12} className="text-blue-500" />
                                                <span className="text-xs font-black text-slate-800">{promo.claims_count || 0}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase">Notas</span>
                                            <div className="flex items-center gap-1 mt-1">
                                                <CheckCircle2 size={12} className="text-green-500" />
                                                <span className="text-xs font-black text-slate-800">{promo.conversion_count || 0}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase">Prendas</span>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Scissors size={12} className="text-purple-500" />
                                                <span className="text-xs font-black text-slate-800">{promo.garment_count || 0}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase">Impacto ROI</span>
                                            <div className="flex items-center gap-1 mt-1 text-emerald-600">
                                                <DollarSign size={12} />
                                                <span className="text-xs font-black">
                                                    {((promo.claims_count || 0) * (parseFloat(promo.discount_value) || 0)).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 pt-4 flex gap-2 mt-auto">
                                        <button 
                                            onClick={() => {
                                                setSelectedPromo(promo);
                                                setShowQRModal(true);
                                            }}
                                            className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 transition-all"
                                        >
                                            <QrCode size={14} /> Mostrar QR
                                        </button>
                                        <button 
                                            onClick={() => downloadQR(promo.id, promo.name)}
                                            className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-orange-50 hover:text-orange-600 transition-all border border-slate-200"
                                        >
                                            <Download size={18} />
                                        </button>
                                    </div>

                                    {/* SVG oculto para descarga */}
                                    <div className="hidden">
                                        <QRCodeSVG 
                                            id={`qr-${promo.id}`}
                                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/regalo/${promo.id}`}
                                            size={512}
                                            level="H"
                                            includeMargin={true}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            ) : (
                <div className="animate-in slide-in-from-bottom-10 duration-700 space-y-8">
                    {/* WhatsApp Templates View */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar: Explicación y Sugerencias */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-gradient-to-br from-blue-900 to-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                                    <MessageSquare size={140} />
                                </div>
                                <div className="relative z-10 space-y-6">
                                    <h3 className="text-2xl font-black italic tracking-tight">Plantillas Meta</h3>
                                    <p className="text-blue-100/70 text-sm font-medium leading-relaxed">
                                        Para enviar notificaciones automáticas (ej: "Su prenda está lista"), debe registrar en SastrePro el nombre de la plantilla que aprobó en Meta.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                                            <CheckCircle2 size={24} className="text-emerald-400" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Aprobación Rápida</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                                            <AlertCircle size={24} className="text-amber-400" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Respetar Mayúsculas</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Plantillas Recomendadas</h4>
                                <div className="space-y-4">
                                    {[
                                        { id: '1', name: 'prenda_lista_v1', desc: 'Aviso de entrega personalizada' },
                                        { id: '2', name: 'bienvenida_regalo', desc: 'Cupón de primer registro (QR)' },
                                        { id: '3', name: 'agradecimiento_v1', desc: 'Gracias por tu visita' },
                                        { id: '4', name: 'festivo_promo', desc: 'Campaña día festivo' }
                                    ].map(sug => (
                                        <div key={sug.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-orange-500 transition-all cursor-pointer relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-2 opacity-5 translate-x-2 -translate-y-2">
                                                <Heart size={40} />
                                            </div>
                                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight relative z-10">{sug.name}</p>
                                            <p className="text-[9px] text-slate-500 font-bold relative z-10">{sug.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Content: Templates List */}
                        <div className="lg:col-span-3 space-y-6">
                            <div className="flex items-center justify-between px-4">
                                <h2 className="text-2xl font-black italic text-slate-900 flex items-center gap-3">
                                    Mis <span className="text-slate-300 uppercase leading-none">Plantillas</span>
                                </h2>
                                <button 
                                    onClick={() => {
                                        setSelectedTemplate(null);
                                        setIsTemplateModalOpen(true);
                                    }}
                                    className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20"
                                >
                                    <Plus size={16} /> Registrar Plantilla
                                </button>
                            </div>

                            {templates.length === 0 ? (
                                <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center gap-6">
                                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                                        <MessageSquare size={40} />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-black text-slate-900 italic uppercase">No hay plantillas registradas</h4>
                                        <p className="text-slate-400 text-sm font-medium max-w-sm">Registra los nombres de tus plantillas aprobadas en Meta para activar el envío automático.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {templates.map((tpl) => (
                                        <div key={tpl.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-8 text-slate-50 group-hover:text-orange-50 transition-colors">
                                                <Layout size={80} />
                                            </div>
                                            
                                            <div className="relative z-10 space-y-6">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn(
                                                                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                                                tpl.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                                                            )}>
                                                                {tpl.status || 'REGISTRADA'}
                                                            </span>
                                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{tpl.category || 'MKT'}</span>
                                                        </div>
                                                        <h4 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 group-hover:text-orange-600 transition-colors">
                                                            {tpl.name}
                                                        </h4>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedTemplate(tpl);
                                                                setIsTemplateModalOpen(true);
                                                            }}
                                                            className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-orange-50 hover:text-orange-600 transition-all border border-slate-100"
                                                        >
                                                            <Edit3 size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={async () => {
                                                                if(confirm('¿Eliminar registro de plantilla?')) {
                                                                    await marketingService.deleteTemplate(tpl.id);
                                                                    loadData();
                                                                    toast.success('Registro eliminado');
                                                                }
                                                            }}
                                                            className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] font-medium text-slate-500 leading-relaxed max-h-24 overflow-hidden relative">
                                                    <p>{tpl.body_text || 'Sin previsualización de texto.'}</p>
                                                    <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-slate-50 to-transparent" />
                                                </div>

                                                <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Envíos</span>
                                                        <span className="text-sm font-black text-slate-900">0</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Clicks</span>
                                                        <span className="text-sm font-black text-slate-900">0%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal QR mejorado */}
            {showQRModal && selectedPromo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowQRModal(false)} />
                    <div className="relative bg-white rounded-[3rem] p-10 max-w-sm w-full animate-in zoom-in-95 fade-in duration-300 shadow-2xl overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-2 bg-orange-600" />
                        
                        <div className="flex flex-col items-center gap-8 text-center pt-4">
                            <div className="bg-slate-50 p-6 rounded-[2.5rem] shadow-inner relative group-hover:bg-white transition-all duration-500 border border-slate-100">
                                <QRCodeSVG 
                                    id="qr-modal-view"
                                    value={`${window.location.origin}/regalo/${selectedPromo.id}`}
                                    size={240}
                                    level="H"
                                    includeMargin={false}
                                    fgColor="#0f172a"
                                />
                            </div>
                            
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-900">{selectedPromo.name}</h3>
                                    <p className="text-slate-400 font-medium text-[10px] uppercase tracking-widest">Código: {selectedPromo.code}</p>
                                </div>
                                <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-[9px] font-black border border-orange-100 tracking-widest uppercase">
                                    Escanea para reclamar regalo
                                </div>
                            </div>
                            
                            <div className="w-full pt-4 space-y-3">
                                <button 
                                    onClick={() => downloadQR(selectedPromo.id, selectedPromo.name)}
                                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-xl shadow-slate-200"
                                >
                                    <Download size={16} /> Descargar Imagen QR
                                </button>
                                <button 
                                    onClick={() => setShowQRModal(false)}
                                    className="w-full bg-transparent text-slate-400 py-2 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-slate-600 transition-all"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Formulario de Nueva Promo */}
            {showQRModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* ... (Existing QR Modal content is actually already in the file) ... */}
                </div>
            )}

            {/* Template Modal */}
            {isTemplateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsTemplateModalOpen(false)} />
                    <div className="relative bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tight">
                                    {selectedTemplate ? 'Editar Plantilla' : 'Registrar Plantilla'}
                                </h3>
                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Configuración de IDs (Detección Manual/Auto)</p>
                            </div>
                            <button onClick={() => setIsTemplateModalOpen(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nombre en Meta (Case Sensitive)</label>
                                    <input 
                                        placeholder="Ej: prenda_lista_auto"
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                                        defaultValue={selectedTemplate?.name}
                                        id="tpl-name"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Categor\u00EDa</label>
                                        <select 
                                            id="tpl-category"
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 transition-all appearance-none"
                                            defaultValue={selectedTemplate?.category || 'MARKETING'}
                                        >
                                            <option value="MARKETING">Marketing</option>
                                            <option value="UTILITY">Utilidad / Servicio</option>
                                            <option value="AUTHENTICATION">Autenticaci\u00F3n</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Estado Manual</label>
                                        <select 
                                            id="tpl-status"
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 transition-all appearance-none"
                                            defaultValue={selectedTemplate?.status || 'APPROVED'}
                                        >
                                            <option value="APPROVED">Aprobada</option>
                                            <option value="PENDING">Pendiente</option>
                                            <option value="REJECTED">Rechazada</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Contenido del Mensaje (Referencia)</label>
                                    <textarea 
                                        id="tpl-body"
                                        rows={4}
                                        placeholder="Hola {{1}}, su prenda está lista..."
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                                        defaultValue={selectedTemplate?.body_text}
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={async () => {
                                    const name = (document.getElementById('tpl-name') as HTMLInputElement).value;
                                    const category = (document.getElementById('tpl-category') as HTMLSelectElement).value;
                                    const status = (document.getElementById('tpl-status') as HTMLSelectElement).value;
                                    const body_text = (document.getElementById('tpl-body') as HTMLTextAreaElement).value;

                                    if(!name) return toast.error('El nombre es obligatorio');

                                    try {
                                        if (selectedTemplate) {
                                            await marketingService.updateTemplate(selectedTemplate.id, { name, category, status, body_text });
                                            toast.success('Plantilla actualizada');
                                        } else {
                                            await marketingService.createTemplate({ name, category, status, body_text, organization_id: user?.organization_id });
                                            toast.success('Plantilla registrada');
                                        }
                                        setIsTemplateModalOpen(false);
                                        loadData();
                                    } catch (err: any) {
                                        toast.error(err.message);
                                    }
                                }}
                                className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
                            >
                                <Check size={18} /> Guardar Configuraci\u00F3n
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

