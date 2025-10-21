# React Hook Form

## Версия в проекте
`7.65.0`

## Описание
React Hook Form - это библиотека для управления формами с минимальным ре-рендерингом и отличной производительностью.

## Важно!
В проекте **НЕ** используется React Hook Form в основной функциональности! Вместо этого используется **React 19 `useActionState`**.

## Почему не используется?

Проект следует паттерну **React 19 Server Actions** с нативными хуками:
- `useActionState` для управления состоянием форм
- `useOptimistic` для optimistic updates
- Прямая интеграция с Next.js Server Actions

## Где может использоваться?

RHF включен в зависимости (вместе с `@hookform/resolvers`), вероятно для:
- Экспериментов с альтернативными подходами
- Будущих компонентов с complex validation
- Legacy кода или примеров

## Basic Usage (если будет использоваться)

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await loginAction(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        Login
      </button>
    </form>
  );
}
```

## Текущий подход в проекте

Вместо RHF проект использует:

```typescript
import { useActionState } from 'react';

const [state, formAction, isPending] = useActionState(
  async (_, formData: FormData) => {
    const raw = formData.get('description') as string;
    const parsed = formSchema.safeParse({ description: raw });

    if (!parsed.success) {
      return { success: false, issues: parsed.error.issues };
    }

    return await action(parsed.data.description);
  },
  initialState
);
```

## Сравнение подходов

### React Hook Form
✅ Отличная производительность
✅ Богатый API
✅ Интеграция с validation libraries
❌ Дополнительная зависимость
❌ Сложнее для простых форм

### React 19 useActionState
✅ Нативный React 19
✅ Прямая интеграция с Server Actions
✅ Проще для простых форм
✅ Меньше зависимостей
❌ Меньше возможностей для complex forms

## Ссылки

- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Integration](https://react-hook-form.com/get-started#SchemaValidation)
