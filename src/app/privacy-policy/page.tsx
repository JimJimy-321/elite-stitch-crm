"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Scissors, ArrowLeft, ShieldCheck, Mail, Globe, MessageSquare, ExternalLink } from 'lucide-react';

export default function PrivacyPolicyPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-8 py-10 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Scissors size={80} />
                    </div>

                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors font-bold text-sm group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Regresar
                    </button>

                    <div className="flex items-center gap-4 mb-2">
                        <ShieldCheck size={32} />
                        <h1 className="text-3xl font-black tracking-tight">Aviso de Privacidad</h1>
                    </div>
                    <p className="text-orange-100 font-medium tracking-wide">SastrePro – CRM para Sastrerías</p>
                </div>

                {/* Content */}
                <div className="p-8 sm:p-12 space-y-10">
                    <section>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Última actualización: 24 de febrero de 2026</p>
                        <p className="text-slate-700 leading-relaxed text-lg font-medium">
                            En <span className="text-orange-600 font-black">SastrePro</span>, la privacidad y seguridad de la información son fundamentales. Este Aviso de Privacidad describe cómo recopilamos, utilizamos, almacenamos y protegemos los datos personales de los usuarios y de los clientes finales que interactúan mediante nuestra plataforma.
                        </p>
                    </section>

                    <div className="grid gap-12">
                        {/* 1. Responsable */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-orange-100 text-orange-600 text-xs font-black">1</span>
                                Responsable del Tratamiento
                            </h3>
                            <div className="pl-11 space-y-3">
                                <p className="text-slate-600 leading-relaxed">
                                    SastrePro es responsable del tratamiento de los datos personales conforme a las leyes aplicables de protección de datos.
                                </p>
                                <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                                    <Mail size={16} className="text-orange-500" />
                                    <span className="text-slate-900 font-bold text-sm">soporte@sastrepro.com</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Datos Recopilados */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-orange-100 text-orange-600 text-xs font-black">2</span>
                                Datos Personales Recopilados
                            </h3>
                            <div className="pl-11 space-y-4 text-slate-600">
                                <p>Recopilamos y tratamos los siguientes datos:</p>
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                                        <p><span className="font-bold text-slate-900">Datos de identificación:</span> nombre y correo electrónico del usuario del sistema.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                                        <p><span className="font-bold text-slate-900">Datos de contacto de clientes finales:</span> número de teléfono y nombre del cliente.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                                        <div className="space-y-2">
                                            <p><span className="font-bold text-slate-900">Información de mensajes (WhatsApp Business API - Meta):</span></p>
                                            <ul className="pl-4 space-y-1 text-sm border-l-2 border-slate-100 ml-1">
                                                <li>• Contenido de los mensajes.</li>
                                                <li>• Fecha y hora de envío y recepción.</li>
                                                <li>• Estado del mensaje (entregado, leído).</li>
                                            </ul>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                                        <p><span className="font-bold text-slate-900">Datos técnicos:</span> IP, navegador, logs de actividad.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                                        <p><span className="font-bold text-slate-900">Análisis IA:</span> clasificación de sentimiento (positivo, neutro o crítico).</p>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* 3. Finalidad */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-orange-100 text-orange-600 text-xs font-black">3</span>
                                Finalidad del Tratamiento
                            </h3>
                            <ul className="pl-11 space-y-3 text-slate-600">
                                {[
                                    "Gestión de clientes y órdenes de servicio (notas de sastrería).",
                                    "Comunicación con clientes mediante la integración oficial con WhatsApp Business API de Meta Platforms, Inc.",
                                    "Registro histórico de conversaciones para control de calidad y trazabilidad.",
                                    "Generación de métricas de atención (tiempos de respuesta, mensajes atendidos).",
                                    "Análisis automatizado mediante IA para clasificar el sentimiento de los mensajes.",
                                    "Cumplimiento de obligaciones legales."
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-3">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                                        <p>{item}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* 4. Almacenamiento */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-orange-100 text-orange-600 text-xs font-black">4</span>
                                Almacenamiento y Conservación
                            </h3>
                            <p className="text-slate-600 leading-relaxed pl-11">
                                Los datos se almacenan en infraestructura segura en la nube y se conservan únicamente durante el tiempo necesario para cumplir con las finalidades descritas, o hasta que el usuario solicite su eliminación.
                            </p>
                        </div>

                        {/* 5. Meta/WhatsApp */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-orange-100 text-orange-600 text-xs font-black">5</span>
                                Integración con Terceros (Meta / WhatsApp)
                            </h3>
                            <div className="pl-11 space-y-4">
                                <p className="text-slate-600 leading-relaxed">
                                    SastrePro utiliza la API oficial de WhatsApp Business API de Meta Platforms, Inc. para habilitar la mensajería dentro del CRM.
                                </p>
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                            <Globe size={20} className="text-orange-500" />
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            Los mensajes son transmitidos a través de los servidores de Meta y posteriormente almacenados en la base de datos de SastrePro para su consulta.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                            <MessageSquare size={20} className="text-orange-500" />
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            El número de WhatsApp y la cuenta comercial son propiedad del CLIENTE, no de SastrePro.
                                        </p>
                                    </div>
                                    <a
                                        href="https://www.whatsapp.com/legal/privacy-policy"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-xs font-black text-orange-600 uppercase tracking-widest hover:underline"
                                    >
                                        Política de Privacidad de WhatsApp
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* 6. ARCO */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-orange-100 text-orange-600 text-xs font-black">6</span>
                                Derechos ARCO y Eliminación de Datos
                            </h3>
                            <div className="pl-11 space-y-4 text-slate-600">
                                <p>El titular de los datos puede ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición, así como solicitar la eliminación total de su información enviando un correo a:</p>
                                <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                                    <Mail size={16} className="text-orange-500" />
                                    <span className="text-slate-900 font-bold text-sm">soporte@sastrepro.com</span>
                                </div>
                                <p className="text-sm italic">La solicitud será atendida dentro de los plazos legales aplicables.</p>
                            </div>
                        </div>

                        {/* 7. Seguridad */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-orange-100 text-orange-600 text-xs font-black">7</span>
                                Seguridad
                            </h3>
                            <p className="text-slate-600 leading-relaxed pl-11">
                                SastrePro implementa medidas técnicas y administrativas para proteger los datos personales contra acceso no autorizado, pérdida o alteración.
                            </p>
                        </div>

                        {/* 8. Aceptación */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-orange-100 text-orange-600 text-xs font-black">8</span>
                                Aceptación
                            </h3>
                            <p className="text-slate-600 leading-relaxed pl-11">
                                El uso de la plataforma SastrePro implica la aceptación expresa de este Aviso de Privacidad.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Policy */}
                <div className="bg-slate-50 p-8 text-center border-t border-slate-100">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
                        © 2026 SastrePro CRM. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
}
