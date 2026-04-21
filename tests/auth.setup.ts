import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate as owner', async ({ page }) => {
  await page.goto('/login');
  
  // Nivel 2: Dueño
  await page.fill('input[type="email"]', 'duenoluis@gmail.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');

  // Esperar a llegar al dashboard
  await page.waitForURL('**/dashboard');
  
  // Guardar el estado de la sesión
  await page.context().storageState({ path: authFile });
});
