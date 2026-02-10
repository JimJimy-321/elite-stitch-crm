'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function FinanceDatePicker() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Default to today if no date in URL, but we need to handle timezone correctly in client
    // For input type="date", we need YYYY-MM-DD
    const currentDate = searchParams.get('date') || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        if (!newDate) return;

        // Update URL with new date param
        const params = new URLSearchParams(searchParams);
        params.set('date', newDate);
        router.push(`?${params.toString()}`);
    };

    // Format for display (e.g., "8 de febrero")
    const displayDate = format(new Date(currentDate + 'T00:00:00'), "d 'de' MMMM", { locale: es });

    return (
        <div className="relative flex items-center bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-3 px-4 py-2.5 pointer-events-none">
                <Calendar size={18} className="text-orange-500 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-700 capitalize text-sm whitespace-nowrap">
                    {displayDate}
                </span>
            </div>

            {/* Invisible date input covering the container for seamless interaction */}
            <input
                type="date"
                value={currentDate}
                onChange={handleDateChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
        </div>
    );
}
