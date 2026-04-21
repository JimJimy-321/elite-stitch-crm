import { test, expect } from '@playwright/test';

test.describe('UI Standardization Audit', () => {
  
  test('Login page labels are UPPERCASE', async ({ page }) => {
    await page.goto('/login');
    
    const labels = await page.locator('label').allTextContents();
    for (const label of labels) {
      // Excluir labels vacíos o decorativos
      if (label.trim().length > 0) {
        expect(label).toBe(label.toUpperCase());
      }
    }
  });

  test('Dashboard main modules have UPPERCASE headers', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verificar que el sidebar o encabezados principales estén en mayúsculas
    // Esto es un ejemplo, se adaptará según los selectores reales
    const sidebarItems = await page.locator('nav a').allTextContents();
    for (const item of sidebarItems) {
      if (item.trim().length > 1) {
        // Permitimos variaciones si son iconos + texto, pero el texto debe ser uppercase
        const textOnly = item.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').trim();
        if (textOnly.length > 0) {
           expect(textOnly).toBe(textOnly.toUpperCase());
        }
      }
    }
  });

  test('Financial module labels and placeholders audit', async ({ page }) => {
    await page.goto('/dashboard/finance');
    
    // Verificar inputs y placeholders
    const placeholders = await page.locator('input').evaluateAll(inputs => 
      inputs.map(i => (i as HTMLInputElement).placeholder)
    );
    
    for (const p of placeholders) {
      if (p && p.trim().length > 0) {
        expect(p).toBe(p.toUpperCase());
      }
    }
  });
});
