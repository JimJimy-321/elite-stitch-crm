"use client";

import React, { useState, useEffect } from 'react';
import { Brain, Save, Info, Power, BookOpen, MessageSquare, AlertTriangle, CheckCircle2, Key, Zap, Activity } from 'lucide-react';
import { aiAgentService, AgentConfig } from '@/features/chat/services/aiAgentService';
import { toast } from 'sonner';

interface AiAgentSettingsProps {
    organizationId: string;
}

export function AiAgentSettings({ organizationId }: AiAgentSettingsProps) {
    const [configs, setConfigs] = useState<AgentConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<AgentConfig>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadConfigs();
    }, [organizationId]);

    const loadConfigs = async () => {
        try {
            setLoading(true);
            const data = await aiAgentService.getConfigs(organizationId);
            setConfigs(data);
            if (data.length > 0) {
                setSelectedId(data[0].id);
                setFormData(data[0]);
            }
        } catch (error) {
            console.error('Error loading AI configs:', error);
            toast.error('Error al cargar la configuración de la IA');
        } finally {
            setLoading(false);
        }
    };

    const currentConfig = configs.find(c => c.id === selectedId);

    useEffect(() => {
        if (currentConfig) {
            setFormData(currentConfig);
        }
    }, [selectedId]);

    const handleLocalUpdate = (updates: Partial<AgentConfig>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleSave = async () => {
        if (!selectedId) return;
        setSaving(true);
        try {
            await aiAgentService.updateConfig(selectedId, formData);
            setConfigs(prev => prev.map(c => c.id === selectedId ? { ...c, ...formData } as AgentConfig : c));
            toast.success('CONFIGURACIÓN GUARDADA EXITOSAMENTE');
        } catch (error) {
            toast.error('Error al guardar en la base de datos');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-12 text-center animate-pulse font-black uppercase text-[10px] tracking-widest text-muted-foreground">Iniciando Red Neuronal...</div>;

    if (configs.length === 0) {
        return (
            <div className="glass-card p-12 text-center border-dashed border-2 border-border">
                <AlertTriangle className="mx-auto text-amber-500 mb-4" size={32} />
                <h3 className="font-black uppercase text-sm tracking-tight mb-2">No se encontraron agentes configurados</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">Vincule un número de WhatsApp en la sección de Sucursales para activar la IA.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Branch Selector */}
            <div className="flex flex-wrap gap-2">
                {configs.map(config => (
                    <button
                        key={config.id}
                        onClick={() => setSelectedId(config.id)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                            selectedId === config.id 
                            ? 'bg-foreground text-background border-foreground shadow-lg' 
                            : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                        }`}
                    >
                        NÚMERO: {config.phone_number_id || 'SIN VINCULAR'}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Main Settings */}
                <div className="space-y-6">
                    <div className="glass-card p-8 border-t-4 border-t-primary">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Brain size={20} />
                                </div>
                                <div>
                                    <h4 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Personalidad y Brain</h4>
                                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter mt-0.5">Define cómo habla y cómo debe comportarse el agente.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={formData?.is_active || false}
                                    onChange={(e) => handleLocalUpdate({ is_active: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                                    {formData?.is_active ? 'Activo' : 'Pausado'}
                                </span>
                            </label>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <MessageSquare size={14} className="text-primary" />
                                    Instrucción del Sistema (Prompt)
                                </label>
                                <textarea 
                                    className="w-full bg-secondary/30 border border-border rounded-2xl p-4 text-xs font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[160px] leading-relaxed"
                                    placeholder="Ej: Eres un experto sastre llamado Juan de Elite Stitch. Tu tono es premium y servicial..."
                                    value={formData?.system_prompt || ''}
                                    onChange={(e) => handleLocalUpdate({ system_prompt: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <BookOpen size={14} className="text-orange-500" />
                                    Base de Conocimiento Extra
                                </label>
                                <textarea 
                                    className="w-full bg-secondary/30 border border-border rounded-2xl p-4 text-xs font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[120px] leading-relaxed"
                                    placeholder="Políticas, teléfonos, catálogos..."
                                    value={formData?.knowledge_base || ''}
                                    onChange={(e) => handleLocalUpdate({ knowledge_base: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4 pt-4 border-t border-border/50">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Zap size={14} className="text-blue-500" />
                                    Motor de Inteligencia (IA)
                                </label>
                                <div className="grid grid-cols-1">
                                    <button
                                        disabled
                                        className="p-3 rounded-xl border text-[9px] font-black uppercase tracking-widest bg-blue-500/10 border-blue-500 text-blue-700 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={12} />
                                        Google Gemini (Activo)
                                    </button>
                                </div>
                            </div>

                            {formData?.ai_provider === 'google' && (
                                <div className="space-y-4 pt-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Key size={14} className="text-amber-500" />
                                        Google Gemini API Key
                                    </label>
                                    <input 
                                        type="password"
                                        className="w-full bg-secondary/30 border border-border rounded-2xl p-4 text-xs font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                        placeholder="AIzaSy..."
                                        value={formData?.google_api_key || ''}
                                        onChange={(e) => handleLocalUpdate({ google_api_key: e.target.value })}
                                    />
                                </div>
                            )}


                            <div className="space-y-2 pt-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Activity size={14} className="text-primary" />
                                    Modelo de IA
                                </label>
                                <input 
                                    type="text"
                                    className="w-full bg-secondary/30 border border-border rounded-2xl p-4 text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder='gemini-1.5-flash'
                                    value={formData?.ai_model || ''}
                                    onChange={(e) => handleLocalUpdate({ ai_model: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview & Actions */}
                <div className="space-y-6">
                    <div className="glass-card p-8 border-l-4 border-l-emerald-500">
                        <h4 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground mb-6">Estado del Agente</h4>
                        <div className="space-y-4">
                            <TrainingItem label="Motor" status={formData?.ai_provider?.toUpperCase() || 'GOOGLE'} />
                            <TrainingItem label="Modelo" status={formData?.ai_model || 'Standard'} />
                            <TrainingItem label="Status" status={formData?.is_active ? 'Activo' : 'Pausado'} />
                        </div>

                        <div className="mt-12 space-y-4">
                            <button 
                                onClick={handleSave}
                                disabled={saving}
                                className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 ${
                                    saving ? 'bg-secondary cursor-not-allowed text-muted-foreground' : 'bg-foreground text-background hover:bg-zinc-800'
                                }`}
                            >
                                {saving ? (
                                    <>Guardando...</>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Guardar Cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="p-8 bg-gradient-to-br from-primary/10 to-transparent rounded-[2rem] border border-primary/20 flex items-center gap-6 group hover:scale-[1.02] transition-all">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-primary/10">
                            <SparklesIcon />
                        </div>
                        <div>
                            <h5 className="font-black text-sm tracking-tight text-foreground">Asistente Inteligente</h5>
                            <p className="text-[10px] text-muted-foreground mt-1 font-medium leading-relaxed">
                                Soporte optimizado para Google Gemini 1.5 Flash.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TrainingItem({ label, status }: { label: string, status: string }) {
    return (
        <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
            <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1.5">
                <CheckCircle2 size={12} />
                {status}
            </span>
        </div>
    );
}

function SparklesIcon() {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 4L18.5 11.5H26L20 16L22.5 23.5L16 19L9.5 23.5L12 16L6 11.5H13.5L16 4Z" className="fill-primary" />
        </svg>
    );
}
