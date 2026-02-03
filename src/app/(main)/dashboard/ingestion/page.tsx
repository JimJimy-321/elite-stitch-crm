"use client";

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export default function IngestionPage() {
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success'>('idle');
    const [reportData, setReportData] = useState<any>(null);

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
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Sparkles className="text-accent" />
                    Agente Ingestor IA
                </h1>
                <p className="text-muted">Carga tus reportes legacy (PDF/Excel) y deja que la IA procese la información automáticamente.</p>
            </div>

            <div className={cn(
                "glass-card p-12 border-dashed border-2 flex flex-col items-center justify-center text-center transition-all",
                status === 'idle' ? "hover:border-accent/50 cursor-pointer" : "cursor-default"
            )} onClick={() => status === 'idle' && simulateIngestion()}>

                {status === 'idle' && (
                    <>
                        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6">
                            <Upload className="text-accent" size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Haz clic para subir un reporte</h3>
                        <p className="text-sm text-muted max-w-sm">Detección automática de tickets, montos y clientes. Formatos admitidos: PDF, XLSX, JPG.</p>
                    </>
                )}

                {(status === 'uploading' || status === 'processing') && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="animate-spin text-accent mb-6" size={48} />
                        <h3 className="text-xl font-bold mb-2">
                            {status === 'uploading' ? 'Subiendo archivo...' : 'Analizando con IA Vision...'}
                        </h3>
                        <p className="text-sm text-muted">Eliminando encabezados y pies de página irrelevantes...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="text-emerald-500" size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">¡Procesamiento Exitoso!</h3>
                        <p className="text-sm text-muted mb-8">{reportData.source} ha sido procesado e integrado.</p>

                        <div className="grid grid-cols-3 gap-8 w-full">
                            <div className="p-4 bg-secondary/50 rounded-xl">
                                <p className="text-[10px] font-bold text-muted uppercase mb-1">Tickets</p>
                                <p className="text-xl font-bold">{reportData.tickets_extracted}</p>
                            </div>
                            <div className="p-4 bg-secondary/50 rounded-xl">
                                <p className="text-[10px] font-bold text-muted uppercase mb-1">Monto Total</p>
                                <p className="text-xl font-bold text-emerald-400">${reportData.revenue_total}</p>
                            </div>
                            <div className="p-4 bg-secondary/50 rounded-xl">
                                <p className="text-[10px] font-bold text-muted uppercase mb-1">Clientes</p>
                                <p className="text-xl font-bold">{reportData.clients_new}</p>
                            </div>
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); setStatus('idle'); }}
                            className="mt-8 btn-primary"
                        >
                            Cargar otro reporte
                        </button>
                    </div>
                )}
            </div>

            <div className="glass-card">
                <div className="p-4 border-b border-border bg-secondary/20">
                    <h4 className="text-sm font-bold flex items-center gap-2">
                        <AlertCircle size={14} className="text-muted" />
                        Historial de Ingesta
                    </h4>
                </div>
                <div className="p-0">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 border-b border-border/50 last:border-0">
                            <div className="flex items-center gap-3">
                                <FileText className="text-muted" size={18} />
                                <div>
                                    <p className="text-sm font-bold">reporte_sucursal_centro_0{i}.pdf</p>
                                    <p className="text-[10px] text-muted">Procesado hace {i} días</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-400">Verificado</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
