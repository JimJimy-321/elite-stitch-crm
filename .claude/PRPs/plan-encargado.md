# Plan de Finalización: Menú de ENCARGADO - SastrePro Elite

Este documento detalla las fases y pasos necesarios para completar la funcionalidad del rol de Encargado, transformando los componentes visuales actuales en herramientas operativas conectadas a Supabase.

## 🛠️ Fase 1: Gestión Avanzada de Clientes
**Objetivo:** Pasar de una lista estática a un CRM funcional con medidas personalizadas.
- [ ] **1.1. Formulario de Registro:** Crear componente `ClientFormModal` para altas y ediciones.
- [ ] **1.2. Módulo de Medidas:** Implementar pestaña de "Medidas" en el detalle del cliente (Cuello, Pecho, Cintura, Cadera, Largo Manga, etc.).
- [ ] **1.3. Búsqueda Real:** Refactorizar `useClients` para soportar filtrado por servidor o cliente mediante `dashboardService`.

## 💵 Fase 2: Operaciones Financieras y Caja
**Objetivo:** Control total del flujo de efectivo diario.
- [ ] **2.1. Registro de Gastos:** Crear modal para capturar egresos (`expenses`) vinculados a la sucursal del encargado.
- [ ] **2.2. Filtros de Tiempo:** Implementar selector de mes/año para reportes históricos de ingresos y egresos.
- [ ] **2.3. Sincronización de Metas:** Conectar la barra de progreso con la columna `meta_mensual` de la tabla `branches`.

## 💬 Fase 3: Centro de Mensajería (WhatsApp)
**Objetivo:** Comunicación bidireccional real.
- [ ] **3.1. Conexión Supabase:** Reemplazar `mockMessages` con datos reales de la tabla `whatsapp_interactions`.
- [ ] **3.2. Motor de Envío:** Implementar servicio para enviar mensajes vía API (mockeado inicialmente, pero funcional en UI).
- [ ] **3.3. IA Sentiment UI:** Mostrar dinámicamente el sentimiento analizado por el agente de IA para priorizar clientes críticos.

## 📦 Fase 4: Inventario y Personal (Staff)
**Objetivo:** Control de insumo y equipo de trabajo.
- [ ] **4.1. Página de Inventario:** Crear `/dashboard/inventory` para gestionar hilos, agujas y materiales por sucursal.
- [ ] **4.2. Asignación de Sastres:** Permitir que en cada "Nota", las prendas sean asignadas a un miembro específico del `staff`.

## 🤖 Fase 5: Inteligencia e Importación Legacy
**Objetivo:** Agilización de carga de datos.
- [ ] **5.1. Agente Ingestor:** Implementar la lógica de carga de Excel/PDF para migrar órdenes antiguas sin entrada manual.
- [ ] **5.2. Dashboard de Predicción:** Mostrar tendencias basadas en la AI sobre qué días habrá mayor carga de trabajo.

---

## 🛡️ Auto-Blindaje (Principios)
- **RLS:** Verificar que el `manager` solo pueda ver datos de su `branch_id` asignado en cada nueva función.
- **Validación:** Todas las entradas (precios, medidas, stock) deben pasar por esquemas de Zod.
- **Golden Path:** Mantener el stack Next.js 15 + React 19 + Supabase sin añadir dependencias externas innecesarias.

---
*Este plan queda guardado como guía para la próxima sesión de construcción.*
