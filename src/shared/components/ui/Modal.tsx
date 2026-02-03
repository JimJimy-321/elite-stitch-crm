"use client";

import React, { useEffect } from 'react';
import { cn } from '@/shared/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div 
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className="relative w-full max-w-lg glass-card bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-secondary rounded-xl text-muted transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
