"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Phone, Mail, Save, X, AlertCircle } from 'lucide-react';
import { parsePhoneNumber, isValidNumber } from 'libphonenumber-js';
import { useClients } from '../hooks/useDashboardData';
import { useAuthStore } from '@/features/auth/store/authStore';
import { cn } from '@/shared/lib/utils';
import { translateError } from '@/shared/lib/error-handler';

const clientSchema = z.object({
    full_name: z.string().min(3, "EL NOMBRE DEBE TENER AL MENOS 3 CARACTERES"),
    country_code: z.string(),
    phone: z.string().refine((val) => {
        const digits = val.replace(/\D/g, '');
        return digits.length === 10;
    }, "DEBE TENER EXACTAMENTE 10 D\u00CDGITOS"),
    email: z.string().email("ESTRUCTURA DE EMAIL NO V\u00C1LIDA").optional().or(z.literal('')),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientFormModalProps {
    onClose: () => void;
    onSuccess: (client: any) => void;
    initialData?: any;
    branchId?: string;
}

export function ClientFormModal({ onClose, onSuccess, initialData, branchId }: ClientFormModalProps) {
    const { user } = useAuthStore();
    const { createClient, updateClient } = useClients();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    let initialPhone = '';
    let initialCountryCode = '+52';

    if (initialData?.phone) {
        let phoneString = String(initialData.phone);
        if (phoneString.includes('+')) {
            // Ejemplo: "+525512345678" o "+52 5512345678"
            const parts = phoneString.split(' ');
            if (parts.length > 1) {
                initialCountryCode = parts[0];
                initialPhone = parts[1].replace(/\D/g, '');
            } else {
                // Asumimos que los últimos 10 dígitos son el teléfono
                const digitsOnly = phoneString.replace(/\D/g, '');
                if (digitsOnly.length > 10) {
                    initialPhone = digitsOnly.slice(-10);
                    // y el resto es código de país
                    initialCountryCode = phoneString.substring(0, phoneString.indexOf((initialPhone)[0]));
                    if (!initialCountryCode.startsWith('+')) initialCountryCode = '+' + initialCountryCode;
                } else {
                    initialPhone = digitsOnly;
                }
            }
        } else {
            initialPhone = phoneString.replace(/\D/g, '');
            if (initialPhone.length > 10) {
                initialPhone = initialPhone.slice(-10);
            }
        }
    }

    const { register, handleSubmit, formState: { errors } } = useForm<ClientFormValues>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            full_name: initialData?.full_name || '',
            country_code: initialCountryCode,
            phone: initialPhone,
            email: initialData?.email || ''
        }
    });

    const onSubmit = async (data: ClientFormValues) => {
        setIsSubmitting(true);
        setServerError(null);
        try {
            const clientPayload = {
                full_name: data.full_name.trim().toUpperCase(),
                phone: `${data.country_code} ${data.phone.replace(/\D/g, '')}`,
                email: data.email?.toLowerCase() || null,
                organization_id: user?.organization_id,
                last_branch_id: branchId || user?.assigned_branch_id,
            };

            const result = initialData?.id
                ? await updateClient(initialData.id, clientPayload)
                : await createClient({ ...clientPayload, preferences: { vip: false } });

            onSuccess(result);
        } catch (err: any) {
            setServerError(translateError(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {serverError && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} />
                    <p className="text-[10px] font-black uppercase tracking-tight">{serverError}</p>
                </div>
            )}

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nombre Completo</label>
                    <div className="relative group">
                        <input
                            {...register('full_name')}
                            type="text"
                            placeholder="EJ. JUAN P\u00C9REZ"
                            className={cn(
                                "w-full bg-slate-50 border-2 rounded-2xl px-10 h-14 font-bold text-slate-700 outline-none transition-all uppercase focus:bg-white",
                                errors.full_name ? "border-red-200 focus:border-red-500" : "border-slate-100 focus:border-orange-500"
                            )}
                        />
                        <User className={cn("absolute left-4 top-1/2 -translate-y-1/2", errors.full_name ? "text-red-400" : "text-slate-400")} size={18} />
                    </div>
                    {errors.full_name && <p className="text-[9px] font-black text-red-500 px-2 uppercase">{errors.full_name.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">WhatsApp / Celular (10 d\u00EDgitos)</label>
                    <div className="relative group flex gap-2">
                        <select
                            {...register('country_code')}
                            className="bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 h-14 font-bold text-slate-700 outline-none transition-all focus:bg-white focus:border-orange-500 w-32 shrink-0 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5NGExYjIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')] bg-no-repeat bg-[position:right_1rem_center] bg-[length:1.2em_1.2em]"
                        >
                            <option value="+52">🇲🇽 +52</option>
                            <option value="+1">🇺🇸/🇨🇦 +1</option>
                            <option value="+54">🇦🇷 +54</option>
                            <option value="+57">🇨🇴 +57</option>
                            <option value="+56">🇨🇱 +56</option>
                            <option value="+34">🇪🇸 +34</option>
                            <option value="+502">🇬🇹 +502</option>
                            <option value="+503">🇸🇻 +503</option>
                            <option value="+504">🇭🇳 +504</option>
                            <option value="+505">🇳🇮 +505</option>
                            <option value="+506">🇨🇷 +506</option>
                            <option value="+507">🇵🇦 +507</option>
                            <option value="+51">🇵🇪 +51</option>
                        </select>
                        <div className="relative w-full">
                            <input
                                {...register('phone')}
                                type="tel"
                                placeholder="5512345678"
                                maxLength={10}
                                className={cn(
                                    "w-full bg-slate-50 border-2 rounded-2xl px-10 h-14 font-bold text-slate-700 outline-none transition-all focus:bg-white",
                                    errors.phone ? "border-red-200 focus:border-red-500" : "border-slate-100 focus:border-orange-500"
                                )}
                            />
                            <Phone className={cn("absolute left-4 top-1/2 -translate-y-1/2", errors.phone ? "text-red-400" : "text-slate-400")} size={18} />
                        </div>
                    </div>
                    {errors.phone && <p className="text-[9px] font-black text-red-500 px-2 uppercase">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email (Opcional)</label>
                    <div className="relative group">
                        <input
                            {...register('email')}
                            type="email"
                            placeholder="CLIENTE@EJEMPLO.COM"
                            className={cn(
                                "w-full bg-slate-50 border-2 rounded-2xl px-10 h-14 font-bold text-slate-700 outline-none transition-all lowercase focus:bg-white",
                                errors.email ? "border-red-200 focus:border-red-500" : "border-slate-100 focus:border-orange-500"
                            )}
                        />
                        <Mail className={cn("absolute left-4 top-1/2 -translate-y-1/2", errors.email ? "text-red-400" : "text-slate-400")} size={18} />
                    </div>
                    {errors.email && <p className="text-[9px] font-black text-red-500 px-2 uppercase">{errors.email.message}</p>}
                </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-8 py-4 rounded-2xl border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                >
                    CANCELAR
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-500/30 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Save size={18} />
                            {initialData?.id ? 'ACTUALIZAR CLIENTE' : 'GUARDAR CLIENTE'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
