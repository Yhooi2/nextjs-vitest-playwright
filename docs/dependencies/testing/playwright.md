# Playwright

## Версия в проекте
`1.55.0`

## Описание
Playwright - это фреймворк для E2E тестирования web-приложений с поддержкой всех современных браузеров.

## Конфигурация проекта

Файл `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.e2e\.ts/,
  fullyParallel: false,
  workers: 1,
  globalTeardown: './src/utils/__tests__/utils/cleanup-test-database.ts',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          headless: true,
          slowMo: 0,
        },
      },
    },
  ],
  webServer: {
    command: 'npm run dev:test',
    url: 'http://localhost:3000',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
});
```

## Scripts

```json
{
  "test:e2e": "dotenv -e .env.e2e -- playwright test",
  "test:e2e:headed": "dotenv -e .env.e2e -- playwright test --headed",
  "test:e2e:debug": "dotenv -e .env.e2e -- playwright test --debug",
  "test:e2e:ui": "dotenv -e .env.e2e -- playwright test --ui",
  "test:e2e:report": "dotenv -e .env.e2e -- playwright show-report"
}
```

## Основные API

### Page Navigation
```typescript
await page.goto('/');
await page.goBack();
await page.goForward();
await page.reload();
```

### Selectors (приоритет)
```typescript
// 1. ✅ По role (лучший выбор)
await page.getByRole('button', { name: /submit/i });
await page.getByRole('textbox', { name: /email/i });

// 2. ✅ По label
await page.getByLabel('Password');

// 3. ✅ По тексту
await page.getByText('Welcome back');

// 4. ✅ По placeholder
await page.getByPlaceholder('Enter your email');

// 5. ⚠️ CSS (использовать редко)
await page.locator('button.primary');

// 6. 🚫 Test ID (крайний случай)
await page.getByTestId('submit-button');
```

### Actions
```typescript
// Click
await page.getByRole('button', { name: 'Submit' }).click();

// Fill input
await page.getByLabel('Email').fill('user@example.com');

// Type (с задержкой между символами)
await page.getByRole('textbox').type('Hello', { delay: 100 });

// Press key
await page.keyboard.press('Enter');
await page.keyboard.press('Control+A');

// Select option
await page.selectOption('select[name="country"]', 'US');

// Check/uncheck
await page.getByRole('checkbox').check();
await page.getByRole('checkbox').uncheck();

// Upload file
await page.setInputFiles('input[type="file"]', 'path/to/file.pdf');

// Hover
await page.getByRole('button').hover();

// Drag and drop
await page.dragAndDrop('#source', '#target');
```

### Assertions
```typescript
import { expect } from '@playwright/test';

// Visibility
await expect(page.getByText('Success')).toBeVisible();
await expect(page.getByText('Error')).not.toBeVisible();
await expect(page.getByText('Hidden')).toBeHidden();

// Text content
await expect(page.getByRole('heading')).toHaveText('Welcome');
await expect(page.getByRole('heading')).toContainText('Wel');

// Attributes
await expect(page.getByRole('link')).toHaveAttribute('href', '/home');
await expect(page.getByRole('button')).toBeDisabled();
await expect(page.getByRole('button')).toBeEnabled();

// Count
await expect(page.getByRole('listitem')).toHaveCount(5);

// URL
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveTitle(/Dashboard/);

// Value
await expect(page.getByLabel('Email')).toHaveValue('user@example.com');
```

### Waiting
```typescript
// Wait for element
await page.waitForSelector('button');

// Wait for navigation
await page.waitForURL('/dashboard');

// Wait for load state
await page.waitForLoadState('networkidle');
await page.waitForLoadState('domcontentloaded');

// Wait for response
await page.waitForResponse('**/api/users');

// Wait for timeout (избегайте!)
await page.waitForTimeout(1000); // ❌ Плохая практика
```

## Пример E2E теста

```typescript
import { test, expect } from '@playwright/test';

test.describe('Todo App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('creates a new todo', async ({ page }) => {
    // Find input and type
    const input = page.getByPlaceholder('Add new task...');
    await input.fill('Buy milk');

    // Submit form
    await page.keyboard.press('Enter');

    // Verify todo appears
    await expect(page.getByText('Buy milk')).toBeVisible();
  });

  test('deletes a todo', async ({ page }) => {
    // Create todo first
    await page.getByPlaceholder('Add new task...').fill('Delete me');
    await page.keyboard.press('Enter');

    // Delete it
    await page.getByRole('button', { name: /delete/i }).click();

    // Verify it's gone
    await expect(page.getByText('Delete me')).not.toBeVisible();
  });
});
```

## Fixtures

### Custom Fixtures
```typescript
import { test as base } from '@playwright/test';

type MyFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<MyFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Setup: login
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('/dashboard');

    // Use the page
    await use(page);

    // Teardown: logout
    await page.getByRole('button', { name: 'Logout' }).click();
  },
});

// Usage
test('shows user dashboard', async ({ authenticatedPage }) => {
  await expect(authenticatedPage.getByText('Welcome')).toBeVisible();
});
```

## Best Practices

### 1. Используйте доступные селекторы
```typescript
// ✅ Good
await page.getByRole('button', { name: /submit/i });

// ❌ Bad
await page.locator('div > button.btn-primary');
```

### 2. Избегайте waitForTimeout
```typescript
// ❌ Bad
await page.waitForTimeout(2000);

// ✅ Good
await expect(page.getByText('Data loaded')).toBeVisible();
```

### 3. Тестируйте поведение пользователя
```typescript
test('user can complete checkout', async ({ page }) => {
  await page.goto('/products');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('link', { name: 'Cart' }).click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.getByLabel('Card number').fill('4242424242424242');
  await page.getByRole('button', { name: 'Complete purchase' }).click();
  await expect(page.getByText('Order confirmed')).toBeVisible();
});
```

### 4. Изолируйте тесты
```typescript
test.beforeEach(async ({ page }) => {
  // Чистое состояние для каждого теста
  await page.goto('/');
});
```

## Debugging

```bash
# Headed mode
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# UI mode
npm run test:e2e:ui
```

## Полезные ссылки

- [Playwright Documentation](https://playwright.dev)
- [Locators](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)
- [Best Practices](https://playwright.dev/docs/best-practices)
