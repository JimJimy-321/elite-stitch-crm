"use client";

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ReportData {
    tickets_extracted: number;
    revenue_total: number;
    clients_new: number;
    source: string;
}

export default function IngestionPage() {
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success'>('idle');
    const [reportData, setReportData] = useState<ReportData | null>(null);

    const simulateIngestion = () => {
        setStatus('uploading');
        setTimeout(() => {
            setStatus('processing');
            setTimeout(() => {
                setStatus('success');
                setReportData({
                    tickets_extracted: 12,
                    revenue_total: 18450,
                    clients_new: 3,
                    source: "Reporte_Enero_Sede_Sur.pdf"
                });
            }, 3000);
        }, 2000);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                        <Sparkles className="text-orange-600" size={28} />
                    </div>
                    Agente Ingestor IA
                </h1>
                <p className="text-muted-foreground text-sm font-medium">Carga tus reportes legacy (PDF / Excel) y deja que nuestra IA Vision procese la información automáticamente.</p>
            </div>

            <div className={cn(
                "glass-card p-16 border-dashed border-2 flex flex-col items-center justify-center text-center transition-all duration-500 rounded-[3rem] bg-card/50",
                status === 'idle' ? "border-orange-200 hover:border-orange-500/50 hover:bg-orange-500/[0.02] cursor-pointer shadow-xl" : "border-orange-500/20 shadow-2xl"
            )} onClick={() => status === 'idle' && simulateIngestion()}>

                {status === 'idle' && (
                    <>
                        <div className="w-24 h-24 bg-orange-500/10 rounded-[2rem] flex items-center justify-center mb-8 border border-orange-500/20 shadow-inner group-hover:scale-110 transition-transform">
                            <Upload className="text-orange-600" size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">Haz clic para subir un reporte</h3>
                        <p className="text-sm text-muted-foreground font-medium max-w-sm leading-relaxed">
                            Detección automática de tickets, montos y clientes. Admite <span className="text-orange-600 font-bold">PDF, XLSX y capturas en JPG</span>.
                        </p>
                    </>
                )}

                {(status === 'uploading' || status === 'processing') && (
                    <div className="flex flex-col items-center py-10">
                        <div className="relative mb-10">
                            <Loader2 className="animate-spin text-orange-500" size={64} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="text-orange-300 animate-pulse" size={24} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">
                            {status === 'uploading' ? 'Subiendo archivo...' : 'Analizando con IA Vision...'}
                        </h3>
                        <p className="text-sm text-muted-foreground font-bold uppercase tracking-[0.2em] animate-pulse">
                            Eliminando ruido y extrayendo campos clave...
                        </p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center w-full max-w-2xl">
                        <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-emerald-100 shadow-inner">
                            <CheckCircle2 className="text-emerald-500" size={48} />
                        </div>
                        <h3 className="text-3xl font-black text-foreground mb-2 tracking-tight">¡Procesamiento Exitoso!</h3>
                        <p className="text-sm text-muted-foreground font-medium mb-12">El archivo <span className="text-orange-600 font-black">{reportData?.source}</span> ha sido integrado.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                            <DataBadge label="Tickets Extraídos" value={reportData?.tickets_extracted} />
                            <DataBadge label="Monto Total" value={`$${reportData?.revenue_total}`} highlighting />
                            <DataBadge label="Nuevos Clientes" value={reportData?.clients_new} />
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); setStatus('idle'); }}
                            className="mt-12 bg-orange-500 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/30 hover:bg-orange-600 active:scale-95 transition-all"
                        >
                            Cargar otro reporte
                        </button>
                    </div>
                )}
            </div>

            <div className="glass-card overflow-hidden border-none shadow-2xl bg-white rounded-[2rem]">
                <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 text-slate-500">
                        <div className="p-1.5 bg-slate-100 rounded-lg">
                            <AlertCircle size={16} className="text-slate-400" />
                        </div>
                        Historial de Ingesta Reciente
                    </h4>
                    <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 uppercase tracking-widest">
                        Total: 142 Procesados
                    </span>
                </div>
                <div className="p-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-5 rounded-[1.5rem] hover:bg-slate-50/50 transition-all group cursor-default">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-all shadow-sm">
                                    <FileText size={22} />
                                </div>
                                <div>
                                    <p className="text-[15px] font-black text-foreground tracking-tight group-hover:text-orange-600 transition-colors">reporte_sucursal_centro_0{i}.pdf</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Procesado hace {i} días</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black tracking-widest uppercase text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">Verificado</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function DataBadge({ label, value, highlighting }: { label: string, value: any, highlighting?: boolean }) {
    return (
        <div className="p-6 bg-slate-50 border border-slate-100 rounded-[1.75rem] shadow-inner text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
            <p className={cn(
                "text-2xl font-black tracking-tighter",
                highlighting ? "text-emerald-600" : "text-foreground"
            )}>{value}</p>
        </div>
    );
}
