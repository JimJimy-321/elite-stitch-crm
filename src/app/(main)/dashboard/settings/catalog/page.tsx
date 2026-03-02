"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ServiceCatalogManager } from '@/features/dashboard/components/catalog/ServiceCatalogManager';

export default function CatalogSettingsPage() {
    return (
        <div className="max-w-6xl space-y-8 animate-fade-in pb-10">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/settings" className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-orange-500 hover:border-orange-200 transition-all shadow-sm">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        Catálogo Global
                    </h1>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1">Configuración Unificada de Servicios</p>
                </div>
            </div>

            <ServiceCatalogManager />
        </div>
    );
}
