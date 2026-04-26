import React from 'react';

interface ChatLayoutProps {
    sidebar: React.ReactNode;
    chatWindow: React.ReactNode;
    infoPanel?: React.ReactNode;
}

export function ChatLayout({ sidebar, chatWindow, infoPanel }: ChatLayoutProps) {
    return (
        <div className="flex h-[calc(100vh-5rem)] w-full overflow-hidden bg-white dark:bg-[#0b141a]">
            {/* Sidebar - Lista de Chats */}
            <div className="hidden md:flex w-[350px] lg:w-[380px] shrink-0 border-r border-gray-200 dark:border-gray-800 flex-col bg-white dark:bg-[#111b21] z-10 shadow-lg shadow-slate-200/50 dark:shadow-none">
                <div className="text-[10px] text-gray-300 absolute bottom-2 left-2 z-20">v2.9.2-prod</div>
                {sidebar}
            </div>

            {/* Ventana Principal - Chat */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#F9FBFF] dark:bg-[#0b141a] relative overflow-hidden">
                {/* Background Pattern de WhatsApp sutil */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                    style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}>
                </div>
                <div className="relative z-10 flex flex-col h-full overflow-hidden">
                    {chatWindow}
                </div>
            </div>

            {/* Panel de Info (Opcional/Collapsible) */}
            {infoPanel && (
                <div className="hidden xl:flex w-[320px] lg:w-[350px] shrink-0 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111b21] flex-col overflow-y-auto">
                    {infoPanel}
                </div>
            )}
        </div>
    );
}
