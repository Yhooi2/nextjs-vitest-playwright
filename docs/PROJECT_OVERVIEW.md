# Обзор проекта: Next.js Todo App

## Краткое описание

**Next.js 15** todo-приложение с **React 19**, построенное по принципам **Clean Architecture**. Проект демонстрирует современные паттерны разработки, включая Server Actions, Repository Pattern, и полное покрытие тестами (Unit, Integration, E2E).

## Технологический стек

### Ключевые технологии (Production)

| Категория | Технология | Версия | Назначение |
|-----------|------------|--------|------------|
| **Framework** | Next.js | 15.5.0 | React фреймворк с App Router |
| **UI Library** | React | 19.1.0 | UI с новыми хуками (`useActionState`, `useOptimistic`) |
| **Database** | Drizzle ORM | 0.44.4 | Type-safe ORM |
|  | better-sqlite3 | 12.2.0 | SQLite драйвер |
| **Validation** | Zod | 4.1.12 | Runtime schema validation |
| **Styling** | Tailwind CSS | v4 | Utility-first CSS |
|  | CVA | 0.7.1 | Variant management |
| **UI Components** | Radix UI | 2.x | Headless accessible components |
|  | Lucide React | 0.541.0 | Иконки |
| **Utils** | Sonner | 2.0.7 | Toast notifications |
|  | next-themes | 0.4.6 | Theme management |
|  | date-fns | 4.1.0 | Date utilities |

### Dev Dependencies

| Категория | Технология | Версия |
|-----------|------------|--------|
| **Testing** | Vitest | 3.2.4 |
|  | Playwright | 1.55.0 |
|  | Testing Library | 16.3.0 |
| **Tooling** | TypeScript | 5.x |
|  | ESLint | 9.35.0 |
|  | Prettier | 3.6.2 |
| **Storybook** | Storybook | 9.1.6 |
| **Database** | Drizzle Kit | 0.31.5 |

## Архитектура проекта

### Слоистая архитектура (Layered Architecture)

```
┌─────────────────────────────────────────┐
│     UI Layer (React Components)         │
│  - TodoForm, TodoList, Button, etc.     │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  Application Layer (Hooks & Actions)    │
│  - useTodoCreate, useTodoDelete         │
│  - createTodoAction, deleteTodoAction   │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   Business Logic (Use Cases)            │
│  - createTodoUseCase                    │
│  - deleteTodoUseCase                    │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  Data Access (Repository Pattern)       │
│  - DrizzleTodoRepository                │
│  - TodoRepository (interface)           │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│        Database (SQLite)                │
│  - dev.db.sqlite3                       │
│  - .int.test.db.sqlite3 (tests)         │
│  - e2e.test.db.sqlite3 (e2e)            │
└─────────────────────────────────────────┘
```

### Структура проекта

```
nextjs-vitest-playwright/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   │
│   ├── components/         # React компоненты
│   │   ├── ui/            # Primitives (shadcn/ui pattern)
│   │   │   ├── Button/
│   │   │   ├── label.tsx
│   │   │   ├── separator.tsx
│   │   │   └── ...
│   │   ├── TodoForm/      # Feature components
│   │   ├── TodoList/
│   │   └── TaskInput/
│   │
│   ├── core/              # Business Logic (Clean Architecture)
│   │   └── todo/          # Feature: Todo
│   │       ├── actions/   # Server Actions
│   │       ├── usecases/  # Business Logic
│   │       ├── repositories/  # Data Access Layer
│   │       ├── schemas/   # Domain Models & Validation
│   │       └── factories/ # Factory functions
│   │
│   ├── hooks/             # Custom React hooks
│   │   ├── useTodoCreate.ts
│   │   ├── useTodoDelete.ts
│   │   └── useOptimisticTodos.ts
│   │
│   ├── db/                # Database setup
│   │   └── index.ts       # Drizzle DB singleton
│   │
│   ├── env/               # Environment configuration
│   │   └── configs.ts
│   │
│   └── utils/             # Utilities
│       └── sanitize-str.ts
│
├── docs/                  # Документация (этот документ)
│   ├── dependencies/      # Документация по зависимостям
│   │   ├── framework/
│   │   ├── database/
│   │   ├── validation/
│   │   ├── ui/
│   │   ├── testing/
│   │   ├── forms/
│   │   └── utils/
│   └── PROJECT_OVERVIEW.md  # Этот файл
│
├── tests/                 # E2E тесты (Playwright)
│   └── *.e2e.ts
│
├── drizzle/               # Database migrations
│   └── migrations/
│
├── .storybook/            # Storybook конфигурация
│
├── CLAUDE.md              # Инструкции для Claude Code
├── ANOTATION.md           # Testing заметки (автор: Luiz Otávio)
├── STORYBOOK.md           # Storybook setup guide
│
├── next.config.ts         # Next.js конфигурация
├── drizzle.config.ts      # Drizzle ORM конфигурация
├── vitest.config.ts       # Vitest конфигурация
├── playwright.config.ts   # Playwright конфигурация
├── tailwind.config.ts     # Tailwind CSS конфигурация
└── tsconfig.json          # TypeScript конфигурация
```

## Ключевые паттерны

### 1. Server Actions Pattern (Next.js 15)

Server mutations используют Next.js server actions вместо API routes:

```typescript
// src/core/todo/actions/create-todo.action.ts
'use server';
import { revalidatePath } from 'next/cache';

export async function createTodoAction(description: string) {
  const result = await createTodoUseCase(description);
  if (result.success) revalidatePath('/');
  return result;
}
```

**Преимущества:**
- Нет необходимости в API routes
- Автоматическая типизация
- `revalidatePath()` для инвалидации кеша

### 2. Repository Pattern

Вся работа с БД изолирована в repositories:

```typescript
// Contract (interface)
export interface TodoRepository {
  findAll(): Promise<Todo[]>;
  findById(id: string): Promise<Todo | undefined>;
  create(todo: Todo): Promise<TodoPresenter>;
  delete(id: string): Promise<TodoPresenter>;
}

// Implementation
export class DrizzleTodoRepository implements TodoRepository {
  // ... реализация
}

// Singleton instance
export const defaultRepository = new DrizzleTodoRepository(drizzleDb.db);
```

### 3. Use Cases Pattern

Бизнес-логика изолирована в use cases:

```typescript
// src/core/todo/usecases/create-todo.usecase.ts
export async function createTodoUseCase(description: string) {
  // 1. Validate with factory
  const validResult = makeNewValidatedTodo(description);
  if (!validResult.success) return validResult;

  // 2. Persist with repository
  return await defaultRepository.create(validResult.todo);
}
```

### 4. React 19 Form Handling

Формы используют **React 19 `useActionState`** (НЕ React Hook Form):

```typescript
const [state, formAction, isPending] = useActionState(
  async (_, formData: FormData) => {
    const raw = formData.get('description') as string;
    const parsed = formSchema.safeParse({ description: raw });

    if (!parsed.success) {
      return { success: false, issues: parsed.error.issues };
    }

    const result = await action(parsed.data.description);
    return result;
  },
  initialState
);

return <form action={formAction}>...</form>;
```

### 5. Optimistic Updates

Используется `useOptimistic` для мгновенной обратной связи:

```typescript
const [optimisticTodos, updateOptimisticTodos] = useOptimistic(
  todos,
  (state, action) => {
    if (action.type === 'add') return [...state, action.todo];
    if (action.type === 'delete') return state.filter(t => t.id !== action.id);
    return state;
  }
);

// Add optimistically
updateOptimisticTodos({ type: 'add', todo: tempTodo });
await createTodoAction(todo);
updateOptimisticTodos({ type: 'delete', id: tempId });
```

### 6. Custom Hooks Composition

Сложная логика инкапсулирована в custom hooks:

```typescript
// src/hooks/useTodoCreate.ts
export function useTodoCreate({ action, todos, onSuccess }) {
  const formRef = useRef(null);
  const inputRef = useRef(null);
  const [optimisticTodos, updateOptimisticTodos] = useOptimistic(todos);
  const [state, formAction, isPending] = useActionState(...);

  // Keyboard shortcut: ⌘K
  useEffect(() => { ... }, []);

  return {
    formRef,
    inputRef,
    formAction,
    isPending,
    issues: state.issues,
    description: state.data.description,
    optimisticTodos
  };
}
```

## Testing стратегия

### Типы тестов

| Тип | Паттерн файла | Описание | Инструменты |
|-----|---------------|----------|-------------|
| **Unit** | `*.spec.ts(x)` | Изолированные тесты с моками | Vitest + Testing Library |
| **Integration** | `*.test.ts(x)` | Интеграция между компонентами | Vitest + Testing Library |
| **E2E** | `*.e2e.ts` | Полный user flow | Playwright |

### Конфигурация окружений

```typescript
// Разные БД для разных окружений
development: 'dev.db.sqlite3'
production: 'prod.db.sqlite3'
test: '.int.test.db.sqlite3'
e2e: 'e2e.test.db.sqlite3'
```

### Scripts

```bash
# Unit tests
npm run test:unit        # Только *.spec.ts(x)
npm run test:unit:watch  # Watch mode

# Integration tests
npm run test:int         # Только *.test.ts(x)
npm run test:int:watch   # Watch mode

# E2E tests
npm run test:e2e         # Headless
npm run test:e2e:headed  # Visible browser
npm run test:e2e:debug   # Debug mode
npm run test:e2e:ui      # Playwright UI

# All tests
npm run test:all         # Unit + Integration + E2E
npm run test:cov         # With coverage
```

### Best Practices (из ANOTATION.md)

1. **Используйте селекторы, основанные на пользовательском опыте**
   - `getByRole`, `getByText`, `getByLabelText` > `getByTestId`

2. **Предпочитайте `findBy*` для асинхронного контента**
   - `await screen.findByText('Loaded')` > `waitFor + getBy`

3. **Используйте `userEvent` для имитации взаимодействий**
   - `userEvent.click(button)` > `fireEvent.click(button)`

4. **Тестируйте поведение, не реализацию**
   - `expect(screen.getByText('Count: 1'))` > `expect(setState).toHaveBeenCalled()`

## Environment Configuration

Проект использует **dotenv-cli** для управления окружениями:

```bash
# Development
npm run dev                      # Uses .env.development

# Testing
npm test                         # Uses .env.test
npm run test:e2e                 # Uses .env.e2e
npm run dev:test                 # Uses .env.e2e (for E2E server)

# Database migrations
npm run drizzle:generate         # Uses .env.development
npm run drizzle:migrate:dev      # Uses .env.development
npm run drizzle:migrate:prod     # Uses .env.production
```

## Команды разработки

### Development
```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Build production bundle
npm start            # Start production server
```

### Testing
```bash
npm test             # Run all tests (stop on first failure)
npm run test:watch   # Watch mode
npm run test:all     # Unit + Integration + E2E
npm run test:cov     # Coverage report
```

### Database
```bash
npm run drizzle:generate      # Generate migrations
npm run drizzle:migrate:dev   # Apply migrations (dev)
npm run drizzle:migrate:prod  # Apply migrations (prod)
```

### Code Quality
```bash
npm run lint         # ESLint
npm run format       # Prettier format
npm run format:check # Check formatting
```

### Storybook
```bash
npm run storybook        # Dev server (port 6006)
npm run build-storybook  # Build static
```

## Ключевые особенности проекта

### 1. Clean Architecture
- Четкое разделение слоев
- Dependency Inversion (интерфейсы)
- Testable design

### 2. Modern React Patterns
- React 19 hooks (`useActionState`, `useOptimistic`)
- Server Components по умолчанию
- Минимальные Client Components

### 3. Type Safety
- TypeScript throughout
- Zod runtime validation
- Drizzle ORM type inference

### 4. Developer Experience
- Turbopack для быстрых сборок
- Hot reload
- Comprehensive testing
- Storybook для компонентов
- Rich documentation

### 5. Accessibility
- Radix UI primitives
- ARIA roles
- Keyboard navigation (⌘K shortcuts)

### 6. Performance
- Server Components
- Optimistic updates
- Efficient caching с `revalidatePath`

## Документация зависимостей

Детальная документация по каждой зависимости доступна в `docs/dependencies/`:

### Framework
- [Next.js 15](./dependencies/framework/nextjs.md)
- [React 19](./dependencies/framework/react.md)

### Database
- [Drizzle ORM](./dependencies/database/drizzle-orm.md)
- [better-sqlite3](./dependencies/database/better-sqlite3.md)
- [Drizzle Kit](./dependencies/database/drizzle-kit.md)

### Validation
- [Zod](./dependencies/validation/zod.md)

### UI
- [Tailwind CSS v4](./dependencies/ui/tailwindcss.md)
- [Radix UI](./dependencies/ui/radix-ui.md)
- [CVA](./dependencies/ui/class-variance-authority.md)
- [Lucide React](./dependencies/ui/lucide-react.md)

### Testing
- [Vitest](./dependencies/testing/vitest.md)
- [Playwright](./dependencies/testing/playwright.md)
- [Testing Library](./dependencies/testing/testing-library.md)

### Utils
- [Sonner](./dependencies/utils/sonner.md)
- [next-themes](./dependencies/utils/next-themes.md)
- [date-fns](./dependencies/utils/date-fns.md)
- [Storybook](./dependencies/utils/storybook.md)

### Forms
- [React Hook Form](./dependencies/forms/react-hook-form.md) (не используется в основном коде)

## Полезные файлы

- `CLAUDE.md` - Инструкции для Claude Code с полным описанием архитектуры
- `ANOTATION.md` - Подробные заметки по тестированию от Luiz Otávio
- `STORYBOOK.md` - Setup guide для Storybook с Next.js 15 и Tailwind v4

## Автор проекта

Проект создан **Luiz Otávio Miranda** ([GitHub](https://github.com/luizomf)) как учебный материал по современной разработке на Next.js с акцентом на тестирование и чистую архитектуру.

## Выводы

Этот проект демонстрирует:
- ✅ Modern Next.js 15 + React 19 patterns
- ✅ Clean Architecture principles
- ✅ Comprehensive testing strategy
- ✅ Type-safe development
- ✅ Excellent developer experience
- ✅ Production-ready code organization

---

**Дата создания документации:** 2025-10-21
**Создано с помощью:** Claude Code
