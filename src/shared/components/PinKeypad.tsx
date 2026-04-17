"use client";

import React, { useState, useEffect } from 'react';
import { Delete, X, Check, Lock, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface PinKeypadProps {
    onComplete: (pin: string) => void;
    error?: string | null;
    loading?: boolean;
    title?: string;
}

export function PinKeypad({ onComplete, error, loading, title = "Ingresa tu PIN" }: PinKeypadProps) {
    const [pin, setPin] = useState<string[]>([]);
    const [shake, setShake] = useState(false);

    useEffect(() => {
        if (pin.length === 4) {
            onComplete(pin.join(''));
        }
    }, [pin, onComplete]);

    useEffect(() => {
        if (error) {
            setShake(true);
            const timer = setTimeout(() => {
                setShake(false);
                setPin([]);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleNumberClick = (num: string) => {
        if (pin.length < 4) {
            setPin([...pin, num]);
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };

    const handleClear = () => {
        setPin([]);
    };

    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-8 bg-white/80 backdrop-blur-3xl rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-white/50 w-full max-w-sm transition-all duration-500",
            shake && "animate-shake"
        )}>
            <div className="mb-10 text-center space-y-4">
                <div className="w-20 h-20 bg-orange-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-orange-500/30 text-white animate-bounce-subtle">
                    <Lock size={32} />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-slate-900 italic tracking-tight">{title}</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Acceso seguro a terminal</p>
                </div>
            </div>

            {/* DOT INDICATORS */}
            <div className="flex gap-6 mb-12">
                {[0, 1, 2, 3].map((i) => (
                    <div 
                        key={i}
                        className={cn(
                            "w-5 h-5 rounded-full border-2 transition-all duration-300",
                            pin[i] 
                                ? "bg-orange-500 border-orange-500 scale-125 shadow-[0_0_20px_rgba(249,115,22,0.4)]" 
                                : "bg-transparent border-slate-200"
                        )}
                    />
                ))}
            </div>

            {/* KEYPAD GRID */}
            <div className="grid grid-cols-3 gap-6 w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleNumberClick(num.toString())}
                        disabled={loading}
                        className="h-20 w-full rounded-2xl bg-white border border-slate-100 text-2xl font-black text-slate-800 hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-sm hover:shadow-xl hover:-translate-y-1 disabled:opacity-50"
                    >
                        {num}
                    </button>
                ))}
                <button
                    onClick={handleClear}
                    disabled={loading}
                    className="h-20 w-full rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-95 shadow-sm"
                >
                    <X size={24} />
                </button>
                <button
                    onClick={() => handleNumberClick('0')}
                    disabled={loading}
                    className="h-20 w-full rounded-2xl bg-white border border-slate-100 text-2xl font-black text-slate-800 hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-sm hover:shadow-xl hover:-translate-y-1 disabled:opacity-50"
                >
                    0
                </button>
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="h-20 w-full rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95 shadow-sm"
                >
                    <Delete size={24} />
                </button>
            </div>

            {loading && (
                <div className="mt-8 flex items-center gap-3 text-orange-600 font-black uppercase text-[10px] tracking-widest animate-pulse">
                    <Loader2 className="animate-spin" size={16} /> Verificando Identidad...
                </div>
            )}

            {error && (
                <div className="mt-8 text-rose-500 font-bold text-[10px] uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
                .animate-shake {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
