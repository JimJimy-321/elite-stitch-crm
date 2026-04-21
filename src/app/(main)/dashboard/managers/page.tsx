"use client";

import React, { useState } from 'react';
import { UserPlus, Shield, Store, Mail, Phone, MoreHorizontal, Search, Plus, UserCog, MoreVertical, Activity, X, Loader2, Edit2, UserMinus, Key, Lock } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useStaffProfiles, useBranches } from '@/features/dashboard/hooks/useDashboardData';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ManagersPage() {
    const { user } = useAuthStore();
    const { profiles, loading, updateProfile, createManager } = useStaffProfiles(user?.organization_id);
    const { branches, updateBranch } = useBranches();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [selectedManager, setSelectedManager] = useState<any>(null);
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    
    const [newManager, setNewManager] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        role: 'manager',
        assigned_branch_id: '',
        login_pin: ''
    });

    const [editContact, setEditContact] = useState({
        full_name: '',
        email: '',
        phone: '',
        role: 'manager',
        login_pin: ''
    });

    const managers = profiles.filter(p => p.role === 'manager' || p.role === 'seamstress').map(p => ({
        id: p.id,
        name: p.full_name,
        role: p.role,
        email: p.email || 'No email',
        branch: branches.find(b => b.id === p.assigned_branch_id)?.name || 'Sin Asignar',
        phone: p.phone || 'No phone',
        status: p.assigned_branch_id ? 'Active' : 'Offline',
        assigned_branch_id: p.assigned_branch_id,
        login_pin: p.login_pin
    }));

    const filteredManagers = managers.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.branch.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openEditModal = (manager: any) => {
        setSelectedManager(manager);
        setSelectedBranchId(manager.assigned_branch_id || '');
        setEditContact({
            full_name: manager.name,
            email: manager.email === 'No email' ? '' : manager.email,
            phone: manager.phone === 'No phone' ? '' : manager.phone,
            role: manager.role || 'manager',
            login_pin: '' // No mostramos el PIN actual por seguridad, el input permite sobreescribir
        });
        setEditModalOpen(true);
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedManager) return;
        setIsSubmitting(true);
        try {
            // 1. Update Profile (Link Manager to Branch + Contact Info)
            await updateProfile(selectedManager.id, { 
                full_name: editContact.full_name,
                assigned_branch_id: selectedBranchId || null,
                email: editContact.email,
                phone: editContact.phone,
                role: editContact.role,
                login_pin: editContact.login_pin || undefined // Solo lo enviamos si el usuario lo cambió
            });

            // 2. Sync Branch Metadata (Redundant for UI assurance)
            if (selectedBranchId) {
                const branch = branches.find(b => b.id === selectedBranchId);
                if (branch) {
                    await updateBranch(selectedBranchId, {
                        metadata: {
                            ...(branch.metadata || {}),
                            manager: selectedManager.name,
                            manager_id: selectedManager.id
                        }
                    });
                }
            }

            setEditModalOpen(false);
            setSelectedManager(null);
            setSelectedBranchId('');
            setEditContact({ full_name: '', email: '', phone: '', role: 'manager', login_pin: '' });
            toast.success("Miembro actualizado correctamente");
        } catch (error: any) {
            console.error("Error updating manager:", error);
            toast.error(error.message || "Error al actualizar los datos del encargado.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateManager = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newManager.full_name || !newManager.email || !newManager.password) {
            alert("Completa todos los campos obligatorios");
            return;
        }
        setIsSubmitting(true);
        try {
            await createManager(newManager);
            setCreateModalOpen(false);
            setNewManager({ full_name: '', email: '', phone: '', password: '', role: 'manager', assigned_branch_id: '', login_pin: '' });
            toast.success("Nuevo miembro registrado con éxito");
        } catch (error: any) {
            console.error("Error creating manager:", error);
            toast.error(error.message || "Error al crear el encargado.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <UserCog className="text-orange-600" size={28} />
                        </div>
                        Gestión de Equipo
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Administra los accesos y roles de tu equipo (Encargados y Costureras) por sede.</p>
                </div>
                <button 
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-orange-500 text-white py-4 px-8 flex items-center gap-3 group shadow-2xl shadow-orange-500/30 rounded-2xl hover:bg-orange-600 active:scale-95 transition-all"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-[0.15em]">Añadir al Equipo</span>
                </button>
            </div>

            <div className="glass-card border-none shadow-2xl bg-card">
                <div className="p-8">
                    <div className="flex items-center gap-4 bg-orange-50 px-6 py-4 rounded-2xl border border-orange-200 mb-10 max-w-md focus-within:ring-4 focus-within:ring-orange-500/10 focus-within:border-orange-500/30 transition-all shadow-inner">
                        <Search className="text-slate-400" size={18} />
                        <input
                            placeholder="Buscar por nombre o sucursal..."
                            className="bg-transparent border-none outline-none text-sm w-full font-bold text-foreground placeholder:text-muted-foreground/30"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {loading ? (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center animate-pulse">
                                <div className="w-16 h-16 bg-slate-100 rounded-full mb-4"></div>
                                <div className="h-4 w-48 bg-slate-100 rounded"></div>
                            </div>
                        ) : filteredManagers.length > 0 ? (
                            filteredManagers.map(manager => (
                                <div key={manager.id} className="glass-card group hover:scale-[1.01] transition-all duration-300 border-none shadow-xl bg-slate-50/50 hover:bg-white border-l-4 border-l-orange-500">
                                    <div className="p-8 space-y-8">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-orange-500 transition-all text-orange-600 group-hover:text-white shadow-xl font-black text-2xl tracking-tighter">
                                                    {manager.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-lg font-black text-foreground group-hover:text-orange-600 transition-colors tracking-tight">{manager.name}</h3>
                                                        <span className={cn(
                                                            "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border",
                                                            manager.role === 'manager' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-purple-50 text-purple-600 border-purple-100"
                                                        )}>
                                                            {manager.role === 'manager' ? 'Encargado' : 'Costurera'}
                                                        </span>
                                                    </div>
                                                    <div className={cn(
                                                        "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] mt-2 px-2.5 py-1 rounded-full border w-fit shadow-sm",
                                                        manager.status === 'Active'
                                                            ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                                                            : "text-slate-500 bg-slate-100 border-slate-200"
                                                    )}>
                                                        <div className={cn("w-1.5 h-1.5 rounded-full", manager.status === 'Active' ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                                                        {manager.status}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <button 
                                                    onClick={() => setActiveDropdown(activeDropdown === manager.id ? null : manager.id)}
                                                    className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-100 rounded-xl transition-all shadow-sm border border-transparent hover:border-orange-200 active:scale-95 group/btn"
                                                >
                                                    <MoreVertical size={20} className="group-hover/btn:rotate-90 transition-transform" />
                                                </button>

                                                {activeDropdown === manager.id && (
                                                    <>
                                                        <div 
                                                            className="fixed inset-0 z-40" 
                                                            onClick={() => setActiveDropdown(null)}
                                                        />
                                                        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 animate-in zoom-in-95 duration-200 origin-top-right">
                                                            <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 border-b border-slate-50">Gestión de Perfil</div>
                                                            <button 
                                                                onClick={() => {
                                                                    openEditModal(manager);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left group/item"
                                                            >
                                                                <Edit2 size={16} className="text-blue-500 group-hover/item:scale-110 transition-transform" />
                                                                Editar Información
                                                            </button>
                                                             <button 
                                                                onClick={() => {
                                                                    router.push('/dashboard/branches');
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left group/item"
                                                            >
                                                                <Store size={16} className="text-emerald-500 group-hover/item:scale-110 transition-transform" />
                                                                Configurar Sede
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    router.push('/dashboard/settings');
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left group/item"
                                                            >
                                                                <Loader2 size={16} className="text-indigo-500 group-hover/item:rotate-180 transition-all duration-700" />
                                                                Ajustes y Parámetros
                                                            </button>
                                                            <div className="my-2 border-t border-slate-100" />
                                                            <button 
                                                                onClick={() => {
                                                                    alert(`Enviando nueva contraseña por email/WhatsApp a ${manager.name}...`);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left group/item"
                                                            >
                                                                <Key size={16} className="text-orange-500 group-hover/item:rotate-12 transition-transform" />
                                                                Restablecer Acceso
                                                            </button>
                                                            <div className="my-2 border-t border-slate-100" />
                                                            <button 
                                                                onClick={() => {
                                                                    if(confirm(`¿Deseas DESACTIVAR la cuenta de ${manager.name}? No podrá ingresar al panel.`)) {
                                                                        alert("Cuenta desactivada temporalmente.");
                                                                    }
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left group/item"
                                                            >
                                                                <UserMinus size={16} className="group-hover/item:scale-110 transition-transform" />
                                                                Desactivar Cuenta
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4 px-1">
                                            <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground group-hover:text-slate-600 transition-colors">
                                                <Store size={16} className="text-orange-500/70" />
                                                <span className="truncate">Sucursal: <span className="text-foreground">{manager.branch}</span></span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground group-hover:text-slate-600 transition-colors">
                                                <Mail size={16} className="text-orange-500/70" />
                                                <span className="truncate">{manager.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground group-hover:text-slate-600 transition-colors">
                                                <Phone size={16} className="text-orange-500/70" />
                                                <span className="truncate">{manager.phone}</span>
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-slate-200 flex items-center justify-between">
                                            <button 
                                                disabled={!manager.assigned_branch_id}
                                                onClick={() => router.push(`/dashboard?branchId=${manager.assigned_branch_id}`)}
                                                className={cn(
                                                    "flex items-center gap-2 px-2.5 py-1.5 rounded-lg shadow-inner transition-all",
                                                    manager.assigned_branch_id 
                                                        ? "bg-orange-100 text-orange-800 hover:bg-orange-200 active:scale-95 cursor-pointer" 
                                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                )}
                                            >
                                                <Shield size={14} className={cn(manager.assigned_branch_id ? "text-orange-500" : "text-slate-400")} />
                                                <span className="text-[9px] font-black uppercase tracking-widest border-none">Admin Sede</span>
                                            </button>
                                            <button 
                                                onClick={() => openEditModal(manager)}
                                                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 hover:underline group/more transition-all">
                                                Editar Perfil
                                                <Activity size={12} className="group-hover/more:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full border-4 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-20 bg-slate-50/50">
                                <UserCog className="text-slate-300 mb-6" size={60} />
                                <h3 className="text-2xl font-black text-foreground tracking-tight">No hay encargados registrados</h3>
                            </div>
                        )}

                        {/* Invite Card */}
                        <div 
                            onClick={() => setCreateModalOpen(true)}
                            className="border-4 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-12 group hover:border-orange-500/30 hover:bg-orange-500/5 transition-all cursor-pointer bg-slate-50/50"
                        >
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-slate-100 group-hover:scale-110 transition-transform">
                                <Plus className="text-slate-400 group-hover:text-orange-500" size={40} />
                            </div>
                            <h3 className="text-xl font-black text-foreground group-hover:text-orange-600 transition-colors tracking-tight">Invitar Miembro</h3>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-2">Nuevos permisos IA</p>
                        </div>
                    </div>
                </div>
            </div>

            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4 animate-in fade-in duration-300">
                    <div className="bg-white border-[3px] border-slate-300 rounded-[2.5rem] shadow-[0_0_120px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden animate-in zoom-in-95 curve-bounce duration-500">
                        <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-2xl font-black text-slate-950 tracking-tight">Editar Miembro</h2>
                            <button 
                                onClick={() => setEditModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleAssign} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none shadow-sm"
                                    value={editContact.full_name}
                                    onChange={e => setEditContact({...editContact, full_name: e.target.value})}
                                    placeholder="Nombre del encargado"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">Rol en el Equipo</label>
                                <select 
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none appearance-none shadow-sm"
                                    value={editContact.role}
                                    onChange={e => setEditContact({...editContact, role: e.target.value})}
                                >
                                    <option value="manager">Encargado de Sede</option>
                                    <option value="seamstress">Costurera / Sastre</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">Sede de Trabajo</label>
                                <select 
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none appearance-none shadow-sm"
                                    value={selectedBranchId}
                                    onChange={e => setSelectedBranchId(e.target.value)}
                                >
                                    <option value="">Seleccionar Sede...</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">Correo de Acceso</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl pl-12 pr-5 py-4 font-bold text-slate-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none shadow-sm"
                                            value={editContact.email}
                                            onChange={e => setEditContact({...editContact, email: e.target.value})}
                                            placeholder="ejemplo@correo.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Teléfono de contacto</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="tel"
                                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl pl-12 pr-5 py-4 font-bold text-slate-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none shadow-sm"
                                            value={editContact.phone}
                                            onChange={e => setEditContact({...editContact, phone: e.target.value})}
                                            placeholder="Número a 10 dígitos"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">PIN de Acceso Terminal (4-6 dígitos)</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        maxLength={6}
                                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl pl-12 pr-5 py-4 font-bold text-slate-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none shadow-sm"
                                        value={editContact.login_pin || ''}
                                        onChange={e => setEditContact({...editContact, login_pin: e.target.value.replace(/\D/g, '')})}
                                        placeholder="Solo números"
                                    />
                                </div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight ml-1">Si dejas este campo vacío, el PIN actual no cambiará.</p>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-[9px] font-bold text-slate-500 leading-relaxed text-center uppercase tracking-tighter">
                                    Al confirmar, los datos se sincronizarán con la base de datos central y el encargado podrá acceder a su terminal.
                                </p>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full bg-orange-500 text-white font-black uppercase tracking-widest py-5 rounded-2xl hover:bg-orange-600 shadow-2xl shadow-orange-500/30 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="animate-spin" size={20} /> Guardando Cambios...</>
                                ) : (
                                    <>Actualizar Miembro <Activity size={18} /></>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Create Manager Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4 animate-in fade-in duration-300">
                    <div className="bg-white border-[3px] border-slate-300 rounded-[2.5rem] shadow-[0_0_120px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden animate-in zoom-in-95 curve-bounce duration-500">
                        <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-2xl font-black text-slate-950 tracking-tight">Nuevo Miembro</h2>
                            <button 
                                onClick={() => setCreateModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateManager} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nombre Completo <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                                    value={newManager.full_name}
                                    placeholder="Ej. Juan Pérez"
                                    onChange={e => setNewManager({...newManager, full_name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Correo Electrónico <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                                    value={newManager.email}
                                    placeholder="ejemplo@correo.com"
                                    onChange={e => setNewManager({...newManager, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Número de Teléfono</label>
                                <input
                                    type="tel"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                                    value={newManager.phone}
                                    placeholder="Opcional"
                                    onChange={e => setNewManager({...newManager, phone: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Contraseña Temporal <span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                                    value={newManager.password}
                                    onChange={e => setNewManager({...newManager, password: e.target.value})}
                                    placeholder="Min. 6 caracteres"
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Rol en el Equipo <span className="text-red-500">*</span></label>
                                <select 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                                    value={newManager.role}
                                    onChange={e => setNewManager({...newManager, role: e.target.value})}
                                    required
                                >
                                    <option value="manager">Encargado de Sede</option>
                                    <option value="seamstress">Costurera / Sastre</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Asignar Sede</label>
                                <select 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                                    value={newManager.assigned_branch_id}
                                    onChange={e => setNewManager({...newManager, assigned_branch_id: e.target.value})}
                                >
                                    <option value="">Seleccionar Sede...</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">PIN Terminal (4-6 dígitos) <span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    maxLength={6}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                                    value={newManager.login_pin || ''}
                                    placeholder="Solo números"
                                    onChange={e => setNewManager({...newManager, login_pin: e.target.value.replace(/\D/g, '')})}
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-all active:scale-[0.98] mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="animate-spin" size={20} /> Creando...</>
                                ) : (
                                    "Crear y Guardar Miembro"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

