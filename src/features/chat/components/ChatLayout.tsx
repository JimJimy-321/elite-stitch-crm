import React from 'react';

interface ChatLayoutProps {
    sidebar: React.ReactNode;
    chatWindow: React.ReactNode;
    infoPanel?: React.ReactNode;
}

export function ChatLayout({ sidebar, chatWindow, infoPanel }: ChatLayoutProps) {
    return (
        <div className="flex h-[calc(100vh-5rem)] w-full overflow-hidden bg-white">
            {/* Sidebar - Lista de Chats */}
            <div className="w-full md:w-[380px] border-r border-gray-200 flex flex-col bg-white z-10 shadow-lg shadow-slate-200/50">
                <div className="text-[10px] text-gray-300 absolute bottom-2 left-2 z-20">v2.9.1-diag</div>
                {sidebar}
            </div>

            {/* Ventana Principal - Chat */}
            <div className="hidden md:flex flex-1 flex-col bg-[#F9FBFF] relative">
                {/* Background Pattern de WhatsApp sutil */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}>
                </div>
                <div className="relative z-10 flex flex-col h-full">
                    {chatWindow}
                </div>
            </div>

            {/* Panel de Info (Opcional/Collapsible) */}
            {infoPanel && (
                <div className="hidden xl:flex w-[350px] border-l border-gray-200 bg-white flex-col overflow-y-auto">
                    {infoPanel}
                </div>
            )}
        </div>
    );
}
