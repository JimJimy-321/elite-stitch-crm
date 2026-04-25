"use client";

import React, { useState, useEffect } from 'react';
import { Brain, Save, Info, Power, BookOpen, MessageSquare, AlertTriangle, CheckCircle2, Key, Zap } from 'lucide-react';
import { aiAgentService, AgentConfig } from '@/features/chat/services/aiAgentService';
import { toast } from 'sonner';

interface AiAgentSettingsProps {
    organizationId: string;
}

export function AiAgentSettings({ organizationId }: AiAgentSettingsProps) {
    const [configs, setConfigs] = useState<AgentConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadConfigs();
    }, [organizationId]);

    const loadConfigs = async () => {
        try {
            setLoading(true);
            const data = await aiAgentService.getConfigs(organizationId);
            setConfigs(data);
            if (data.length > 0) setSelectedId(data[0].id);
        } catch (error) {
            console.error('Error loading AI configs:', error);
            toast.error('Error al cargar la configuración de la IA');
        } finally {
            setLoading(false);
        }
    };

    const currentConfig = configs.find(c => c.id === selectedId);

    const handleUpdate = async (updates: Partial<AgentConfig>) => {
        if (!selectedId) return;
        try {
            const updated = await aiAgentService.updateConfig(selectedId, updates);
            setConfigs(prev => prev.map(c => c.id === selectedId ? { ...c, ...updates } : c));
            toast.success('Cambios guardados localmente');
        } catch (error) {
            toast.error('Error al actualizar');
        }
    };

    const handleSave = async () => {
        if (!currentConfig) return;
        setSaving(true);
        try {
            await aiAgentService.updateConfig(currentConfig.id, currentConfig);
            toast.success('CONFIGURACI\u00D3N GUARDADA EN NUBE');
        } catch (error) {
            toast.error('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-12 text-center animate-pulse font-black uppercase text-[10px] tracking-widest text-muted-foreground">Inicializando Neuronas...</div>;

    if (configs.length === 0) {
        return (
            <div className="glass-card p-12 text-center border-dashed border-2 border-border">
                <AlertTriangle className="mx-auto text-amber-500 mb-4" size={32} />
                <h3 className="font-black uppercase text-sm tracking-tight mb-2">No se encontraron agentes configurados</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">Vincule un n\u00famero de WhatsApp en la secci\u00f3n de Sucursales para activar la IA.</p>
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
                        N\u00faMERO: {config.phone_number_id || 'SIN VINCULAR'}
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
                                <h4 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Personalidad y Brain</h4>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={currentConfig?.is_active}
                                    onChange={(e) => handleUpdate({ is_active: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                                    {currentConfig?.is_active ? 'Activo' : 'Pausado'}
                                </span>
                            </label>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <MessageSquare size={14} className="text-primary" />
                                    Instrucci\u00f3n del Sistema (Prompt)
                                </label>
                                <textarea 
                                    className="w-full bg-secondary/30 border border-border rounded-2xl p-4 text-xs font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[160px] leading-relaxed"
                                    placeholder="Ej: Eres un experto sastre llamado Juan de Elite Stitch. Tu tono es premium y servicial..."
                                    value={currentConfig?.system_prompt || ''}
                                    onChange={(e) => handleUpdate({ system_prompt: e.target.value })}
                                />
                                <p className="text-[9px] text-muted-foreground italic">Define c\u00f3mo habla y c\u00f3mo debe comportarse el agente.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <BookOpen size={14} className="text-orange-500" />
                                    Base de Conocimiento Extra
                                </label>
                                <textarea 
                                    className="w-full bg-secondary/30 border border-border rounded-2xl p-4 text-xs font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[200px] leading-relaxed"
                                    placeholder="Agregue aqu\u00ed pol\u00edticas de devoluci\u00f3n, tel\u00e9fonos de contacto, links a cat\u00e1logos PDF, o cualquier informaci\u00f3n de inter\u00e9s para el cliente."
                                    value={currentConfig?.knowledge_base || ''}
                                    onChange={(e) => handleUpdate({ knowledge_base: e.target.value })}
                                />
                                <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                    <Info size={14} className="text-blue-500 mt-1 flex-shrink-0" />
                                    <p className="text-[9px] text-blue-700 leading-tight">
                                        Pro tip: El agente usar\u00e1 esta informaci\u00f3n para responder preguntas espec\u00edficas antes de derivar a un humano.
                                    </p>
                                </div>
                            </div>

                                <div className="space-y-4 pt-4 border-t border-border/50">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <Zap size={14} className="text-blue-500" />
                                            Motor de Inteligencia (IA)
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => handleUpdate({ ai_provider: 'google' })}
                                            className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                                                currentConfig?.ai_provider === 'google'
                                                ? 'bg-blue-500/10 border-blue-500 text-blue-700'
                                                : 'bg-background border-border text-muted-foreground'
                                            }`}
                                        >
                                            Google Gemini
                                        </button>
                                        <button
                                            onClick={() => handleUpdate({ ai_provider: 'openrouter' })}
                                            className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                                                currentConfig?.ai_provider === 'openrouter'
                                                ? 'bg-purple-500/10 border-purple-500 text-purple-700'
                                                : 'bg-background border-border text-muted-foreground'
                                            }`}
                                        >
                                            OpenRouter
                                        </button>
                                    </div>
                                </div>

                                {currentConfig?.ai_provider === 'google' ? (
                                    <div className="space-y-4 pt-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                <Key size={14} className="text-amber-500" />
                                                Google Gemini API Key
                                            </label>
                                        </div>
                                        <input 
                                            type="password"
                                            className="w-full bg-secondary/30 border border-border rounded-2xl p-4 text-xs font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                            placeholder="AIzaSy..."
                                            value={currentConfig?.google_api_key || ''}
                                            onChange={(e) => handleUpdate({ google_api_key: e.target.value })}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4 pt-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                <Key size={14} className="text-purple-500" />
                                                OpenRouter API Key
                                            </label>
                                        </div>
                                        <input 
                                            type="password"
                                            className="w-full bg-secondary/30 border border-border rounded-2xl p-4 text-xs font-mono focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                            placeholder="sk-or-v1-..."
                                            value={currentConfig?.openrouter_api_key || ''}
                                            onChange={(e) => handleUpdate({ openrouter_api_key: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2 pt-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Activity size={14} className="text-primary" />
                                        Modelo de IA (ID del Modelo)
                                    </label>
                                    <input 
                                        type="text"
                                        className="w-full bg-secondary/30 border border-border rounded-2xl p-4 text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder={currentConfig?.ai_provider === 'google' ? 'gemini-2.5-flash' : 'google/gemma-2-9b-it:free'}
                                        value={currentConfig?.ai_model || ''}
                                        onChange={(e) => handleUpdate({ ai_model: e.target.value })}
                                    />
                                    <p className="text-[9px] text-muted-foreground italic">
                                        {currentConfig?.ai_provider === 'openrouter' 
                                            ? 'Puedes usar modelos gratuitos como "google/gemma-2-9b-it:free" o "mistralai/mistral-7b-instruct:free".'
                                            : 'Recomendado: "gemini-2.5-flash" para mayor velocidad.'}
                                    </p>
                                </div>
                        </div>
                    </div>
                </div>

                {/* Preview & Actions */}
                <div className="space-y-6">
                    <div className="glass-card p-8 border-l-4 border-l-emerald-500">
                        <h4 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground mb-6">Estado de Entrenamiento</h4>
                        <div className="space-y-4">
                            <TrainingItem label="Conexi\u00f3n WhatsApp" status="OK" />
                            <TrainingItem label="IA Engine" status={currentConfig?.ai_provider === 'google' ? 'Gemini 2.5' : 'OpenRouter'} />
                            <TrainingItem label="Precios Sincronizados" status="Sync" />
                            <TrainingItem label="Idempotencia (Anti-Duplicado)" status="Activa" />
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
                                    <>Sincronizando Cerebro...</>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Guardar Configuraci\u00f3n
                                    </>
                                )}
                            </button>
                            <p className="text-center text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-50">
                                \u00daltima Actualizaci\u00f3n: {new Date().toLocaleTimeString()}
                            </p>
                        </div>
                    </div>

                    <div className="p-8 bg-gradient-to-br from-primary/10 to-transparent rounded-[2rem] border border-primary/20 flex items-center gap-6 group hover:scale-[1.02] transition-all">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-primary/10">
                            <SparklesIcon />
                        </div>
                        <div>
                            <h5 className="font-black text-sm tracking-tight text-foreground">Modo Conversacional V2</h5>
                            <p className="text-[10px] text-muted-foreground mt-1 font-medium leading-relaxed">
                                El Bot ahora intenta resolver dudas usando la Base de Conocimientos antes de alertar al personal humano.
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
