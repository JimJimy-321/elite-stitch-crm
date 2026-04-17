"use client";

import React, { useState, useEffect } from 'react';
import { Delete, Lock, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface PinKeypadProps {
    onComplete: (pin: string) => void;
    isLoading?: boolean;
    error?: string;
    branchName?: string;
}

export const PinKeypad: React.FC<PinKeypadProps> = ({ 
    onComplete, 
    isLoading = false, 
    error,
    branchName 
}) => {
    const [pin, setPin] = useState<string>('');
    const [shake, setShake] = useState(false);

    const handleNumberClick = (num: string) => {
        if (pin.length < 6 && !isLoading) {
            setPin(prev => prev + num);
        }
    };

    const handleDelete = () => {
        if (!isLoading) {
            setPin(prev => prev.slice(0, -1));
        }
    };

    useEffect(() => {
        if (pin.length === 4 || pin.length === 6) {
            // Un pequeño delay para que el usuario vea el último círculo llenarse
            const timer = setTimeout(() => {
                onComplete(pin);
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [pin, onComplete]);

    useEffect(() => {
        if (error) {
            setShake(true);
            const timer = setTimeout(() => {
                setShake(false);
                setPin('');
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

    return (
        <div className={cn(
            "max-w-xs w-full mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500",
            shake && "animate-shake"
        )}>
            <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20 mb-4">
                    <Lock className="text-orange-600" size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Acceso Terminal</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {branchName ? `Sede: ${branchName}` : 'Ingresa tu PIN personal'}
                </p>
            </div>

            {/* PIN Indicators */}
            <div className="flex justify-center gap-4">
                {[...Array(4)].map((_, i) => (
                    <div 
                        key={i}
                        className={cn(
                            "w-4 h-4 rounded-full border-2 transition-all duration-300",
                            pin.length > i 
                                ? "bg-orange-600 border-orange-600 scale-110 shadow-[0_0_15px_rgba(234,88,12,0.4)]" 
                                : "border-slate-200 bg-transparent"
                        )}
                    />
                ))}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 animate-in slide-in-from-top-2">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-4">
                {numbers.map((key, i) => {
                    if (key === '') return <div key={i} />;
                    
                    if (key === 'delete') {
                        return (
                            <button
                                key={i}
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="h-16 flex items-center justify-center text-slate-400 hover:text-orange-600 transition-colors active:scale-90"
                            >
                                <Delete size={24} />
                            </button>
                        );
                    }

                    return (
                        <button
                            key={i}
                            onClick={() => handleNumberClick(key)}
                            disabled={isLoading}
                            className={cn(
                                "h-16 bg-white border border-slate-100 rounded-2xl text-2xl font-black text-slate-900 shadow-sm transition-all active:scale-[0.85] active:bg-orange-500 active:text-white active:border-orange-600 select-none",
                                isLoading && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {key}
                        </button>
                    );
                })}
            </div>

            {isLoading && (
                <div className="flex items-center justify-center gap-2 text-orange-600 text-[10px] font-black uppercase tracking-widest animate-pulse">
                    <Loader2 className="animate-spin" size={14} />
                    Verificando Identidad...
                </div>
            )}

            <div className="pt-4 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                    <ShieldCheck size={12} />
                    Dispositivo Protegido
                </div>
            </div>
        </div>
    );
};
