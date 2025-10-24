# 🏗️ План Рефакторинга Todo App: Clean Architecture + React 19 + Next.js 15

> **Цель:** Показать продвинутые навыки в портфолио через правильную архитектуру и современные паттерны

---

## 📋 Содержание

1. [Ключевые Решения](#ключевые-решения)
2. [Теоретические Основы](#теоретические-основы)
3. [Пошаговая Реализация](#пошаговая-реализация)
4. [Итоговая Структура](#итоговая-структура)
5. [Чеклист для Проверки](#чеклист-для-проверки)

---

## 🎯 Ключевые Решения

### ✅ ЧТО ДЕЛАЕМ:

1. **Soft Delete в БД** (`deletedAt` field)
   - Показывает продвинутые навыки работы с БД
   - Production-ready паттерн (Gmail, Slack, Trello)
   - Возможность добавить "Trash" view

2. **useEffectEvent для event handlers**
   - Experimental API React 19
   - Решает stale closures элегантно
   - Стабильные функции (пустой deps array)

3. **Server/Client Split**
   - Server Component для data fetching
   - Client Component для interactivity
   - Правильная граница ответственности

4. **3-Layer Hook Composition**
   - Layer 1: Presentation (UI-specific)
   - Layer 2: Operations (business logic)
   - Layer 3: State (pure state management)

5. **Единый Optimistic State**
   - Один `useOptimistic` в TodoContainer
   - Передается вниз через props
   - Решает race conditions

### ❌ ЧТО НЕ ДЕЛАЕМ:

1. **PPR (Partial Prerendering)**
   - Доступен только в canary
   - Нестабильный API
   - Отложим до stable релиза

2. **Отдельный restore action без soft delete**
   - Soft delete лучше для портфолио
   - Показывает больше навыков

---

## 📚 Теоретические Основы

### 1️⃣ Soft Delete Pattern

#### Проблема которую решаем:

**Текущий код** ([useTodoDelete.ts:33-46](../src/hooks/useTodoDelete.ts)):

```typescript
function cancelDeletion(todoId: string) {
  pending.restorable = false;
  updateOptimisticTodos({ type: 'add', todo: pending.todo }); // ← UI восстановлен
  // НО если action УЖЕ успешно удалил на сервере → нужно создавать заново!
}
```

**Timeline проблемы:**

```
0ms   → User кликает Delete
0ms   → UI: todo удален optimistically
0ms   → Server: deleteTodoAction(id) отправлен
500ms → Server: todo успешно удален из БД ✅
2000ms → User кликает Undo
2000ms → UI: todo восстановлен ✅
       → НО на сервере его НЕТ! ❌
Refresh → todo исчезает
```

#### Решение: Soft Delete

**Вместо:**

```sql
DELETE FROM todos WHERE id = ?;
```

**Делаем:**

```sql
UPDATE todos SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?;
```

**Преимущества:**

| Критерий              | Hard Delete    | Soft Delete              |
| --------------------- | -------------- | ------------------------ |
| ID сохраняется        | ❌             | ✅                       |
| createdAt сохраняется | ❌             | ✅                       |
| Audit trail           | ❌             | ✅                       |
| "Trash" view          | ❌             | ✅                       |
| Восстановление        | Создать заново | UPDATE deleted_at = NULL |
| Для портфолио         | ⭐ Good        | ⭐⭐⭐ Excellent         |

**Production примеры:**

- Gmail: Trash 30 дней → auto-delete
- Slack: "[deleted]" messages
- Trello: Archive → restore
- GitHub: Deleted repos → 90 days restore

---

### 2️⃣ useEffectEvent - Event Handlers

#### Проблема: Stale Closures

**БЕЗ useEffectEvent:**

```typescript
function useTodoDelete({ onDeleteSuccess }) {
  // ❌ Проблема: onDeleteSuccess может быть stale
  const handleDelete = useCallback(async (todo) => {
    await action(todo.id);
    onDeleteSuccess?.(todo); // ← Старый callback если изменился!
  }, [action, onDeleteSuccess]); // ← Пересоздается при изменении deps

  return { handleDelete };
}

// Использование:
<Button onClick={() => handleDelete(todo)} />
// Каждый раз новая функция → re-render детей!
```

**С useEffectEvent:**

```typescript
function useTodoDelete({ onDeleteSuccess }) {
  // ✅ Event handler - всегда свежий, но не reactive
  const onDeleteEvent = useEffectEvent(async (todo) => {
    await action(todo.id);
    onDeleteSuccess?.(todo); // ← Всегда актуальный callback!
  });

  const handleDelete = useCallback(async (todo) => {
    await onDeleteEvent(todo);
  }, []); // ← Пустой deps! Стабильная функция!

  return { handleDelete };
}

// Использование:
<Button onClick={() => handleDelete(todo)} />
// Всегда одна и та же функция → нет re-render!
```

#### Когда НУЖЕН useEffectEvent?

**Сценарий 1: Callback props меняются**

```typescript
function useTodoDelete({ todos, onDelete }) {
  // ✅ С useEffectEvent
  const onDeleteEvent = useEffectEvent((todo) => {
    onDelete?.(todo); // Всегда свежий onDelete
  });

  const handleDelete = useCallback(async (todo) => {
    await action(todo.id);
    onDeleteEvent(todo);
  }, []); // Стабильный!
}
```

**Сценарий 2: State в closures**

```typescript
function useTodoDelete() {
  const [currentUser, setCurrentUser] = useState();

  // ✅ С useEffectEvent
  const onLogEvent = useEffectEvent((todo) => {
    logEvent(currentUser, todo); // Всегда свежий currentUser
  });

  const handleDelete = useCallback(async (todo) => {
    await action(todo.id);
    onLogEvent(todo);
  }, []); // currentUser НЕ в deps!
}
```

**Сценарий 3: Отложенные callbacks (ваш случай!)**

```typescript
function useTodoDelete() {
  const pendingDeletions = useRef<Map>();

  // ✅ Event handler - проверяет актуальный restorable
  const onExecuteDeletion = useEffectEvent(async (id: string, todo: Todo) => {
    const pending = pendingDeletions.current.get(id);

    // Проверяем перед delete - может уже Undo!
    if (!pending?.restorable) {
      console.log('Deletion cancelled, skipping');
      return; // 🎯 Не удаляем
    }

    const result = await action(id);
    if (!result.success && pending?.restorable) {
      // Restore on error
      await restoreOptimistically(todo);
    }
  });

  function handleTodoDelete(todo: Todo) {
    // Optimistic delete
    updateOptimistic({ type: 'delete', id: todo.id });

    // Schedule deletion (5 секунд на undo)
    const timerId = setTimeout(() => {
      pendingDeletions.current.delete(todo.id);
    }, 5000);

    pendingDeletions.current.set(todo.id, {
      todo,
      timerId,
      restorable: true,
    });

    // Execute immediately (НЕ через setTimeout!)
    onExecuteDeletion(todo.id, todo); // ← Всегда видит актуальный restorable
  }
}
```

**Почему это лучше useRef?**

| Аспект               | useRef (текущий)    | useEffectEvent            |
| -------------------- | ------------------- | ------------------------- |
| Работает?            | ✅ Да               | ✅ Да                     |
| Читаемость           | ⭐⭐ Мутация ref    | ⭐⭐⭐ Декларативный      |
| Стабильность функций | ❌ deps array нужен | ✅ Пустой deps            |
| Callback props       | ❌ Могут stale      | ✅ Всегда свежие          |
| Для портфолио        | ⭐⭐                | ⭐⭐⭐ (experimental API) |

---

### 3️⃣ Server vs Client Components

#### Золотое правило:

```
"Server by default, Client when needed"
```

#### Decision Tree:

```
Нужны React hooks (useState, useOptimistic, useEffect)?
├─ ДА → 'use client'
└─ НЕТ
    ↓
    Async data fetching?
    ├─ ДА → Server Component (async function)
    └─ НЕТ → Server Component (default)
```

#### Правильная граница для TodoContainer:

**❌ НЕПРАВИЛЬНО (все на клиенте):**

```tsx
'use client';

export default function TodoPage() {
  // Client-side fetch - плохо для SEO!
  const { data: todos } = useTodos();

  return (
    <>
      <TodoForm />
      <TodoList todos={todos} />
    </>
  );
}
```

**✅ ПРАВИЛЬНО (Server → Client boundary):**

```tsx
// app/todos/page.tsx (Server Component)
export default async function TodoPage() {
  // Server-side fetch - SEO friendly!
  const todos = await getTodosAction();

  return (
    <main>
      <h1>My Tasks</h1>
      {/* Client boundary starts here ⬇️ */}
      <TodoContainer initialTodos={todos} />
    </main>
  );
}

// components/TodoContainer.tsx (Client Component)
('use client');

export function TodoContainer({ initialTodos }) {
  // ✅ Single source of truth для optimistic state
  const [optimistic, update] = useOptimistic(initialTodos);

  return (
    <>
      <TodoForm update={update} />
      <TodoList todos={optimistic} />
    </>
  );
}
```

#### Преимущества:

1. **SEO:** HTML с todos рендерится на сервере
2. **Performance:** Меньше JS бандл на клиенте
3. **Security:** DB credentials остаются на сервере
4. **Caching:** Server Components автоматически кэшируются
5. **Initial Load:** Быстрее первая загрузка (SSR)

---

### 4️⃣ Hook Composition - 3 Layers

#### Проблема текущей архитектуры:

**Дублирование state:**

```typescript
// useTodoCreate.ts:40
const [optimisticTodos, updateOptimistic] = useOptimisticTodos(todos);

// useTodoDelete.ts:20
const [optimisticTodos, updateOptimistic] = useOptimisticTodos(todos);

// ❌ Это ДВА РАЗНЫХ экземпляра! Не синхронизированы!
```

**Mixing concerns в useTodoCreate:**

```typescript
export function useTodoCreate({ action, todos, onSuccess }) {
  // ❌ 4 разные ответственности в одном хуке:

  // 1. Form state
  const formRef = useRef();
  const inputRef = useRef();

  // 2. Validation
  const parsed = formSchema.safeParse();

  // 3. Optimistic updates
  const [optimistic, update] = useOptimisticTodos(todos);

  // 4. Keyboard shortcuts
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
  }, []);
}
```

#### Решение: 3-Layer Architecture

```
┌──────────────────────────────────────────────┐
│ Layer 1: Presentation Hooks                  │
│ (UI-specific, форма/список специфика)        │
│                                               │
│  useTodoForm({ addOptimistically })          │
│  - formRef, inputRef                         │
│  - validation (Zod)                          │
│  - keyboard shortcuts (⌘K)                   │
│  - toast notifications                       │
│                                               │
│  useTodoDelete({ remove, restore })          │
│  - undo timer (5 sec)                        │
│  - toast with Undo button                    │
│  - pendingDeletions map                      │
└────────────────┬─────────────────────────────┘
                 │ используют
┌────────────────▼─────────────────────────────┐
│ Layer 2: Business Logic Hooks                │
│ (Reusable operations)                         │
│                                               │
│  useTodoOperations({                         │
│    optimisticTodos,                          │
│    updateOptimistic,                         │
│    actions                                   │
│  })                                          │
│  - addOptimistically()                       │
│  - removeOptimistically()                    │
│  - restoreOptimistically()                   │
│  - updateOptimistically()                    │
└────────────────┬─────────────────────────────┘
                 │ использует
┌────────────────▼─────────────────────────────┐
│ Layer 3: State Management                    │
│ (Pure state)                                  │
│                                               │
│  useOptimistic(todos, reducer)               │
│  - optimisticState                           │
│  - updateOptimistic                          │
└───────────────────────────────────────────────┘
```

#### Пример: useTodoForm (Layer 1)

```typescript
// ТОЛЬКО form-specific логика
export function useTodoForm({ addOptimistically, onSuccess }) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Form state management
  const [state, formAction, isPending] = useActionState(
    async (_: FormState, formData: FormData) => {
      // Validation
      const parsed = formSchema.safeParse(/* ... */);
      if (!parsed.success) return { success: false, issues: [] };

      // Business logic - делегируем!
      const result = await addOptimistically(parsed.data.description);

      // UI feedback
      if (result.success) {
        toast.success('Task created');
        formRef.current?.reset();
      }

      return result.success ? initialState : { success: false };
    },
    initialState
  );

  // Keyboard shortcut (UI concern)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { formRef, inputRef, formAction, isPending, issues: state.issues };
}
```

#### Пример: useTodoOperations (Layer 2)

```typescript
// Reusable business logic
export function useTodoOperations({
  optimisticTodos,
  updateOptimistic,
  createAction,
  deleteAction,
  restoreAction,
}) {
  // ✅ С useEffectEvent - стабильные функции
  const onCreate = useEffectEvent(async (description: string) => {
    const tempId = `temp-${Date.now()}`;
    const tempTodo = {
      id: tempId,
      description,
      createdAt: new Date().toISOString(),
      deletedAt: null,
    };

    // Optimistic add
    updateOptimistic({ type: 'add', todo: tempTodo });

    // Server action
    const result = await createAction(description);

    // Remove temp
    updateOptimistic({ type: 'delete', id: tempId });

    return result;
  });

  const onRemove = useEffectEvent(async (todo: Todo) => {
    // Optimistic delete
    updateOptimistic({ type: 'delete', id: todo.id });

    // Server action (soft delete)
    const result = await deleteAction(todo.id);

    // Restore on error
    if (!result.success) {
      updateOptimistic({ type: 'add', todo });
    }

    return result;
  });

  const onRestore = useEffectEvent(async (todo: Todo) => {
    // Optimistic restore
    updateOptimistic({ type: 'add', todo });

    // Server action (undelete)
    const result = await restoreAction(todo.id);

    // Remove on error
    if (!result.success) {
      updateOptimistic({ type: 'delete', id: todo.id });
    }

    return result;
  });

  // ✅ Стабильные функции (пустой deps)
  const addOptimistically = useCallback(async (description: string) => onCreate(description), []);

  const removeOptimistically = useCallback(async (todo: Todo) => onRemove(todo), []);

  const restoreOptimistically = useCallback(async (todo: Todo) => onRestore(todo), []);

  return {
    optimisticTodos,
    addOptimistically,
    removeOptimistically,
    restoreOptimistically,
  };
}
```

#### Преимущества 3-layer:

1. **Single Responsibility:** Каждый хук = одна задача
2. **Testability:** Легко мокать зависимости
3. **Reusability:** Operations переиспользуются
4. **Maintainability:** Понятно где что лежит
5. **Scalability:** Легко добавить новые операции

---

## 🏗️ Пошаговая Реализация

### Шаг 1: Подготовка БД - Soft Delete

#### 1.1 Обновить schema

**Файл:** `src/db/drizzle/schema.ts`

```typescript
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const todos = sqliteTable('todos', {
  id: text('id').primaryKey(),
  description: text('description').notNull(),
  createdAt: text('created_at').notNull(),
  deletedAt: text('deleted_at'), // ✨ НОВОЕ поле!
});

export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
```

#### 1.2 Генерация миграции

```bash
npm run drizzle:generate
```

**Проверить:** Файл создан в `drizzle/migrations/XXXX_add_deleted_at.sql`

```sql
-- Migration generated by Drizzle
ALTER TABLE `todos` ADD `deleted_at` text;
```

#### 1.3 Применить миграцию

```bash
npm run drizzle:migrate:dev
```

**Проверка:** Запустить SQLite и проверить:

```bash
sqlite3 dev.db.sqlite3
.schema todos
```

Должно быть поле `deleted_at`.

---

### Шаг 2: Server Actions

#### 2.1 Обновить deleteTodoAction (Soft Delete)

**Файл:** `src/core/todo/actions/delete-todo.action.ts`

**БЫЛО:**

```typescript
export async function deleteTodoAction(id: string) {
  await db.delete(todos).where(eq(todos.id, id));
  revalidatePath('/');
  return { success: true };
}
```

**СТАЛО:**

```typescript
'use server';

import { db } from '@/db/drizzle/db';
import { todos } from '@/db/drizzle/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function deleteTodoAction(id: string) {
  try {
    // ✨ Soft delete вместо hard delete
    await db.update(todos).set({ deletedAt: new Date().toISOString() }).where(eq(todos.id, id));

    revalidatePath('/todos');

    return { success: true };
  } catch (error) {
    console.error('Delete todo error:', error);
    return {
      success: false,
      errors: ['Failed to delete task'],
    };
  }
}
```

#### 2.2 Создать restoreTodoAction

**Файл:** `src/core/todo/actions/restore-todo.action.ts` ✨ НОВЫЙ

```typescript
'use server';

import { db } from '@/db/drizzle/db';
import { todos } from '@/db/drizzle/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function restoreTodoAction(id: string) {
  try {
    // ✨ Undelete: set deletedAt = null
    await db.update(todos).set({ deletedAt: null }).where(eq(todos.id, id));

    revalidatePath('/todos');

    return { success: true };
  } catch (error) {
    console.error('Restore todo error:', error);
    return {
      success: false,
      errors: ['Failed to restore task'],
    };
  }
}
```

#### 2.3 Обновить getTodosAction

**Файл:** `src/core/todo/actions/get-todos.action.ts`

**БЫЛО:**

```typescript
export async function getTodosAction() {
  return await db.select().from(todos).orderBy(desc(todos.createdAt));
}
```

**СТАЛО:**

```typescript
'use server';

import { db } from '@/db/drizzle/db';
import { todos } from '@/db/drizzle/schema';
import { desc, isNull } from 'drizzle-orm';

export async function getTodosAction() {
  // ✨ Фильтруем удаленные (deletedAt IS NULL)
  return await db
    .select()
    .from(todos)
    .where(isNull(todos.deletedAt))
    .orderBy(desc(todos.createdAt));
}
```

#### 2.4 Создать type definitions

**Файл:** `src/core/todo/actions/todo.action.types.ts`

```typescript
export type CreateTodoAction = (description: string) => Promise<{
  success: boolean;
  errors?: string[];
}>;

export type DeleteTodoAction = (id: string) => Promise<{
  success: boolean;
  errors?: string[];
}>;

export type RestoreTodoAction = (id: string) => Promise<{
  success: boolean;
  errors?: string[];
}>;

export type GetTodosAction = () => Promise<Todo[]>;
```

---

### Шаг 3: Hook Layer (Главная часть!)

#### 3.1 Обновить useOptimisticTodos (Layer 3)

**Файл:** `src/hooks/useOptimisticTodos.ts`

**БЫЛО:**

```typescript
type OptimisticAction = { type: 'delete'; id: string } | { type: 'add'; todo: Todo };
```

**СТАЛО:**

```typescript
import { Todo } from '@/core/todo/schemas/todo.contract';
import { useOptimistic } from 'react';

type OptimisticAction =
  | { type: 'delete'; id: string }
  | { type: 'add'; todo: Todo }
  | { type: 'update'; id: string; data: Partial<Todo> }; // ✨ НОВЫЙ!

export function useOptimisticTodos(todos: Todo[]) {
  return useOptimistic(todos, (state, action: OptimisticAction) => {
    switch (action.type) {
      case 'delete':
        return state.filter((todo) => todo.id !== action.id);
      case 'add':
        return [...state, action.todo];
      case 'update':
        return state.map((todo) => (todo.id === action.id ? { ...todo, ...action.data } : todo));
      default:
        return state;
    }
  });
}
```

#### 3.2 Создать useTodoOperations (Layer 2) ✨ НОВЫЙ

**Файл:** `src/hooks/useTodoOperations.ts`

```typescript
import { Todo } from '@/core/todo/schemas/todo.contract';
import {
  CreateTodoAction,
  DeleteTodoAction,
  RestoreTodoAction,
} from '@/core/todo/actions/todo.action.types';
import { useCallback } from 'react';
import { useEffectEvent } from 'react'; // ✨ Experimental!

type UseTodoOperationsProps = {
  optimisticTodos: Todo[];
  updateOptimistic: (action: any) => void;
  createAction: CreateTodoAction;
  deleteAction: DeleteTodoAction;
  restoreAction: RestoreTodoAction;
};

export function useTodoOperations({
  optimisticTodos,
  updateOptimistic,
  createAction,
  deleteAction,
  restoreAction,
}: UseTodoOperationsProps) {
  // ✨ Event handlers - всегда видят свежие props
  const onCreate = useEffectEvent(async (description: string) => {
    const tempId = `temp-${Date.now()}`;
    const tempTodo: Todo = {
      id: tempId,
      description,
      createdAt: new Date().toISOString(),
      deletedAt: null,
    };

    // Optimistic add
    updateOptimistic({ type: 'add', todo: tempTodo });

    try {
      // Server action
      const result = await createAction(description);

      // Remove temp todo
      updateOptimistic({ type: 'delete', id: tempId });

      return result;
    } catch (error) {
      // Cleanup on error
      updateOptimistic({ type: 'delete', id: tempId });
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  });

  const onRemove = useEffectEvent(async (todo: Todo) => {
    // Optimistic delete
    updateOptimistic({ type: 'delete', id: todo.id });

    try {
      // Server action (soft delete)
      const result = await deleteAction(todo.id);

      if (!result.success) {
        // Restore on error
        updateOptimistic({ type: 'add', todo });
      }

      return result;
    } catch (error) {
      // Restore on error
      updateOptimistic({ type: 'add', todo });
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  });

  const onRestore = useEffectEvent(async (todo: Todo) => {
    // Optimistic restore
    updateOptimistic({ type: 'add', todo });

    try {
      // Server action (undelete: set deletedAt = null)
      const result = await restoreAction(todo.id);

      if (!result.success) {
        // Remove on error
        updateOptimistic({ type: 'delete', id: todo.id });
      }

      return result;
    } catch (error) {
      // Remove on error
      updateOptimistic({ type: 'delete', id: todo.id });
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  });

  // ✅ Stable functions (empty deps)
  const addOptimistically = useCallback(
    async (description: string) => onCreate(description),
    [] // ← onCreate из useEffectEvent не reactive
  );

  const removeOptimistically = useCallback(async (todo: Todo) => onRemove(todo), []);

  const restoreOptimistically = useCallback(async (todo: Todo) => onRestore(todo), []);

  return {
    optimisticTodos,
    addOptimistically,
    removeOptimistically,
    restoreOptimistically,
  };
}
```

**ВАЖНО:** `useEffectEvent` experimental! Если TypeScript ругается:

```typescript
// Временный workaround до stable release:
declare module 'react' {
  function useEffectEvent<T extends Function>(fn: T): T;
}
```

#### 3.3 Рефакторинг useTodoForm (Layer 1)

**Файл:** `src/hooks/useTodoForm.ts`

**БЫЛО:** Делал все сам (validation + optimistic + form + keyboard)

**СТАЛО:** Только form-specific логика

```typescript
import { sanitizeStr } from '@/utils/sanitize-str';
import { useActionState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import z from 'zod';

const formSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, { message: 'Task must not be empty!' })
    .max(200, { message: 'Task must not be more 200 letters!' })
    .transform(sanitizeStr),
});

type FormState = {
  success: boolean;
  issues?: z.ZodIssue[];
  data: { description: string };
};

const initialState: FormState = {
  success: true,
  issues: undefined,
  data: { description: '' },
};

type UseTodoFormProps = {
  addOptimistically: (description: string) => Promise<{
    success: boolean;
    errors?: string[];
  }>;
  onSuccess?: (description: string) => void;
};

export function useTodoForm({ addOptimistically, onSuccess }: UseTodoFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [state, formAction, isPending] = useActionState(
    async (_: FormState, formData: FormData): Promise<FormState> => {
      const raw = formData.get('description') as string;

      // Validation
      const parsed = formSchema.safeParse({ description: raw });
      if (!parsed.success) {
        return {
          success: false,
          issues: parsed.error.issues,
          data: { description: raw },
        };
      }

      // ✅ Business logic - делегируем в useTodoOperations!
      const result = await addOptimistically(parsed.data.description);

      if (!result.success) {
        toast.error('Failed to create task', {
          description: result.errors?.join(', '),
        });

        return {
          success: false,
          issues: result.errors?.map((err) => ({
            code: 'custom' as const,
            path: ['description'],
            message: err,
          })),
          data: { description: raw },
        };
      }

      // Success feedback
      toast.success('Task created', { description: parsed.data.description });
      onSuccess?.(parsed.data.description);
      formRef.current?.reset();

      return initialState;
    },
    initialState
  );

  // Auto-focus on success
  useEffect(() => {
    if (state.success && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state.success]);

  // Keyboard shortcut: ⌘K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    formRef,
    inputRef,
    formAction,
    isPending,
    issues: state.issues,
    description: state.data.description,
  };
}
```

#### 3.4 Рефакторинг useTodoDelete (Layer 1)

**Файл:** `src/hooks/useTodoDelete.ts`

**БЫЛО:** Создавал свой `useOptimisticTodos`, сам делал delete

**СТАЛО:** Только delete-specific логика (timer + undo)

```typescript
import { Todo } from '@/core/todo/schemas/todo.contract';
import { sanitizeStr } from '@/utils/sanitize-str';
import { useCallback, useEffect, useRef } from 'react';
import { useEffectEvent } from 'react'; // ✨ Experimental!
import { toast } from 'sonner';

const CANCEL_TOAST = 500;
const DELETE_DELAY = 5000;

type PendingDeletion = {
  todo: Todo;
  toastId: string | number;
  restorable: boolean;
  timerId: NodeJS.Timeout;
};

type UseTodoDeleteProps = {
  removeOptimistically: (todo: Todo) => Promise<{
    success: boolean;
    errors?: string[];
  }>;
  restoreOptimistically: (todo: Todo) => Promise<{
    success: boolean;
    errors?: string[];
  }>;
};

export function useTodoDelete({ removeOptimistically, restoreOptimistically }: UseTodoDeleteProps) {
  const pendingDeletions = useRef<Map<string, PendingDeletion>>(new Map());

  // ✨ Event handler для restore - всегда свежий callback
  const onRestore = useEffectEvent(async (todo: Todo) => {
    await restoreOptimistically(todo);
  });

  // ✨ Event handler для remove - всегда свежий callback
  const onRemove = useEffectEvent(async (todo: Todo) => {
    await removeOptimistically(todo);
  });

  const cancelDeletion = useCallback(
    async (todoId: string) => {
      console.log('Undo clicked');
      const pending = pendingDeletions.current.get(todoId);
      if (!pending) return;

      // Mark as non-restorable
      pending.restorable = false;
      clearTimeout(pending.timerId);
      pendingDeletions.current.delete(todoId);

      // ✅ Restore через server action (soft delete!)
      await onRestore(pending.todo);

      toast.info('Action cancelled', {
        id: pending.toastId,
        description: 'Task restored successfully',
        duration: CANCEL_TOAST,
      });
    },
    [] // ← onRestore из useEffectEvent не reactive
  );

  const handleTodoDelete = useCallback(
    async (todo: Todo) => {
      const cleanId = sanitizeStr(todo.id);
      console.log('Delete clicked');

      if (!cleanId) return;
      if (pendingDeletions.current.has(cleanId)) return;

      console.log('Starting deletion...');

      // Show toast with undo
      const toastId = toast.success('Task deleted', {
        description: todo.description,
        duration: DELETE_DELAY,
        action: {
          label: 'Undo',
          onClick: () => cancelDeletion(cleanId),
        },
      });

      // Cleanup timer (только для мапы, НЕ для action!)
      const timerId = setTimeout(() => {
        pendingDeletions.current.delete(cleanId);
      }, DELETE_DELAY);

      pendingDeletions.current.set(cleanId, {
        todo,
        toastId,
        restorable: true,
        timerId,
      });

      // ✅ Execute deletion IMMEDIATELY (не через setTimeout!)
      const result = await onRemove(todo);

      if (!result.success) {
        // Error - cleanup
        const pending = pendingDeletions.current.get(cleanId);
        if (pending) {
          clearTimeout(pending.timerId);
          pendingDeletions.current.delete(cleanId);
          toast.error('Failed to delete task', {
            id: toastId,
            description: result.errors?.[0] || 'Unknown error',
          });
        }
      }
    },
    [] // ← onRemove из useEffectEvent не reactive
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pendingDeletions.current.forEach((pending) => {
        clearTimeout(pending.timerId);
      });
      pendingDeletions.current.clear();
    };
  }, []);

  return { handleTodoDelete };
}
```

**Ключевые изменения:**

1. ✅ `useEffectEvent` для `onRestore` и `onRemove`
2. ✅ Пустой deps array в `useCallback` (стабильные функции!)
3. ✅ Делегирует бизнес-логику в `useTodoOperations`
4. ✅ Только delete-specific: timer, toast, undo

```
// ✅ ФИНАЛЬНОЕ РЕШЕНИЕ: Лучшее из обоих миров

// hooks/useTodoDelete.ts
import { Todo } from '@/core/todo/schemas/todo.contract';
import { sanitizeStr } from '@/utils/sanitize-str';
import { useCallback, useEffect, useRef } from 'react';
import { useEffectEvent } from './useEffectEvent';
import { toast } from 'sonner';

const CANCEL_TOAST = 500;
const DELETE_DELAY = 5000;

type PendingDeletion = {
  todo: Todo;
  toastId: string | number;
  restorable: boolean;
  timerId: NodeJS.Timeout;
};

type UseTodoDeleteProps = {
  removeOptimistically: (
    todo: Todo,
    checkRestorable: () => boolean // ✅ Передаем проверку
  ) => Promise<{
    success: boolean;
    errors?: string[];
    cancelled?: boolean;
  }>;
  restoreOptimistically: (todo: Todo) => Promise<{
    success: boolean;
    errors?: string[];
  }>;
};

export function useTodoDelete({
  removeOptimistically,
  restoreOptimistically,
}: UseTodoDeleteProps) {
  const pendingDeletions = useRef<Map<string, PendingDeletion>>(new Map());

  const onRestore = useEffectEvent(async (todo: Todo) => {
    await restoreOptimistically(todo);
  });

  const onRemove = useEffectEvent(async (
    todo: Todo,
    checkRestorable: () => boolean
  ) => {
    await removeOptimistically(todo, checkRestorable);
  });

  const cancelDeletion = useCallback(
    async (todoId: string) => {
      console.log('Undo clicked');
      const pending = pendingDeletions.current.get(todoId);
      if (!pending) return;

      // ✅ Mark as non-restorable (onRemove будет проверять)
      pending.restorable = false;
      clearTimeout(pending.timerId);
      pendingDeletions.current.delete(todoId);

      // Restore
      await onRestore(pending.todo);

      toast.info('Action cancelled', {
        id: pending.toastId,
        description: 'Task restored successfully',
        duration: CANCEL_TOAST,
      });
    },
    []
  );

  const handleTodoDelete = useCallback(
    async (todo: Todo) => {
      const cleanId = sanitizeStr(todo.id);

      if (!cleanId) return;
      if (pendingDeletions.current.has(cleanId)) return;

      console.log('Starting deletion...');

      const toastId = toast.success('Task deleted', {
        description: todo.description,
        duration: DELETE_DELAY,
        action: {
          label: 'Undo',
          onClick: () => cancelDeletion(cleanId),
        },
      });

      // ✅ Timer marks as non-restorable after delay
      const timerId = setTimeout(() => {
        const pending = pendingDeletions.current.get(cleanId);
        if (pending) {
          pending.restorable = false;
        }
      }, DELETE_DELAY);

      pendingDeletions.current.set(cleanId, {
        todo,
        toastId,
        restorable: true,
        timerId,
      });

      try {
        // ✅ Передаем функцию проверки
        const checkRestorable = () => {
          const pending = pendingDeletions.current.get(cleanId);
          return pending?.restorable === true;
        };

        // Execute deletion
        const result = await onRemove(todo, checkRestorable);

        // ✅ Если cancelled - ничего не делаем
        if (result.cancelled) {
          console.log('Deletion cancelled by user');
          return;
        }

        // Handle error
        if (!result.success) {
          const pending = pendingDeletions.current.get(cleanId);
          if (pending) {
            toast.error('Failed to delete task', {
              id: toastId,
              description: result.errors?.[0] || 'Unknown error',
            });
          }
        }
      } finally {
        // ✅ Always cleanup after action completes
        const pending = pendingDeletions.current.get(cleanId);
        if (pending) {
          clearTimeout(pending.timerId);
          pendingDeletions.current.delete(cleanId);
        }
      }
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pendingDeletions.current.forEach((pending) => {
        clearTimeout(pending.timerId);
      });
      pendingDeletions.current.clear();
    };
  }, []);

  return { handleTodoDelete };
}

// hooks/useTodoOperations.ts
export function useTodoOperations({
  optimisticTodos,
  updateOptimistic,
  deleteAction,
  restoreAction,
}) {
  const onRemove = useEffectEvent(async (
    todo: Todo,
    checkRestorable: () => boolean // ✅ Принимаем проверку
  ) => {
    // Optimistic delete
    updateOptimistic({ type: 'delete', id: todo.id });

    // ✅ ПЕРВАЯ проверка ПЕРЕД server action
    if (!checkRestorable()) {
      console.log('❌ Not restorable, skipping server action');
      updateOptimistic({ type: 'add', todo });
      return { success: false, cancelled: true };
    }

    try {
      // Server action (soft delete)
      const result = await deleteAction(todo.id);

      // ✅ ВТОРАЯ проверка ПОСЛЕ server action (защита от долгого network)
      if (!checkRestorable()) {
        console.log('⚠️ Cancelled after server action, rolling back');
        // Rollback
        await restoreAction(todo.id);
        updateOptimistic({ type: 'add', todo });
        return { success: false, cancelled: true };
      }

      if (!result.success) {
        // Restore on error
        updateOptimistic({ type: 'add', todo });
      }

      return result;
    } catch (error) {
      // Restore on exception
      updateOptimistic({ type: 'add', todo });
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  });

  const removeOptimistically = useCallback(
    async (todo: Todo, checkRestorable: () => boolean) =>
      onRemove(todo, checkRestorable),
    []
  );

  return {
    optimisticTodos,
    removeOptimistically,
    // ...
  };
}
```

---

### Шаг 4: Components

#### 4.1 Создать Server Page

**Файл:** `src/app/todos/page.tsx` ✨ НОВЫЙ

```typescript
import { getTodosAction } from '@/core/todo/actions/get-todos.action';
import { createTodoAction } from '@/core/todo/actions/create-todo.action';
import { deleteTodoAction } from '@/core/todo/actions/delete-todo.action';
import { restoreTodoAction } from '@/core/todo/actions/restore-todo.action';
import { TodoContainer } from '@/components/TodoContainer/TodoContainer';

export default async function TodoPage() {
  // ✅ Server-side data fetch (SEO friendly)
  const todos = await getTodosAction();

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">My Tasks</h1>

      {/* ✅ Client boundary starts here */}
      <TodoContainer
        initialTodos={todos}
        createAction={createTodoAction}
        deleteAction={deleteTodoAction}
        restoreAction={restoreTodoAction}
      />
    </main>
  );
}
```

#### 4.2 Создать TodoContainer (Client Coordinator)

**Файл:** `src/components/TodoContainer/TodoContainer.tsx` ✨ НОВЫЙ

```typescript
'use client';

import { Todo } from '@/core/todo/schemas/todo.contract';
import {
  CreateTodoAction,
  DeleteTodoAction,
  RestoreTodoAction,
} from '@/core/todo/actions/todo.action.types';
import { useOptimisticTodos } from '@/hooks/useOptimisticTodos';
import { useTodoOperations } from '@/hooks/useTodoOperations';
import { useTodoForm } from '@/hooks/useTodoForm';
import { useTodoDelete } from '@/hooks/useTodoDelete';
import { TodoForm } from '../TodoForm';
import { TodoList } from '../TodoList';

type TodoContainerProps = {
  initialTodos: Todo[];
  createAction: CreateTodoAction;
  deleteAction: DeleteTodoAction;
  restoreAction: RestoreTodoAction;
};

export function TodoContainer({
  initialTodos,
  createAction,
  deleteAction,
  restoreAction,
}: TodoContainerProps) {
  // ✅ Layer 3: Single source of truth для optimistic state
  const [optimisticTodos, updateOptimistic] = useOptimisticTodos(initialTodos);

  // ✅ Layer 2: Business logic operations
  const operations = useTodoOperations({
    optimisticTodos,
    updateOptimistic,
    createAction,
    deleteAction,
    restoreAction,
  });

  // ✅ Layer 1: Presentation hooks
  const formProps = useTodoForm({
    addOptimistically: operations.addOptimistically,
  });

  const deleteProps = useTodoDelete({
    removeOptimistically: operations.removeOptimistically,
    restoreOptimistically: operations.restoreOptimistically,
  });

  return (
    <div className="space-y-8">
      <TodoForm {...formProps} />
      <TodoList
        todos={operations.optimisticTodos}
        onDelete={deleteProps.handleTodoDelete}
      />
    </div>
  );
}
```

**Архитектура TodoContainer:**

```
TodoContainer (Client)
  │
  ├─ Layer 3: useOptimisticTodos ─────────┐
  │                                        │
  ├─ Layer 2: useTodoOperations ──────────┤ Передает вниз
  │   - addOptimistically                 │
  │   - removeOptimistically              │
  │   - restoreOptimistically             │
  │                                        │
  ├─ Layer 1: useTodoForm ────────────────┤
  │   - Использует addOptimistically      │
  │                                        │
  ├─ Layer 1: useTodoDelete ──────────────┤
  │   - Использует remove/restore         │
  │                                        ▼
  └─ Render: TodoForm + TodoList
```

#### 4.3 Упростить TodoForm

**Файл:** `src/components/TodoForm/index.tsx`

**БЫЛО:** Принимал `action`, `todos`, создавал свой `useTodoCreate`

**СТАЛО:** Только UI, принимает готовые props

```typescript
'use client';

import { RefObject } from 'react';
import { ZodIssue } from 'zod';
import { TaskInput } from '../TaskInput';

export type TodoFormProps = {
  formRef: RefObject<HTMLFormElement>;
  inputRef: RefObject<HTMLTextAreaElement>;
  formAction: (formData: FormData) => void;
  isPending: boolean;
  description: string;
  issues?: ZodIssue[];
};

export function TodoForm({
  formRef,
  inputRef,
  formAction,
  isPending,
  description,
  issues,
}: TodoFormProps) {
  return (
    <form ref={formRef} action={formAction}>
      <TaskInput
        ref={inputRef}
        label="New Task"
        defaultValue={description}
        disabled={isPending}
        issues={issues}
        placeholder="Add new task... (⌘K to focus)"
      />
    </form>
  );
}
```

#### 4.4 Упростить TodoList

**Файл:** `src/components/TodoList/index.tsx`

**БЫЛО:** Принимал `action`, создавал свой `useTodoDelete`

**СТАЛО:** Только UI, принимает готовый callback

```typescript
import { Todo } from '@/core/todo/schemas/todo.contract';
import { useId } from 'react';
import { Button } from '../ui/Button';
import { Item, ItemActions, ItemContent, ItemGroup, ItemTitle } from '../ui/item';

export type TodoListProps = {
  todos: Todo[];
  onDelete: (todo: Todo) => void;
};

type TodoListItemsProps = {
  todos: Todo[];
  headingId: string;
  onDelete: (todo: Todo) => void;
};

export function TodoList({ todos, onDelete }: TodoListProps) {
  const id = useId();
  const headingId = `heading-${id}`;

  return <TodoListItems todos={todos} headingId={headingId} onDelete={onDelete} />;
}

function TodoListItems({ todos, headingId, onDelete }: TodoListItemsProps) {
  const hasTodos = todos.length > 0;

  if (!hasTodos) {
    return (
      <div role="status" aria-live="polite" className="text-center text-muted-foreground py-12">
        <p>No tasks found</p>
      </div>
    );
  }

  return (
    <ItemGroup
      aria-labelledby={headingId}
      aria-label="Todo list"
      className="flex flex-col min-w-xs max-w-sm gap-4"
    >
      {todos.map((todo) => (
        <Item variant="muted" key={todo.id}>
          <ItemContent>
            <ItemTitle className="line-clamp-2">{todo.description}</ItemTitle>
          </ItemContent>
          <ItemActions>
            <Button
              variant="outline"
              size="sm"
              aria-label={`Delete task: ${todo.description}`}
              onClick={() => onDelete(todo)}
            >
              Close
            </Button>
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  );
}
```

---

### Шаг 5: Tests

#### 5.1 TodoContainer.test.tsx ✨ НОВЫЙ

**Файл:** `src/components/TodoContainer/TodoContainer.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { TodoContainer } from './TodoContainer';

const mockTodos = [
  {
    id: '1',
    description: 'Test todo',
    createdAt: new Date().toISOString(),
    deletedAt: null,
  },
];

describe('TodoContainer', () => {
  it('renders todos from server', () => {
    const mockActions = {
      createAction: vi.fn(),
      deleteAction: vi.fn(),
      restoreAction: vi.fn(),
    };

    render(<TodoContainer initialTodos={mockTodos} {...mockActions} />);

    expect(screen.getByText('Test todo')).toBeInTheDocument();
  });

  it('creates todo optimistically', async () => {
    const user = userEvent.setup();
    const createAction = vi.fn().mockResolvedValue({ success: true });

    render(
      <TodoContainer
        initialTodos={[]}
        createAction={createAction}
        deleteAction={vi.fn()}
        restoreAction={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/add new task/i);
    await user.type(input, 'New task');
    await user.keyboard('{Enter}');

    // Verify optimistic update
    expect(screen.getByText('New task')).toBeInTheDocument();

    await waitFor(() => {
      expect(createAction).toHaveBeenCalledWith('New task');
    });
  });

  it('handles undo deletion with restore action', async () => {
    const user = userEvent.setup();
    const deleteAction = vi.fn().mockResolvedValue({ success: true });
    const restoreAction = vi.fn().mockResolvedValue({ success: true });

    render(
      <TodoContainer
        initialTodos={mockTodos}
        createAction={vi.fn()}
        deleteAction={deleteAction}
        restoreAction={restoreAction}
      />
    );

    // Delete
    const closeButton = screen.getByRole('button', { name: /delete task/i });
    await user.click(closeButton);

    // Verify optimistic delete
    await waitFor(() => {
      expect(screen.queryByText('Test todo')).not.toBeInTheDocument();
    });

    // Undo
    const undoButton = await screen.findByRole('button', { name: /undo/i });
    await user.click(undoButton);

    // Verify restore action called
    await waitFor(() => {
      expect(restoreAction).toHaveBeenCalledWith('1');
    });
  });
});
```

#### 5.2 useTodoOperations.spec.ts ✨ НОВЫЙ

**Файл:** `src/hooks/__tests__/useTodoOperations.spec.ts`

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useTodoOperations } from '../useTodoOperations';
import { useOptimisticTodos } from '../useOptimisticTodos';

// Mock useEffectEvent (experimental)
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useEffectEvent: (fn: any) => fn,
  };
});

describe('useTodoOperations', () => {
  it('adds todo optimistically', async () => {
    const createAction = vi.fn().mockResolvedValue({ success: true });
    const updateOptimistic = vi.fn();

    const { result } = renderHook(() =>
      useTodoOperations({
        optimisticTodos: [],
        updateOptimistic,
        createAction,
        deleteAction: vi.fn(),
        restoreAction: vi.fn(),
      })
    );

    await result.current.addOptimistically('New task');

    // Verify optimistic add called
    expect(updateOptimistic).toHaveBeenCalledWith({
      type: 'add',
      todo: expect.objectContaining({ description: 'New task' }),
    });

    // Verify server action called
    expect(createAction).toHaveBeenCalledWith('New task');

    // Verify temp todo removed
    await waitFor(() => {
      expect(updateOptimistic).toHaveBeenCalledWith({
        type: 'delete',
        id: expect.stringContaining('temp-'),
      });
    });
  });

  it('removes todo and restores on error', async () => {
    const deleteAction = vi.fn().mockResolvedValue({
      success: false,
      errors: ['DB error'],
    });
    const updateOptimistic = vi.fn();

    const todo = {
      id: '1',
      description: 'Test',
      createdAt: new Date().toISOString(),
      deletedAt: null,
    };

    const { result } = renderHook(() =>
      useTodoOperations({
        optimisticTodos: [todo],
        updateOptimistic,
        createAction: vi.fn(),
        deleteAction,
        restoreAction: vi.fn(),
      })
    );

    await result.current.removeOptimistically(todo);

    // Verify optimistic delete
    expect(updateOptimistic).toHaveBeenCalledWith({
      type: 'delete',
      id: '1',
    });

    // Verify restore on error
    await waitFor(() => {
      expect(updateOptimistic).toHaveBeenCalledWith({
        type: 'add',
        todo,
      });
    });
  });
});
```

---

### Шаг 6: Обновить документацию

#### 6.1 Обновить CLAUDE.md

**Файл:** `CLAUDE.md`

Добавить в секцию "Common Development Patterns":

````markdown
### Soft Delete Pattern

Todos используют soft delete вместо hard delete:

**Schema:**

```typescript
export const todos = sqliteTable('todos', {
  id: text('id').primaryKey(),
  description: text('description').notNull(),
  createdAt: text('created_at').notNull(),
  deletedAt: text('deleted_at'), // null = active, timestamp = deleted
});
```
````

**Querying active todos:**

```typescript
await db.select().from(todos).where(isNull(todos.deletedAt)); // Only active
```

**Delete (soft):**

```typescript
await db.update(todos).set({ deletedAt: new Date().toISOString() }).where(eq(todos.id, id));
```

**Restore:**

```typescript
await db.update(todos).set({ deletedAt: null }).where(eq(todos.id, id));
```

### Hook Composition (3 Layers)

**Layer 3 - State Management:**

- `useOptimisticTodos` - Pure optimistic state

**Layer 2 - Business Logic:**

- `useTodoOperations` - Reusable CRUD operations
- Uses `useEffectEvent` for stable callbacks

**Layer 1 - Presentation:**

- `useTodoForm` - Form-specific logic
- `useTodoDelete` - Delete-specific logic (undo timer)

**Usage:**

```typescript
// TodoContainer coordinates all layers
const [optimistic, update] = useOptimisticTodos(todos);

const operations = useTodoOperations({
  optimisticTodos: optimistic,
  updateOptimistic: update,
  actions,
});

const formProps = useTodoForm({
  addOptimistically: operations.addOptimistically,
});
```

````

#### 6.2 Создать ARCHITECTURE.md

**Файл:** `docs/ARCHITECTURE.md` ✨ НОВЫЙ

```markdown
# Architecture Decision Records

## ADR-001: Soft Delete Pattern

**Context:** Need undo functionality for deleted todos.

**Decision:** Use soft delete with `deletedAt` timestamp.

**Consequences:**
- ✅ Can restore with same ID
- ✅ Audit trail
- ✅ Can add "Trash" view
- ❌ Need to filter in all queries

## ADR-002: useEffectEvent for Event Handlers

**Context:** Need stable callbacks that see fresh props.

**Decision:** Use experimental `useEffectEvent` API.

**Consequences:**
- ✅ Stable functions (empty deps)
- ✅ Always fresh closures
- ✅ Shows modern React knowledge
- ❌ Experimental (not stable yet)

## ADR-003: 3-Layer Hook Composition

**Context:** Avoid mixing concerns, enable reusability.

**Decision:** Separate hooks into 3 layers:
1. State (useOptimistic)
2. Operations (business logic)
3. Presentation (UI-specific)

**Consequences:**
- ✅ Single Responsibility
- ✅ Testable
- ✅ Reusable
- ❌ More files
````

---

## 📁 Итоговая Структура Файлов

```
src/
├── app/
│   ├── page.tsx                      # Дефолтная страница (может редирект на /todos)
│   └── todos/
│       └── page.tsx                  # ✨ НОВЫЙ - Server Component
│
├── components/
│   ├── TodoContainer/
│   │   ├── TodoContainer.tsx         # ✨ НОВЫЙ - Client координатор
│   │   └── TodoContainer.test.tsx    # ✨ НОВЫЙ
│   ├── TodoForm/
│   │   ├── index.tsx                 # ♻️ УПРОЩЕН (только UI)
│   │   ├── TodoForm.test.tsx         # ♻️ ОБНОВИТЬ
│   │   └── TodoForm.stories.tsx      # ♻️ ОБНОВИТЬ
│   └── TodoList/
│       ├── index.tsx                 # ♻️ УПРОЩЕН (только UI)
│       ├── TodoList.test.tsx         # ♻️ ОБНОВИТЬ
│       └── TodoList.stories.tsx      # ♻️ ОБНОВИТЬ
│
├── hooks/
│   ├── useOptimisticTodos.ts         # ♻️ +update action
│   ├── useTodoOperations.ts          # ✨ НОВЫЙ - Layer 2
│   ├── useTodoForm.ts                # ♻️ РЕФАКТОРИНГ - Layer 1
│   ├── useTodoDelete.ts              # ♻️ РЕФАКТОРИНГ - Layer 1
│   └── __tests__/
│       ├── useTodoOperations.spec.ts # ✨ НОВЫЙ
│       ├── useTodoForm.spec.ts       # ♻️ ОБНОВИТЬ
│       └── useTodoDelete.spec.ts     # ♻️ ОБНОВИТЬ
│
├── core/todo/
│   ├── actions/
│   │   ├── create-todo.action.ts     # БЕЗ ИЗМЕНЕНИЙ
│   │   ├── delete-todo.action.ts     # ♻️ Soft delete
│   │   ├── get-todos.action.ts       # ♻️ Filter deletedAt
│   │   ├── restore-todo.action.ts    # ✨ НОВЫЙ
│   │   └── todo.action.types.ts      # ♻️ +RestoreTodoAction
│   ├── schemas/
│   │   └── todo.contract.ts          # ♻️ +deletedAt field
│   └── ...
│
├── db/drizzle/
│   └── schema.ts                     # ♻️ +deletedAt field
│
└── docs/
    ├── REFACTORING_PLAN.md           # ✨ ЭТОТ ФАЙЛ
    ├── ARCHITECTURE.md               # ✨ НОВЫЙ - ADRs
    └── TESTING_TASKINPUT_LESSON.md   # СУЩЕСТВУЮЩИЙ
```

**Легенда:**

- ✨ НОВЫЙ - создать с нуля
- ♻️ ИЗМЕНИТЬ - рефакторинг существующего
- БЕЗ ИЗМЕНЕНИЙ - не трогать

---

## ✅ Чеклист Реализации

### Шаг 1: БД ✨

- [ ] Обновить `schema.ts` (+deletedAt)
- [ ] Сгенерировать миграцию (`npm run drizzle:generate`)
- [ ] Применить миграцию (`npm run drizzle:migrate:dev`)
- [ ] Проверить schema в SQLite

### Шаг 2: Server Actions ✨

- [ ] Обновить `deleteTodoAction` (soft delete)
- [ ] Создать `restoreTodoAction`
- [ ] Обновить `getTodosAction` (filter deletedAt)
- [ ] Обновить `todo.action.types.ts`

### Шаг 3: Hooks ✨

- [ ] Обновить `useOptimisticTodos` (+update)
- [ ] Создать `useTodoOperations` (Layer 2)
- [ ] Рефакторинг `useTodoForm` (Layer 1)
- [ ] Рефакторинг `useTodoDelete` (Layer 1 + useEffectEvent)

### Шаг 4: Components ✨

- [ ] Создать `app/todos/page.tsx` (Server)
- [ ] Создать `TodoContainer` (Client coordinator)
- [ ] Упростить `TodoForm` (только UI)
- [ ] Упростить `TodoList` (только UI)

### Шаг 5: Tests ✨

- [ ] Создать `TodoContainer.test.tsx`
- [ ] Создать `useTodoOperations.spec.ts`
- [ ] Обновить `useTodoForm.spec.ts`
- [ ] Обновить `useTodoDelete.spec.ts`
- [ ] Обновить `TodoForm.test.tsx`
- [ ] Обновить `TodoList.test.tsx`

### Шаг 6: Документация ✨

- [ ] Обновить `CLAUDE.md`
- [ ] Создать `ARCHITECTURE.md`
- [ ] Обновить Storybook stories

### Шаг 7: Проверка ✅

- [ ] Все тесты проходят (`npm test`)
- [ ] Build успешен (`npm run build`)
- [ ] Storybook работает (`npm run storybook`)
- [ ] Ручное E2E тестирование:
  - [ ] Create todo
  - [ ] Delete todo
  - [ ] Undo delete (restore)
  - [ ] Delete + wait 5 sec (no undo)
  - [ ] Refresh page (soft deleted не видны)

---

## 🎯 Для Портфолио

Этот рефакторинг показывает:

1. ✅ **React 19 Advanced** - useOptimistic, useActionState, useEffectEvent
2. ✅ **Next.js 15 Patterns** - Server/Client boundaries, Server Actions
3. ✅ **Clean Architecture** - 3-layer hook composition, SRP
4. ✅ **Database Design** - Soft delete, migrations, audit trails
5. ✅ **UX Excellence** - Optimistic updates, undo, error recovery
6. ✅ **Type Safety** - Full TypeScript, strict types
7. ✅ **Testing** - Unit + integration, high coverage
8. ✅ **Documentation** - ADRs, architecture docs

---

## 📖 Полезные ссылки

- [React 19 useOptimistic](https://react.dev/reference/react/useOptimistic)
- [React useEffectEvent RFC](https://react.dev/learn/separating-events-from-effects#declaring-an-effect-event)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Drizzle ORM Migrations](https://orm.drizzle.team/docs/migrations)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Готовы начать? Следуйте чеклисту шаг за шагом!** 🚀
