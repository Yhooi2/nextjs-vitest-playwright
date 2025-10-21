# План интеграции TodoForm + TodoList через TodosManager

> **Дата создания:** 2025-01-21
> **Цель:** Объединить изолированные компоненты с единым optimistic state

---

## ✅ Текущее состояние (проверено)

### Что РАБОТАЕТ:

1. **Запросы на сервер отправляются корректно:**
   - `useTodoCreate.ts:65` → `await action(parsedDescription)` ✅
   - `useTodoDelete.ts:53` → `await action(cleanId)` ✅
   - **Доказательство:** тесты `expect(action).toHaveBeenCalled()` проходят

2. **Optimistic updates для УДАЛЕНИЯ работают:**
   - `useTodoDelete:19` → создает `optimisticTodos`
   - `TodoList:22` → использует `optimisticTodos`
   - `TodoList:27` → передает в `TodoListItems`
   - **Доказательство:** тест "should hide item immediately" проходит - элемент исчезает из DOM сразу после клика

3. **Валидация и UX:**
   - Zod валидация работает
   - Тосты показываются (success/error)
   - Undo функциональность работает (5 сек delay)
   - Form reset после успешного создания

### Что НЕ РАБОТАЕТ:

1. **Optimistic updates для СОЗДАНИЯ не работают:**
   - `useTodoCreate:40` → создает `optimisticTodos`
   - `useTodoCreate:56-66` → обновляет optimistic state
   - `useTodoCreate:121` → возвращает `optimisticTodos`
   - **НО:** `TodoForm` не использует этот массив!
   - **Доказательство:**
     - `grep "optimisticTodos" src/components/TodoForm/**/*.tsx` → No files found
     - Тест "should show optimistic todo" только проверяет `toBeDisabled()`, а не отображение задачи

2. **Два независимых `useOptimisticTodos`:**
   - Один в `useTodoCreate` (не используется, висит мертвым грузом)
   - Другой в `useTodoDelete` (работает изолированно)
   - **Проблема:** после создания задачи список НЕ обновляется

3. **Storybook:**
   - Actions не логируются: используется `storybook/internal/test` вместо `@storybook/test`
   - Тосты не отображаются: нет `<Toaster />` в декораторах
   - Баг в `TodoList.stories.tsx:41`: `delayedSuccess` вместо `delayedError`

---

## 🎯 Архитектура решения

### Текущая (изолированные компоненты)

```
<TodoForm />
  └── useTodoCreate
      └── useOptimisticTodos (не используется ❌)

<TodoList />
  └── useTodoDelete
      └── useOptimisticTodos (работает изолированно ✅)
```

**Проблема:** список не знает о созданных задачах.

### Целевая (с родительским компонентом)

```
<TodosManager>
  ├── useOptimisticTodos (ЕДИНЫЙ источник истины ✅)
  ├── <TodoForm onOptimisticAdd={...} />
  └── <TodoList todos={optimisticTodos} />
```

**Решение:** единый optimistic state в родителе.

---

## 📋 Пошаговый план

## Этап 1: Фикс Storybook Actions и Toasts (30 минут)

### Задача
Сделать Actions логируемыми и тосты видимыми в Storybook.

### 1.1 Изменить импорт в моках

**Файл:** `src/core/__tests__/mocks/todo-action-story.ts`

**Строка 2:**
```diff
-import { fn } from 'storybook/internal/test';
+import { fn } from '@storybook/test';
```

**Зачем:** `@storybook/test` интегрируется с Actions addon автоматически.

### 1.2 Добавить Toaster в декораторы

**Файл:** `src/components/TodoForm/TodoForm.stories.tsx`

```typescript
import { Toaster } from 'sonner';
import { todoActionStoryMock } from '@/core/__tests__/mocks/todo-action-story';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { TodoForm } from '.';

const meta = {
  title: 'Design System/TodoForm',
  component: TodoForm,
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster richColors position="bottom-right" />
      </>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof TodoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    action: todoActionStoryMock.create.success,
    todos: [],
  },
};

export const WithError: Story = {
  args: {
    action: todoActionStoryMock.create.error,
    todos: [],
  },
};
```

**Файл:** `src/components/TodoList/TodoList.stories.tsx`

```typescript
import { Toaster } from 'sonner';
import { todoActionStoryMock } from '@/core/__tests__/mocks/todo-action-story';
import { mockTodos } from '@/core/__tests__/mocks/todos';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { TodoList } from '.';

const meta = {
  title: 'Design System/TodoList',
  component: TodoList,
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster richColors position="bottom-right" />
      </>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    todos: { control: false },
  },
} satisfies Meta<typeof TodoList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    todos: mockTodos,
    action: todoActionStoryMock.delete.success,
  },
};

export const WhithError: Story = {
  args: {
    todos: mockTodos,
    action: todoActionStoryMock.delete.error,
  },
};

export const WhithDelay: Story = {
  args: {
    todos: mockTodos,
    action: todoActionStoryMock.delete.delayedSuccess,
  },
};

export const WhithDelayError: Story = {
  args: {
    todos: mockTodos,
    action: todoActionStoryMock.delete.delayedError, // ← ИСПРАВЛЕНО
  },
};

export const Empty: Story = {
  args: {
    todos: [],
    action: todoActionStoryMock.delete.success,
  },
};
```

### 1.3 Проверка

```bash
npm run storybook
```

**Открыть в браузере:**

1. **TodoForm → Default:**
   - Ввести "Test task" и нажать "Create task"
   - ✅ Тост "Task created" появился
   - ✅ В панели **Actions** (внизу): вызов функции логируется
   - ✅ Можно кликнуть на вызов и увидеть аргументы

2. **TodoList → Default:**
   - Нажать "Close" на любой задаче
   - ✅ Задача исчезла оптимистически
   - ✅ Тост "Task deleted" с кнопкой "Undo"
   - ✅ В панели **Actions**: вызов delete логируется
   - ✅ Через ~5 секунд тост исчезает

3. **TodoList → Empty:**
   - ✅ Показывается "No tasks found"

---

## Этап 2: Дополнить тесты (1-2 часа)

### Задача
Проверить edge cases и undo функциональность.

### 2.1 Завершить TODO-тесты в TodoList

**Файл:** `src/components/TodoList/TodoList.test.tsx`

Добавить после строки 62 (после `test('should disable the list buttons...')`):

```typescript
  test('should notify user on delete error', async () => {
    const { todos } = renderList({ success: false });
    vi.useFakeTimers();

    const items = screen.getAllByRole('listitem');

    // Удалить первую задачу
    await user.click(within(items[0]).getByRole('button'));

    // Задача исчезает оптимистически
    expect(items[0]).not.toBeInTheDocument();

    // Ждем DELETE_DELAY (5сек)
    await vi.advanceTimersByTimeAsync(5100);

    // Проверяем error toast
    expect(await screen.findByText('Failed to delete task')).toBeInTheDocument();
    expect(await screen.findByText('Error deleting todo')).toBeInTheDocument();

    // Задача должна восстановиться в списке
    await waitFor(() => {
      expect(screen.getByText(todos[0].description)).toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  test('should not call action for invalid ID', async () => {
    const invalidTodos = [
      { id: '', description: 'Empty ID', createdAt: '2024-01-01' },
      { id: '   ', description: 'Whitespace ID', createdAt: '2024-01-02' },
    ];
    const { action } = renderList({ todos: invalidTodos });
    vi.useFakeTimers();

    const items = screen.getAllByRole('listitem');

    // Попытаться удалить обе задачи
    await user.click(within(items[0]).getByRole('button'));
    await user.click(within(items[1]).getByRole('button'));

    // Ждем таймер
    await vi.advanceTimersByTimeAsync(5100);

    // Action НЕ должен был вызваться (sanitizeStr вернет пустую строку)
    expect(action).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
```

### 2.2 Добавить тесты для Undo

Добавить в конец `describe('<TodoList />')`:

```typescript
  describe('Undo functionality', () => {
    test('should restore task when Undo clicked', async () => {
      const { todos } = renderList();
      vi.useFakeTimers();

      const items = screen.getAllByRole('listitem');
      const firstTodo = todos[0];

      // Удалить первую задачу
      await user.click(within(items[0]).getByRole('button'));

      // Задача исчезла
      expect(items[0]).not.toBeInTheDocument();

      // Найти кнопку Undo в тосте
      const undoButton = await screen.findByRole('button', { name: /undo/i });
      await user.click(undoButton);

      // Задача восстановилась
      await waitFor(() => {
        expect(screen.getByText(firstTodo.description)).toBeInTheDocument();
      });

      // Проверить тост "Action cancelled"
      expect(await screen.findByText('Action cancelled')).toBeInTheDocument();

      vi.useRealTimers();
    });

    test('should not call delete action after Undo', async () => {
      const { action } = renderList();
      vi.useFakeTimers();

      const items = screen.getAllByRole('listitem');

      // Удалить задачу
      await user.click(within(items[0]).getByRole('button'));

      // Нажать Undo
      const undoButton = await screen.findByRole('button', { name: /undo/i });
      await user.click(undoButton);

      // Подождать больше DELETE_DELAY
      await vi.advanceTimersByTimeAsync(6000);

      // Action НЕ должен был вызваться
      expect(action).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });
```

### 2.3 Проверка

```bash
npm run test:cov
```

**Ожидаемый результат:**
```
✅ Test Files: 13 passed (13)
✅ Tests: 121 passed (121)  # было 117, стало +4
✅ Coverage: > 85%
```

---

## Этап 3: Создание TodosManager (2-3 часа)

### 3.1 Изменить useTodoCreate - добавить callback

**Файл:** `src/hooks/useTodoCreate.ts`

**Обновить тип:**
```typescript
export type UseTodoCreateProps = {
  action: CreateTodoAction;
  todos: Todo[];
  onSuccess?: (description: string) => void;
  onOptimisticAdd?: (tempTodo: Todo) => void; // ← НОВОЕ
};
```

**Обновить функцию:**
```typescript
export function useTodoCreate({
  action,
  todos,
  onSuccess,
  onOptimisticAdd, // ← НОВОЕ
}: UseTodoCreateProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [optimisticTodos, updateOptimisticTodos] = useOptimisticTodos(todos);

  const [state, formAction, isPending] = useActionState(
    async (_: FormState, formData: FormData): Promise<FormState> => {
      const raw = formData.get('description') as string;
      const parsed = formSchema.safeParse({ description: raw });

      if (!parsed.success) {
        return {
          success: false,
          issues: parsed.error.issues,
          data: { description: raw },
        };
      }

      const parsedDescription = parsed.data.description;
      const tempId = `temp-${Date.now()}`;
      const tempTodo = {
        id: tempId,
        description: parsedDescription,
        createdAt: new Date().toISOString(),
      };

      // Обновить локальный optimistic state
      updateOptimisticTodos({ type: 'add', todo: tempTodo });

      // ✅ НОВОЕ: Уведомить родителя
      onOptimisticAdd?.(tempTodo);

      const result = await action(parsedDescription);

      // Удалить временную задачу из локального state
      updateOptimisticTodos({ type: 'delete', id: tempId });

      if (!result.success) {
        toast.error('Failed to create task', {
          description: result.errors.join(', '),
        });
        return {
          success: false,
          issues: result.errors.map((err) => ({
            code: 'custom' as const,
            path: ['description'],
            message: err,
          })),
          data: { description: raw },
        };
      }

      toast.success('Task created', { description: parsedDescription });
      onSuccess?.(parsedDescription);
      formRef.current?.reset();

      return initialState;
    },
    initialState
  );

  // ... useEffect для автофокуса и keyboard shortcuts ...

  return {
    formRef,
    inputRef,
    formAction,
    isPending,
    issues: state.issues,
    description: state.data.description,
    optimisticTodos, // ← оставляем для совместимости
  };
}
```

### 3.2 Обновить TodoForm

**Файл:** `src/components/TodoForm/index.tsx`

```typescript
'use client';

import { CreateTodoAction } from '@/core/todo/actions/todo.action.types';
import { Todo } from '@/core/todo/schemas/todo.contract';
import { useTodoCreate } from '@/hooks/useTodoCreate';
import { TaskInput } from '../TaskInput';

export type TodoFormProps = {
  action: CreateTodoAction;
  todos: Todo[];
  onSuccess?: (description: string) => void;
  onOptimisticAdd?: (tempTodo: Todo) => void; // ← НОВОЕ
};

export function TodoForm({ action, todos, onSuccess, onOptimisticAdd }: TodoFormProps) {
  const { formRef, inputRef, formAction, isPending, description, issues } = useTodoCreate({
    action,
    todos,
    onSuccess,
    onOptimisticAdd, // ← ПЕРЕДАЕМ В ХУК
  });

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

### 3.3 Создать TodosManager

**Создать файл:** `src/components/TodosManager/index.tsx`

```typescript
'use client';

import { CreateTodoAction, DeleteTodoAction } from '@/core/todo/actions/todo.action.types';
import { Todo } from '@/core/todo/schemas/todo.contract';
import { useOptimisticTodos } from '@/hooks/useOptimisticTodos';
import { useCallback } from 'react';
import { TodoForm } from '../TodoForm';
import { TodoList } from '../TodoList';

export type TodosManagerProps = {
  initialTodos: Todo[];
  createAction: CreateTodoAction;
  deleteAction: DeleteTodoAction;
};

export function TodosManager({ initialTodos, createAction, deleteAction }: TodosManagerProps) {
  const [optimisticTodos, updateOptimistic] = useOptimisticTodos(initialTodos);

  const handleOptimisticAdd = useCallback(
    (tempTodo: Todo) => {
      updateOptimistic({ type: 'add', todo: tempTodo });
    },
    [updateOptimistic]
  );

  return (
    <div className="flex flex-col gap-8 w-full max-w-xl mx-auto">
      <TodoForm
        action={createAction}
        todos={initialTodos}
        onOptimisticAdd={handleOptimisticAdd}
      />
      <TodoList todos={optimisticTodos} action={deleteAction} />
    </div>
  );
}
```

### 3.4 Data Flow

```
User вводит текст → нажимает "Create task"
  ↓
TodoForm: useTodoCreate вызывает formAction
  ↓
formAction: создает tempTodo = { id: 'temp-123', description, ... }
  ↓
formAction: вызывает onOptimisticAdd?.(tempTodo)
  ↓
TodosManager: handleOptimisticAdd → updateOptimistic({ type: 'add', todo: tempTodo })
  ↓
TodosManager: optimisticTodos обновляется → включает tempTodo
  ↓
TodoList: получает новый optimisticTodos prop
  ↓
TodoList: отображает tempTodo МГНОВЕННО
  ↓
formAction: await action(description) → запрос на сервер
  ↓
Server: создает реальную задачу с реальным ID
  ↓
Server action: revalidatePath('/') → Next.js обновляет initialTodos
  ↓
TodosManager: получает новый initialTodos через prop
  ↓
TodoList: tempTodo заменяется реальной задачей
```

### 3.5 Создать тесты для TodosManager

**Создать файл:** `src/components/TodosManager/TodosManager.test.tsx`

```typescript
import { mockTodos } from '@/core/__tests__/mocks/todos';
import { TodoPresenter } from '@/core/todo/schemas/todo.contract';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toaster } from 'sonner';
import { TodosManager } from '.';

const user = userEvent.setup();

describe('<TodosManager /> integration', () => {
  test('should add task to list immediately after form submission', async () => {
    const { input, submitButton } = renderManager();

    await user.type(input, 'New task');
    await user.click(submitButton);

    // Задача должна появиться в списке МГНОВЕННО
    expect(await screen.findByText('New task')).toBeInTheDocument();
  });

  test('should show temporary task then replace with real one', async () => {
    const { input, submitButton } = renderManager({ delay: 500 });

    await user.type(input, 'Temp task');
    await user.click(submitButton);

    // Временная задача появилась
    expect(await screen.findByText('Temp task')).toBeInTheDocument();

    // После ответа сервера задача все еще там (но с реальным ID)
    await waitFor(
      () => {
        expect(screen.getByText('Temp task')).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  test('should allow deleting a newly created task', async () => {
    const { input, submitButton } = renderManager();

    // Создать задачу
    await user.type(input, 'Task to delete');
    await user.click(submitButton);

    const newTask = await screen.findByText('Task to delete');
    expect(newTask).toBeInTheDocument();

    // Найти кнопку "Close" для этой задачи
    const listitem = newTask.closest('[role="listitem"]');
    const closeButton = within(listitem!).getByRole('button', { name: /delete/i });

    // Удалить
    await user.click(closeButton);

    // Задача исчезла
    expect(newTask).not.toBeInTheDocument();
  });
});

type RenderManagerProps = {
  delay?: number;
  success?: boolean;
};

function renderManager({ delay = 0, success = true }: RenderManagerProps = {}) {
  const createResult: TodoPresenter = success
    ? {
        success: true,
        todo: { id: crypto.randomUUID(), description: 'created', createdAt: new Date().toISOString() },
      }
    : { success: false, errors: ['Error creating todo'] };

  const deleteResult: TodoPresenter = success
    ? {
        success: true,
        todo: { id: 'deleted', description: 'deleted', createdAt: new Date().toISOString() },
      }
    : { success: false, errors: ['Error deleting todo'] };

  const createActionNoDelay = vi.fn().mockResolvedValue(createResult);
  const createActionDelay = vi
    .fn()
    .mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(createResult), delay)));

  const createAction = delay > 0 ? createActionDelay : createActionNoDelay;
  const deleteAction = vi.fn().mockResolvedValue(deleteResult);

  render(
    <>
      <TodosManager initialTodos={mockTodos} createAction={createAction} deleteAction={deleteAction} />
      <Toaster />
    </>
  );

  const input = screen.getByRole('textbox', { name: /new task/i });
  const submitButton = screen.getByRole('button', { name: /create task/i });

  return { input, submitButton, createAction, deleteAction };
}
```

### 3.6 Создать stories для TodosManager

**Создать файл:** `src/components/TodosManager/TodosManager.stories.tsx`

```typescript
import { todoActionStoryMock } from '@/core/__tests__/mocks/todo-action-story';
import { mockTodos } from '@/core/__tests__/mocks/todos';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { Toaster } from 'sonner';
import { TodosManager } from '.';

const meta = {
  title: 'Features/TodosManager',
  component: TodosManager,
  decorators: [
    (Story) => (
      <div className="p-8 min-h-screen">
        <h1 className="text-3xl font-bold mb-8">My Tasks</h1>
        <Story />
        <Toaster richColors position="bottom-right" />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TodosManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialTodos: mockTodos,
    createAction: todoActionStoryMock.create.success,
    deleteAction: todoActionStoryMock.delete.success,
  },
};

export const Empty: Story = {
  args: {
    initialTodos: [],
    createAction: todoActionStoryMock.create.success,
    deleteAction: todoActionStoryMock.delete.success,
  },
};

export const WithErrors: Story = {
  args: {
    initialTodos: mockTodos,
    createAction: todoActionStoryMock.create.error,
    deleteAction: todoActionStoryMock.delete.error,
  },
};
```

### 3.7 Проверка

```bash
# Тесты
npm test

# Storybook
npm run storybook
```

**В Storybook:**
1. Открыть "Features/TodosManager → Default"
2. Ввести "Test task" и нажать "Create task"
3. ✅ Задача появилась в списке МГНОВЕННО
4. ✅ Можно сразу удалить эту задачу
5. ✅ Actions логируются
6. ✅ Тосты работают

---

## Этап 4: Интеграция в app/page.tsx (15 минут)

**Файл:** `app/page.tsx`

```typescript
import { TodosManager } from '@/components/TodosManager';
import { createTodoAction } from '@/core/todo/actions/create-todo.action';
import { deleteTodoAction } from '@/core/todo/actions/delete-todo-action';
import { getTodos } from '@/core/todo/usecases/get-todos.usecase';

export default async function Home() {
  const todos = await getTodos();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Tasks</h1>
      <TodosManager
        initialTodos={todos}
        createAction={createTodoAction}
        deleteAction={deleteTodoAction}
      />
    </main>
  );
}
```

---

## Чеклист выполнения

### Этап 1: Storybook (30 мин)
- [ ] Изменить импорт на `@storybook/test` в todo-action-story.ts
- [ ] Добавить `<Toaster />` в TodoForm.stories.tsx
- [ ] Добавить `<Toaster />` в TodoList.stories.tsx
- [ ] Исправить баг `delayedSuccess` → `delayedError` в TodoList
- [ ] Добавить Empty story в TodoList
- [ ] Запустить `npm run storybook`
- [ ] Проверить Actions panel - вызовы логируются
- [ ] Проверить тосты отображаются

### Этап 2: Тесты (1-2 часа)
- [ ] Добавить тест "should notify user on delete error"
- [ ] Добавить тест "should not call action for invalid ID"
- [ ] Добавить тест "should restore task when Undo clicked"
- [ ] Добавить тест "should not call delete action after Undo"
- [ ] Запустить `npm run test:cov`
- [ ] Coverage > 85%

### Этап 3: TodosManager (2-3 часа)
- [ ] Добавить `onOptimisticAdd` в `UseTodoCreateProps`
- [ ] Обновить `useTodoCreate` - вызывать callback
- [ ] Обновить `TodoForm` - передавать `onOptimisticAdd`
- [ ] Создать компонент `TodosManager`
- [ ] Создать тесты `TodosManager.test.tsx`
- [ ] Создать stories `TodosManager.stories.tsx`
- [ ] Запустить тесты - все проходят
- [ ] Проверить в Storybook - optimistic updates работают

### Этап 4: Интеграция (15 мин)
- [ ] Обновить `app/page.tsx`
- [ ] Запустить `npm run dev`
- [ ] Проверить в браузере:
  - [ ] Создание задачи → появляется сразу
  - [ ] Удаление задачи → исчезает сразу
  - [ ] Undo работает
  - [ ] Keyboard shortcuts (⌘K) работают

---

## Важные замечания

### ⚠️ НЕ УДАЛЯТЬ:
- `useOptimisticTodos` в `useTodoCreate` - используется локально для формы
- `useOptimisticTodos` в `useTodoDelete` - используется для списка
- `optimisticTodos` в возвращаемом значении `useTodoCreate` - для обратной совместимости

### ✅ Что будет работать после интеграции:
1. **Создание задачи:**
   - Форма → callback родителя → обновление общего state → список обновляется сразу
2. **Удаление задачи:**
   - Список → локальный optimistic state → задача исчезает сразу
3. **Синхронизация:**
   - Оба компонента используют один источник истины (optimisticTodos из TodosManager)

### 🎯 Архитектурные решения:
- **useTodoCreate** сохраняет локальный optimistic state для показа loading состояний
- **useTodoDelete** сохраняет свой optimistic state для undo функциональности
- **TodosManager** управляет общим списком для синхронизации между компонентами

---

## Следующие шаги (после завершения)

1. **E2E тесты** (требует настройки Playwright)
2. **Дополнительные фичи:**
   - Фильтры (All / Active / Completed)
   - Поиск
   - Сортировка
   - Bulk operations (Delete all completed)
3. **Оптимизация:**
   - Виртуализация для больших списков
   - Debounce для поиска
   - Мемоизация компонентов

---

## Полезные команды

```bash
# Разработка
npm run dev                # Dev server
npm run storybook          # Storybook

# Тестирование
npm test                   # Все тесты
npm run test:watch         # Watch mode
npm run test:cov           # Coverage

# Качество кода
npm run lint               # ESLint
npm run format             # Prettier
npm run format:check       # Check formatting
```

---

## Вопросы для самопроверки

После каждого этапа:
1. ✅ Все тесты проходят?
2. ✅ Actions логируются в Storybook?
3. ✅ Тосты отображаются?
4. ✅ Optimistic updates работают?
5. ✅ Код читаемый и понятный?

---

## Когда обращаться за помощью

- Тесты не проходят и непонятно почему
- TypeScript ошибки
- Optimistic updates работают неправильно
- Нужен code review перед коммитом
- Непонятно, как реализовать какой-то тест

**Удачи!** 🚀
