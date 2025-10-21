# React 19

## Версия в проекте
`19.1.0`

## Описание
React 19 - это последняя мажорная версия React с новыми хуками и улучшениями производительности.

## Новые хуки в React 19

### useActionState
Заменяет `useFormState` из React 18. Используется для управления состоянием форм и server actions.

**Использование в проекте** (`src/hooks/useTodoCreate.ts`):

```typescript
import { useActionState } from 'react';

const [state, formAction, isPending] = useActionState(
  async (_: FormState, formData: FormData): Promise<FormState> => {
    const raw = formData.get('description') as string;
    const parsed = formSchema.safeParse({ description: raw });

    if (!parsed.success) {
      return {
        success: false,
        issues: parsed.error.issues,
        data: { description: raw }
      };
    }

    const result = await action(parsed.data.description);
    return result.success ? initialState : { success: false, ... };
  },
  initialState
);
```

**Паттерн:**
1. Принимает async функцию (prevState, formData) => newState
2. Возвращает [state, formAction, isPending]
3. formAction передается в `<form action={formAction}>`
4. isPending показывает статус выполнения

### useOptimistic
Позволяет мгновенно обновлять UI до получения ответа от сервера.

**Использование в проекте** (`src/hooks/useOptimisticTodos.ts`):

```typescript
import { useOptimistic } from 'react';

const [optimisticTodos, updateOptimisticTodos] = useOptimistic(
  todos,
  (state, action) => {
    if (action.type === 'add') {
      return [...state, action.todo];
    }
    if (action.type === 'delete') {
      return state.filter(t => t.id !== action.id);
    }
    return state;
  }
);

// Использование:
updateOptimisticTodos({ type: 'add', todo: tempTodo });
await createTodoAction(todo);
updateOptimisticTodos({ type: 'delete', id: tempId });
```

**Паттерн:**
1. Принимает начальное состояние и reducer функцию
2. Возвращает [optimisticState, updateOptimisticFn]
3. Обновления применяются мгновенно
4. После server action отменяются временные обновления

## Ключевые концепции

### Server Components
В Next.js 15 с React 19 компоненты по умолчанию являются Server Components:

```typescript
// Server Component (по умолчанию)
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

### Client Components
Требуют директиву `'use client'`:

```typescript
'use client';
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

## Хуки, используемые в проекте

### useRef
Для доступа к DOM элементам:

```typescript
const inputRef = useRef<HTMLTextAreaElement>(null);

useEffect(() => {
  inputRef.current?.focus();
}, []);
```

### useEffect
Для side effects:

```typescript
// Keyboard shortcut: Cmd/Ctrl + K
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
```

### useState
Для локального состояния:

```typescript
const [isOpen, setIsOpen] = useState(false);
```

## Best Practices в проекте

### 1. Минимизация Client Components
- Используйте Server Components по умолчанию
- Client Components только где нужна интерактивность
- Выносите интерактивную логику в отдельные компоненты

### 2. Optimistic Updates
- Мгновенная обратная связь пользователю
- Автоматический rollback при ошибках
- Сочетание с Server Actions

### 3. Form Handling с React 19
- `useActionState` для управления формами
- Нет необходимости в `useState` для form state
- Прямая интеграция с Server Actions

### 4. Композиция хуков
Проект использует кастомные хуки для инкапсуляции логики:

```typescript
// useTodoCreate - инкапсулирует всю логику создания todo
export function useTodoCreate({ action, todos, onSuccess }) {
  const formRef = useRef(null);
  const inputRef = useRef(null);
  const [optimisticTodos, updateOptimisticTodos] = useOptimistic(todos);
  const [state, formAction, isPending] = useActionState(...);

  // Keyboard shortcuts
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

## Интеграция с Next.js

### Server Actions в формах
```typescript
'use client';
import { useActionState } from 'react';
import { createTodoAction } from '@/core/todo/actions/create-todo.action';

export function TodoForm() {
  const [state, formAction, isPending] = useActionState(
    async (_, formData) => {
      const result = await createTodoAction(formData.get('description'));
      return result;
    },
    initialState
  );

  return (
    <form action={formAction}>
      <input name="description" disabled={isPending} />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

## Новые возможности React 19

### 1. Actions
Нативная поддержка асинхронных действий в формах:

```typescript
<form action={async (formData) => {
  'use server';
  await createTodo(formData.get('title'));
}}>
  <input name="title" />
  <button type="submit">Create</button>
</form>
```

### 2. Улучшенная производительность
- Автоматический батчинг
- Улучшенный Concurrent Rendering
- Оптимизация Server Components

### 3. Ref как prop
Теперь можно передавать ref напрямую без forwardRef:

```typescript
function Input(props) {
  return <input {...props} />;
}

// Использование
<Input ref={inputRef} />
```

## Полезные ссылки

- [React 19 Documentation](https://react.dev)
- [useActionState](https://react.dev/reference/react/useActionState)
- [useOptimistic](https://react.dev/reference/react/useOptimistic)
- [Server Components](https://react.dev/reference/rsc/server-components)
- [Client Components](https://react.dev/reference/rsc/client-components)
