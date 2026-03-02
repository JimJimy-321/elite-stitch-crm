"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, AlertCircle, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Modal } from '@/shared/components/ui/Modal';
import { toast } from 'sonner';

export function ServiceCatalogManager() {
    const { user } = useAuthStore();
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newServiceName, setNewServiceName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        if (user?.organization_id) {
            loadServices();
        }
    }, [user]);

    const loadServices = async () => {
        if (!user?.organization_id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('service_catalogs')
                .select('*')
                .eq('organization_id', user.organization_id)
                .order('name', { ascending: true });

            if (error) throw error;
            setServices(data || []);
        } catch (error: any) {
            console.error("Error cargando catálogo", error);
            toast.error("No se pudo cargar el catálogo de servicios.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddService = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newServiceName.trim() || !user?.organization_id) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('service_catalogs')
                .insert({
                    name: newServiceName.trim().toUpperCase(),
                    organization_id: user.organization_id
                });

            if (error) {
                if (error.code === '23505') throw new Error("Este servicio ya existe en el catálogo.");
                throw error;
            }

            toast.success("Servicio agregado exitosamente.");
            setNewServiceName('');
            setIsAddModalOpen(false);
            loadServices();
        } catch (error: any) {
            toast.error(error.message || "Error al agregar el servicio.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteService = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de eliminar "${name}"?\nSi el servicio ya tiene órdenes históricas asociadas, no podrá ser eliminado para mantener la integridad de los datos.`)) return;

        try {
            const { error } = await supabase
                .from('service_catalogs')
                .delete()
                .eq('id', id);

            if (error) {
                if (error.code === '23503') {
                    throw new Error("No se puede eliminar porque existen órdenes históricas con este servicio.");
                }
                throw error;
            }
            toast.success("Servicio eliminado.");
            loadServices();
        } catch (error: any) {
            toast.error(error.message || "Error al eliminar el servicio.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Catálogo de Servicios</h2>
                    <p className="text-sm font-bold text-slate-400">Define los tipos de arreglos globales para todas tus sucursales. Los precios se definirán al momento de crear la nota.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2"
                >
                    <Plus size={16} /> Agregar Servicio
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden p-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
                    </div>
                ) : services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {services.map(service => (
                            <div key={service.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-orange-200 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                        <Tag size={18} />
                                    </div>
                                    <span className="font-black text-sm uppercase text-slate-700 tracking-tight">{service.name}</span>
                                </div>
                                <button
                                    onClick={() => handleDeleteService(service.id, service.name)}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Eliminar Servicio"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 flex flex-col items-center">
                        <AlertCircle className="text-slate-200 mb-4" size={48} />
                        <p className="text-sm font-black uppercase tracking-widest text-slate-400">No hay servicios en el catálogo</p>
                        <p className="text-xs font-bold text-slate-300 mt-2">Agrega el primer tipo de arreglo para que esté disponible en las sucursales.</p>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Nuevo Tipo de Arreglo"
            >
                <form onSubmit={handleAddService} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nombre del Servicio</label>
                        <input
                            type="text"
                            required
                            placeholder="EJ. BASTILLA DE VESTIDO"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 h-14 font-black uppercase text-slate-700 focus:border-orange-500 outline-none transition-all"
                            value={newServiceName}
                            onChange={(e) => setNewServiceName(e.target.value.toUpperCase())}
                        />
                        <p className="text-xs font-bold text-orange-500 ml-2 mt-2">No incluyas precios, esto se definirá al momento de agendar el arreglo.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !newServiceName.trim()}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white h-14 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-xl shadow-orange-500/20"
                    >
                        {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={18} /> Guardar Servicio</>}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
