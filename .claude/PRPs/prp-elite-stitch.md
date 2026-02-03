# PRP: CRM Sastrería Multisede "Elite Stitch"

## 🎯 Visión General
Transformar la operación artesanal de 4 sucursales de sastrería en una entidad digitalmente optimizada. El sistema centraliza la gestión, automatiza la ingesta de datos históricos y proporciona una capa de inteligencia artificial para la atención al cliente.

## 🏗️ Arquitectura de Datos (Supabase)
### Tablas Principales
- `branches`: ID, nombre, ubicación, meta_mensual.
- `tickets`: ID, branch_id, client_id, status (received, processing, ready, delivered), total_amount, balance_due, delivery_date.
- `inventory_items`: ID, branch_id, name, stock.
- `cash_movements`: ID, branch_id, type (in, out, expense), category, amount, description.
- `clients`: ID, name, email, phone (WhatsApp ID), preferences.
- `staff`: ID, branch_id, name, role (manager, tailor), specialty.
- `whatsapp_interactions`: ID, client_id, message, sentiment (positive, neutral, negative), resolved_status.

### RLS (Row Level Security)
- **Dueño (`owner`)**: Acceso total a `SELECT`, `INSERT`, `UPDATE` en todas las tablas.
- **Encargado (`manager`)**: Acceso restringido a filas donde `branch_id` coincida con su perfil.

## 🤖 Agentes IA
1. **Ingestor Legacy**: 
   - Flujo: Upload (PDF/Excel) -> Processing (Next.js route) -> Model (GPT-4o Vision/Text) -> JSON structured data -> DB Insert.
   - Objetivo: Migrar órdenes de sistemas standalone sin entrada manual.
2. **Analista WhatsApp**:
   - Pipeline: Incoming Hook -> Save Message -> Sentiment Analysis -> Dashboard Notification.

## 🎨 UI/UX (Vibe Coding)
- **Design System**: Estilo "Premium Dark" con acentos en púrpura (`#8B5CF6`) y grises profundos.
- **Tipografía**: Inter.
- **Components**: Sidebar colapsable, Branch Context Switcher, High-density Tables.

## 📋 Plan de Implementación (One Shot Plan)
1. **Infraestructura**: Migraciones SQL en Supabase y Auth setup.
2. **Core Layout**: Sidebar inteligente con detección de roles y selector de sucursal.
3. **Feature: Operaciones**: Formularios de Tickets y Registro de Caja.
4. **Feature: Inteligencia**: Ruta de API para procesamiento de reportes y hooks de WhatsApp (simulados/mockeables).
5. **Feature: Dashboards**: Recharts para KPIs de ingresos y radar de sentimientos.

## ✅ Criterios de Éxito
- Carga exitosa de un reporte legacy simulado.
- Navegación segmentada: Gerente de Sede A no ve Sede B.
- Dashboard consolidado con indicadores de las 4 sedes en tiempo real.

---
**¿Damos el GO a la Fase de Implementación?**
