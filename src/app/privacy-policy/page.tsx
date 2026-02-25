"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Scissors, ArrowLeft, ShieldCheck } from 'lucide-react';

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
                    <p className="text-orange-100 font-medium">SastrePro - Intelligence & CRM</p>
                </div>

                {/* Content */}
                <div className="p-8 sm:p-12 space-y-10">
                    <section>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-4">Última actualización: 24 de febrero de 2026</p>
                        <p className="text-slate-700 leading-relaxed text-lg">
                            En <span className="text-orange-600 font-black">SastrePro</span>, la privacidad y seguridad de su información son nuestra prioridad fundamental. Este aviso detalla cómo recopilamos, utilizamos y protegemos sus datos personales en el marco de nuestra plataforma SaaS.
                        </p>
                    </section>

                    <div className="grid gap-10">
                        <div className="space-y-3">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 text-sm">1</span>
                                Responsable del Tratamiento
                            </h3>
                            <p className="text-slate-600 leading-relaxed pl-11">
                                SastrePro CRM es el responsable del tratamiento de los datos personales proporcionados por los usuarios, asegurando su uso conforme a las normativas de protección de datos vigentes.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 text-sm">2</span>
                                Datos Personales Recopilados
                            </h3>
                            <div className="text-slate-600 leading-relaxed pl-11">
                                Recopilamos la siguiente información para la prestación técnica del servicio:
                                <ul className="list-disc mt-4 space-y-2 ml-4 marker:text-orange-500">
                                    <li>Datos de contacto (Nombre, Correo Electrónico).</li>
                                    <li>Números de teléfono vinculados al servicio de CRM.</li>
                                    <li>Metadatos de mensajería generados a través de la integración con <span className="font-bold text-slate-900">WhatsApp Business API</span>.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 text-sm">3</span>
                                Finalidad del Tratamiento
                            </h3>
                            <p className="text-slate-600 leading-relaxed pl-11">
                                Sus datos se utilizan exclusivamente para los siguientes fines operativos:
                            </p>
                            <ul className="list-disc pl-15 mt-2 space-y-2 text-slate-600 marker:text-orange-500">
                                <li>Gestión integral de clientes y seguimiento de órdenes de servicio (Notas).</li>
                                <li>Habilitar la comunicación omnicanal a través de la integración oficial de WhatsApp.</li>
                                <li>Optimización de procesos operativos mediante herramientas de Inteligencia Artificial.</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 text-sm">4</span>
                                Derechos ARCO
                            </h3>
                            <p className="text-slate-600 leading-relaxed pl-11">
                                Como titular de los datos, usted tiene derecho al <span className="font-bold">Acceso, Rectificación, Cancelación y Oposición</span> (Derechos ARCO). Para ejercer cualquier derecho o solicitar aclaraciones, puede enviar una solicitud formal a: <span className="text-orange-600 font-bold underline">soporte@sastrepro.com</span>.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 text-sm">5</span>
                                Integración con Terceros (Meta/WhatsApp)
                            </h3>
                            <p className="text-slate-600 leading-relaxed pl-11">
                                Para la funcionalidad de mensajería, compartimos datos técnicos estrictamente necesarios con <span className="font-bold text-slate-900">Meta Platforms, Inc.</span> El uso de este servicio implica la aceptación de las políticas de privacidad propias de Meta y WhatsApp.
                            </p>
                        </div>
                    </div>

                    {/* Footer Policy */}
                    <div className="pt-10 border-t border-slate-100">
                        <div className="bg-slate-50 p-6 rounded-2xl flex items-start gap-4 border border-slate-200">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-slate-100">
                                <Scissors size={20} className="text-orange-500" />
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Este aviso es parte integrante de los Términos de Servicio de SastrePro. El uso de la plataforma constituye su aceptación de estas prácticas de manejo de información.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <p className="mt-8 text-center text-slate-400 text-xs font-medium">
                © 2026 SastrePro CRM. Todos los derechos reservados.
            </p>
        </div>
    );
}
