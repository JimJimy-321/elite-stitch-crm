# PRP: Módulo de Control Financiero (CAJAS)

> **Estado:** Propuesta Inicial
> **Fecha:** 07 de Febrero, 2026
> **Autor:** Antigravity AI

---

## 1. Contexto y Objetivos

El objetivo es digitalizar el proceso de "Corte de Caja Diario" que actualmente se realiza de forma física (referencia Imagen 1), manteniendo la simplicidad operativa para el encargado pero añadiendo capas de seguridad y auditoría para el dueño.

### Objetivos Clave
- **Encargado:** Registrar flujo de efectivo sin fricción y cerrar el turno con certeza.
- **Dueño:** Auditar cortes pasados, modificar con traza de auditoría y visualizar métricas reales.

---

## 2. Arquitectura Funcional

### Modelo de Datos (Supabase)
Aprovecharemos las tablas existentes e introduciremos lógica de agregación.

| Concepto | Tabla Fuente | Filtro Clave | Notas |
|----------|--------------|--------------|-------|
| **Ingresos** | `ticket_payments` | `payment_date = TODAY` y `payment_method = 'efectivo'` | Incluye anticipos, abonos y liquidaciones. |
| **Venta Neta** | `tickets` | `created_at = TODAY` | Valor total de contratos cerrados hoy (independiente de si se pagó o no). |
| **Egresos** | `expenses` | `created_at = TODAY` | Gastos operativos, devoluciones, retiros. |
| **Cierres** | `daily_reconciliations` | `date = TODAY` | Almacena la "foto" final del día. |

### Lógica de Cálculo (Server-Side)
Para garantizar integridad, los cálculos se realizarán en el servidor (Next.js Server Actions) o vistas de base de datos, nunca confiando solo en el cliente.

**Fórmula de Caja:**
```
Saldo Inicial (Fondo Fijo)
+ Total Ingresos (Efectivo) en `ticket_payments`
- Total Egresos (Efectivo) en `expenses`
= EFECTIVO TEÓRICO EN CAJA
```

**Validación de Cierre:**
```
Diferencia = Efectivo Teórico - Efectivo Real (Contado por Usuario)
```
*Si Diferencia ≠ 0, se permite cerrar pero se marca flag `audit_required`.*

---

## 3. Flujos de Usuario

### Flujo A: Operación Diaria (Encargado)
1.  **Dashboard Cajas:** Ve un resumen en tiempo real ("Corte Parcial").
2.  **Registro de Movimientos:**
    - Cobrar nota (automático desde módulo Notas).
    - Registrar Gasto (Botón rápido "Nuevo Gasto" -> Concepto/Monto/Categoría).
3.  **Cierre de Día (The One Button):**
    - Clic en "Realizar Corte".
    - Sistema muestra: "Ingresos Totales: $X", "Gastos: $Y".
    - Sistema pide: "**¿Cuánto efectivo tienes en mano?**" (Input Ciego opcional o Confirmación).
    - Sistema guarda en `daily_reconciliations`.
    - Genera PDF resumen (ticket).
    - **Bloqueo:** Ya no se pueden editar movimientos de ese día.

### Flujo B: Auditoría y Ajuste (Dueño)
1.  **Historial de Cierres:** Lista de días anteriores con semáforos (Verde = Cuadra, Rojo = Falta/Sobra).
2.  **Edición Post-Cierre:**
    - El dueño puede "Reabrir Caja" o "Insertar Ajuste".
    - Cualquier cambio genera un log en `audit_logs` (tabla nueva propuesta o campo JSON en `daily_reconciliations`).

---

## 4. Diseño Conceptual (Interfaz)

### Pantalla Principal: "Movimientos del Día [DD/MMM/AAAA]"

**Sección Superior: Tarjetas de Resumen (KPIs)**
- **Venta Neta:** Total contratos hoy (Informativo).
- **Ingreso Real:** Efectivo total recibido hoy.
- **Gastos:** Total salidas.
- **En Caja (Teórico):** Resultado de la operación.

**Cuerpo Principal: Listas de Detalle**
Dos columnas o pestañas para "Entradas" y "Salidas".
*Referencia Visual: Tabla limpia, filas compactas.*

| Hora | Concepto | Nota # | Método | Monto | Usuario |
|------|----------|--------|--------|-------|---------|
| 10:00| Anticipo | #1234  | Efectivo| +$200 | Juan    |
| 12:30| Gasto Luz| -      | Efectivo| -$150 | Juan    |

**Footer Fijo: Acción Principal**
- Botón: **"CERRAR CAJA"** (Solo habilitado si no hay cierre hoy).
- Estado: "Caja Cerrada a las 20:00 por Juan" (Si ya existe cierre).

---

## 5. Riesgos y Estrategias

| Riesgo | Impacto | Estrategia de Mitigación |
|--------|---------|--------------------------|
| **Edición maliciosa** | Robo hormiga | Los movimientos de caja ligados a tickets son inmutables para el encargado. Solo el dueño puede anular pagos. |
| **Error humano al contar** | Discrepancias falsas | El sistema muestra el "Teórico" como guía (configurable: mostrar u ocultar para corte ciego). |
| **Cierres olvidados** | Datos incongruentes | Alerta al día siguiente: "No se cerró caja ayer". Forzar cierre pendiente antes de operar hoy. |

## 6. Simplificación Máxima (MVP)
Para la primera versión:
1.  No manejar "Denominaciones" (billetes/monedas), solo monto total.
2.  No manejar "Fondo Fijo" variable (asumir 0 o fijo config).
3.  Reporte PDF simple (HTML print).
4.  Meta Mensual: Barra visual simple basada en `SUM(venta_neta_mes)`.

---

### ¿Aprobado para Iniciar Desarrollo?
Al recibir el GO, procederé a:
1.  Crear las server actions para agrupar datos de `tickets` y `expenses`.
2.  Construir la vista principal en `src/features/dashboard/pages/CashControlPage.tsx`.
3.  Implementar la lógica de cierre en `daily_reconciliations`.
