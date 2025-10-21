# Sonner

## Версия в проекте
`2.0.7`

## Описание
Sonner - это библиотека toast уведомлений для React.

## Использование в проекте

### Setup (layout.tsx)
```typescript
import { Toaster } from 'sonner';

<Toaster />
```

### Usage (в хуках)
```typescript
import { toast } from 'sonner';

// Success
toast.success('Task created', {
  description: 'Your task has been added',
});

// Error
toast.error('Failed to create task', {
  description: 'Please try again',
});

// Custom
toast('Event', {
  description: 'Description here',
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo'),
  },
});
```

## Пример из проекта
```typescript
// src/hooks/useTodoCreate.ts
if (!result.success) {
  toast.error('Failed to create task', {
    description: result.errors.join(', '),
  });
}

toast.success('Task created', { description: parsedDescription });
```

## Ссылки
- [Sonner Docs](https://sonner.emilkowal.ski)
