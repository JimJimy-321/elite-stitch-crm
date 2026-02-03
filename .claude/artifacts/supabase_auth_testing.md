# 🔐 Supabase Auth - Guía de Testing

## ✅ Implementación Completada

Se ha implementado **autenticación real con Supabase** eliminando el sistema simulado anterior.

---

## 🏗️ Cambios Implementados

### **1. Hook de Autenticación** (`useSupabaseAuth.ts`)
```typescript
// src/features/auth/hooks/useSupabaseAuth.ts
✅ signInWithEmail() - Login con email/password
✅ signOut() - Logout y limpieza de sesión
✅ Sincronización automática con profiles table
✅ Mapeo de roles: super_admin → superadmin
✅ Listener de cambios de sesión (onAuthStateChange)
```

### **2. Login Page Actualizada**
```tsx
// src/app/login/page.tsx
✅ Formulario funcional con Supabase Auth
✅ Validación de errores en UI
✅ Estados de carga (loading spinner)
✅ Mensajes de error amigables
❌ ELIMINADO: Botones de login simulado
```

### **3. Middleware de Protección**
```typescript
// src/middleware.ts
✅ Validación de token en cookies
✅ Redirección automática a /login sin auth
✅ Redirección a /dashboard si ya tiene sesión
✅ Rutas públicas: ['/login', '/']
```

### **4. Layouts Sincronizados**
```tsx
// src/app/(main)/layout.tsx
// src/app/(admin)/layout.tsx
✅ useSupabaseAuth() inicializado
✅ Sincronización automática al montar
✅ Protección de rutas mantenida
```

---

## 🧪 Cómo Probar (Testing Manual)

### **Paso 1: Crear Usuario de Prueba en Supabase**

```bash
# Opción A: Desde Supabase Dashboard
1. Ir a: https://supabase.com/dashboard/project/rbhvjqcyczgaanwphhjr
2. Authentication > Users > Add User
3. Email: test-owner@sastrepro.com
4. Password: SastrePro2026!
5. Confirm Email: ✅

# Opción B: Desde SQL (recomendado)
```

```sql
-- Ejecutar en Supabase SQL Editor
INSERT INTO auth.users (
  instance_id,
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '550e8400-e29b-41d4-a716-446655440000',
  'test-owner@sastrepro.com',
  crypt('SastrePro2026!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
);

-- Crear perfil asociado
INSERT INTO public.profiles (id, role, organization_id, full_name)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'owner',
  'c06e349c-e718-4079-ac4d-c693af2ae14c', -- Sastrería Elite
  'Test Owner'
);
```

### **Paso 2: Probar Login en Producción**

```bash
# 1. Abrir en navegador
start https://elite-stitch-crm.vercel.app/login

# 2. Ingresar credenciales
Email: test-owner@sastrepro.com
Password: SastrePro2026!

# 3. Verificar redirección a /dashboard
```

### **Paso 3: Validar Flujo Completo**

1. ✅ **Login Exitoso**
   - Ingresa a `/login`
   - Completa credenciales correctas
   - Verifica redirección a `/dashboard`
   - Confirma que nombre aparece en sidebar

2. ✅ **Protección de Rutas**
   - Cierra sesión (logout)
   - Intenta acceder a `/dashboard` directamente
   - Debe redirigir a `/login`

3. ✅ **Persistencia de Sesión**
   - Haz login
   - Cierra el navegador
   - Abre nuevamente `/dashboard`
   - Sesión debe persistir (no pide login)

4. ✅ **Errores de Autenticación**
   - Intenta login con password incorrecta
   - Debe mostrar mensaje de error en UI
   - Verifica que no redirige

---

## 🔑 Credenciales de Testing

| Email | Password | Rol | Organización |
|-------|----------|-----|--------------|
| `test-owner@sastrepro.com` | `SastrePro2026!` | owner | Sastrería Elite |
| `sastreprueba@gmail.com` | (crear password) | super_admin | Sastrería Elite |

**Nota**: Si `sastreprueba@gmail.com` no tiene password en Supabase Auth, crearlo con:

```sql
-- Resetear password de usuario existente
UPDATE auth.users
SET encrypted_password = crypt('SastrePro2026!', gen_salt('bf'))
WHERE email = 'sastreprueba@gmail.com';
```

---

## 🐛 Troubleshooting

### **Error: "Invalid login credentials"**
```bash
# Verificar que usuario está en auth.users
SELECT email, email_confirmed_at FROM auth.users WHERE email = 'test-owner@sastrepro.com';

# Si email_confirmed_at es NULL
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'test-owner@sastrepro.com';
```

### **Error: "User not found in profiles"**
```bash
# Verificar profile existe
SELECT * FROM profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'test-owner@sastrepro.com');

# Si no existe, crear profile
INSERT INTO profiles (id, role, organization_id, full_name)
SELECT id, 'owner', 'c06e349c-e718-4079-ac4d-c693af2ae14c', 'Test Owner'
FROM auth.users WHERE email = 'test-owner@sastrepro.com';
```

### **Error: "Redirect loop"**
```bash
# Limpiar cookies del navegador
DevTools > Application > Cookies > Delete All

# Cerrar sesión programáticamente
const { signOut } = useSupabaseAuth();
await signOut();
```

---

## ✅ Build Status

```bash
✓ Compiled successfully in 32.5s
✓ 20 rutas estáticas generadas
✓ Middleware (Proxy) configurado
✓ Exit code: 0
```

---

## 📊 Endpoints de Supabase

| Tipo | URL |
|------|-----|
| **Project URL** | `https://rbhvjqcyczgaanwphhjr.supabase.co` |
| **Anon Key** | (Ver `.env.local`) |
| **Auth API** | `https://rbhvjqcyczgaanwphhjr.supabase.co/auth/v1` |

---

## 🚀 Próximos Pasos

1. **Crear usuarios de prueba** para cada rol (owner, manager, super_admin)
2. **Validar flujo de logout** (botón en sidebar)
3. **Implementar "Olvidaste tu contraseña"** (Supabase Password Reset)
4. **Agregar rate limiting** en login (protección contra fuerza bruta)

---

**✨ El login simulado ha sido reemplazado. Ahora el sistema usa autenticación real con Supabase.**
