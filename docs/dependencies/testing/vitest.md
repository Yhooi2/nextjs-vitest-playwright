# Vitest

## Версия в проекте
`3.2.4`

## Описание
Vitest - это современный test runner для Vite-based проектов с API, совместимым с Jest.

## Конфигурация проекта

Файл `vitest.config.ts`:

```typescript
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',        // DOM simulation
    globals: true,               // describe, it, expect без импорта
    fileParallelism: false,      // Из-за SQLite
    setupFiles: ['vitest.setup.ts'],
    globalSetup: ['vitest.global.setup.ts'],
    include: ['src/**/*.{spec,test}.{ts,tsx}'],
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/__tests__/**',
        '**/*.stories.{ts,tsx}',
        // ... см. полный список в файле
      ],
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
```

## Типы тестов в проекте

### Unit Tests (`.spec.ts(x)`)
Изолированные тесты с моками зависимостей:

```typescript
// src/utils/sanitize-str.spec.ts
import { sanitizeStr } from './sanitize-str';

describe('sanitizeStr', () => {
  it('removes HTML tags', () => {
    expect(sanitizeStr('<script>alert("xss")</script>')).toBe('');
  });

  it('normalizes whitespace', () => {
    expect(sanitizeStr('hello    world')).toBe('hello world');
  });
});
```

### Integration Tests (`.test.ts(x)`)
Тесты интеграции между компонентами:

```typescript
// src/components/TodoForm/TodoForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoForm } from './index';

it('submits form with valid data', async () => {
  const mockAction = vi.fn();
  render(<TodoForm action={mockAction} todos={[]} />);

  const input = screen.getByLabelText('New Task');
  await userEvent.type(input, 'Buy milk');

  const form = input.closest('form');
  await userEvent.click(screen.getByRole('button'));

  await waitFor(() => {
    expect(mockAction).toHaveBeenCalledWith('Buy milk');
  });
});
```

## Scripts

```json
{
  "test": "dotenv -e .env.test -- vitest run --bail 1",
  "test:watch": "dotenv -e .env.test -- vitest --bail 1",
  "test:unit": "dotenv -e .env.test -- vitest run --exclude 'src/**/*.{test,e2e}.{ts,tsx}' --fileParallelism",
  "test:unit:watch": "dotenv -e .env.test -- vitest --exclude 'src/**/*.{test,e2e}.{ts,tsx}' --fileParallelism",
  "test:int": "dotenv -e .env.test -- vitest run --exclude 'src/**/*.{spec,e2e}.{ts,tsx}' --no-file-parallelism",
  "test:int:watch": "dotenv -e .env.test -- vitest --exclude 'src/**/*.{spec,e2e}.{ts,tsx}' --no-file-parallelism",
  "test:cov": "dotenv -e .env.test -- vitest run --coverage --no-file-parallelism"
}
```

## Setup Files

### vitest.setup.ts
Выполняется перед каждым тестовым файлом:

```typescript
import { afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { clearDrizzleTodoTable } from '@/core/todo/__tests__/utils/clear-drizzle-todo-table';

expect.extend(matchers);

afterEach(async () => {
  cleanup();
  vi.resetAllMocks();
  await clearDrizzleTodoTable();
});
```

### vitest.global.setup.ts
Выполняется один раз до/после всех тестов:

```typescript
import cleanupTestDatabase from '@/utils/__tests__/utils/cleanup-test-database';

export async function setup() {
  await cleanupTestDatabase();
}

export async function teardown() {
  await cleanupTestDatabase();
}
```

## Mocking

### vi.mock()
Мокирование целых модулей:

```typescript
vi.mock('@/core/todo/repositories/default.repository', () => ({
  defaultRepository: {
    create: vi.fn(),
    findAll: vi.fn(),
    delete: vi.fn(),
  },
}));
```

### vi.spyOn()
Частичное мокирование:

```typescript
const spy = vi.spyOn(console, 'log');
someFunction();
expect(spy).toHaveBeenCalledWith('message');
spy.mockRestore();
```

### vi.stubGlobal()
Мокирование глобальных переменных:

```typescript
vi.stubGlobal('fetch', vi.fn());
```

## Assertions

```typescript
// Equality
expect(value).toBe(42);
expect(object).toEqual({ key: 'value' });

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3);
expect(value).toBeLessThan(5);
expect(value).toCloseTo(0.3, 5);

// Strings
expect(string).toMatch(/pattern/);
expect(string).toContain('substring');

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Objects
expect(object).toHaveProperty('key');
expect(object).toHaveProperty('key', 'value');

// Functions
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledTimes(2);
expect(fn).toHaveBeenCalledWith(arg1, arg2);
expect(fn).toHaveReturnedWith(value);

// Async
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();
```

## Best Practices

### 1. Используйте describe/it
```typescript
describe('TodoForm', () => {
  it('renders input field', () => {
    render(<TodoForm />);
    expect(screen.getByLabelText('New Task')).toBeInTheDocument();
  });

  it('submits on Enter key', async () => {
    // ...
  });
});
```

### 2. Cleanup между тестами
```typescript
afterEach(() => {
  cleanup();           // DOM cleanup
  vi.resetAllMocks();  // Mocks cleanup
});
```

### 3. Изолируйте тесты
Каждый тест должен быть независимым и не влиять на другие.

### 4. Используйте TypeScript
```typescript
const mockFn = vi.fn<[string], Promise<Result>>();
```

## Полезные ссылки

- [Vitest Documentation](https://vitest.dev)
- [API Reference](https://vitest.dev/api/)
- [Mocking](https://vitest.dev/guide/mocking)
