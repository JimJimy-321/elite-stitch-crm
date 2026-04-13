'use client';

import ChatAnalytics from '@/features/chat/components/ChatAnalytics';

export default function AnalyticsPage() {
    return (
        <div className="p-6 md:p-8 space-y-6 bg-gray-50 dark:bg-[#121212] min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Analíticas de Conversación</h1>
                    <p className="text-muted-foreground text-gray-500">Métricas de rendimiento y satisfacción del cliente (IA).</p>
                </div>
            </div>

            <ChatAnalytics />
        </div>
    );
}
