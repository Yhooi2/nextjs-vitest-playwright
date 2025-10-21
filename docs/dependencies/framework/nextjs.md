# Next.js 15

## Версия в проекте
`15.5.0`

## Описание
Next.js - это React-фреймворк для production-ready приложений с поддержкой Server-Side Rendering (SSR), Static Site Generation (SSG), и Incremental Static Regeneration (ISR).

## Ключевые возможности в проекте

### App Router
Проект использует **Next.js App Router** (новая архитектура с папкой `app/`):
- Файловая система как роутинг
- Вложенные layouts
- Server и Client Components
- Streaming и Suspense

### Server Actions
Проект активно использует **Server Actions** для мутаций данных:

```typescript
'use server';
import { revalidatePath } from 'next/cache';

export async function createTodoAction(description: string) {
  const result = await createTodoUseCase(description);
  if (result.success) revalidatePath('/');
  return result;
}
```

**Паттерн в проекте:**
- Все server actions находятся в `src/core/*/actions/`
- Помечены директивой `'use server'`
- Используют `revalidatePath()` для инвалидации кеша
- Вызываются напрямую из client components

### Server Components vs Client Components
- **Server Components** (по умолчанию) - рендерятся на сервере
- **Client Components** (`'use client'`) - интерактивные компоненты с хуками

```typescript
// Client component пример из проекта
'use client';
export function TodoForm({ action, todos }: TodoFormProps) {
  const { formAction, isPending } = useTodoCreate({ action, todos });
  return <form action={formAction}>...</form>;
}
```

## Data Fetching

### Кеширование с revalidation
```typescript
// Time-based revalidation
export const revalidate = 10; // seconds

// Tag-based revalidation
await fetch('https://api.example.com/data', {
  next: {
    tags: ['blog'],
    revalidate: 3600 // 1 hour
  }
});
```

### Программная инвалидация кеша
```typescript
import { revalidatePath, revalidateTag } from 'next/cache';

// По пути
revalidatePath('/');

// По тегу
revalidateTag('blog');
```

## Incremental Static Regeneration (ISR)

ISR позволяет обновлять контент без полного ре-деплоя:

```typescript
export const revalidate = 10; // seconds

export default async function Page() {
  const res = await fetch('https://api.vercel.app/blog');
  const posts = await res.json();
  return <ul>{posts.map(post => <li key={post.id}>{post.title}</li>)}</ul>;
}
```

## Loading States

Используйте `loading.tsx` для мгновенных состояний загрузки:

```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return <p>Loading...</p>;
}
```

## Turbopack

Проект использует **Turbopack** для быстрых сборок:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack"
  }
}
```

## Конфигурация проекта

Файл `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '**/.trunk/**': {
        loaders: [],
        as: '*.ignored',
      },
    },
  },
};
```

## Best Practices в проекте

1. **Server Actions для мутаций** - вместо API routes
2. **Минимальное использование Client Components** - только где нужна интерактивность
3. **revalidatePath** после мутаций - для инвалидации кеша
4. **Turbopack** для быстрой разработки

## Полезные ссылки

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Caching](https://nextjs.org/docs/app/building-your-application/caching)

## Примеры из Vercel Documentation

### Client-side Upload Form
```typescript
'use client';
import { upload } from '@vercel/blob/client';
import { useState } from 'react';

export default function UploadPage() {
  const [blob, setBlob] = useState(null);

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      const file = e.target.files[0];
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      setBlob(newBlob);
    }}>
      <input type="file" required />
      <button type="submit">Upload</button>
    </form>
  );
}
```

### API Route with Error Handling
```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Process request
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```
