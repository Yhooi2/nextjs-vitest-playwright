# shadcn/ui

## Версия в проекте
`shadcn` CLI: `3.4.2` (devDependency)

## Описание
shadcn/ui - это **коллекция красиво оформленных, доступных UI компонентов**, которая работает как платформа для распространения кода. Это **не npm библиотека** - компоненты копируются напрямую в ваш проект, что дает полный контроль над кодом.

## Ключевые особенности

### Не библиотека, а система
- Компоненты копируются в `src/components/ui/`
- Полный контроль над кодом компонентов
- Можно модифицировать под свои нужды
- Нет зависимости от версий npm пакета

### Технологический стек
- **React** - основа компонентов
- **Radix UI** - headless primitives (доступность из коробки)
- **Tailwind CSS** - стилизация
- **class-variance-authority** - управление вариантами
- **TypeScript** - типизация

## Установка компонентов

### CLI команды

Установка shadcn CLI (уже установлен в проекте):
```bash
npm install -D shadcn
```

Добавление компонента:
```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add form
```

### Что происходит при добавлении:
1. Скачивается код компонента в `src/components/ui/`
2. Устанавливаются необходимые зависимости (например, `@radix-ui/react-*`)
3. Компонент готов к использованию и модификации

## Компоненты в проекте

Проект использует следующие компоненты shadcn/ui:

### Button
```typescript
import { Button } from "@/components/ui/button"

export default function Example() {
  return <Button>Click me</Button>
}
```

**Варианты:**
- `default` - основная кнопка
- `destructive` - для удаления
- `outline` - обводка
- `ghost` - без фона
- `link` - как ссылка

**Размеры:** `default`, `sm`, `lg`, `icon`

### Input
```typescript
import { Input } from "@/components/ui/input"

<Input type="email" placeholder="Email" />
```

### Form Components
shadcn/ui предоставляет компоненты для работы с формами, но проект использует **React 19 native подход** с `useActionState` вместо React Hook Form.

## Интеграция с Tailwind CSS v4

shadcn/ui отлично работает с Tailwind CSS v4:

```css
/* src/app/globals.css */
@import 'tailwindcss';

@theme {
  --color-primary: oklch(0.7 0.2 200);
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.15 0 0);
}

@custom-variant dark (&:where([data-mode="dark"], [data-mode="dark"] *));
```

Компоненты shadcn/ui автоматически поддерживают dark mode через CSS переменные.

## Dark Mode

### Настройка через data-attribute

Проект использует `data-mode` для dark mode:

```html
<html data-mode="dark">
  <!-- content -->
</html>
```

### Компоненты с dark mode

```typescript
<div className="bg-background text-foreground">
  <Button className="bg-primary dark:bg-primary-dark">
    Click me
  </Button>
</div>
```

## Паттерн Slot (asChild)

shadcn/ui компоненты используют `@radix-ui/react-slot` для полиморфизма:

```typescript
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Button рендерится как Link
<Button asChild>
  <Link href="/login">Login</Link>
</Button>
```

## Интеграция с React 19

### Формы с useActionState

```typescript
'use client'

import { useActionState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createTodoAction } from '@/app/actions'

export function TodoForm() {
  const [state, formAction, isPending] = useActionState(
    createTodoAction,
    { success: true }
  )

  return (
    <form action={formAction}>
      <Input
        name="description"
        disabled={isPending}
        placeholder="Add a todo..."
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Adding...' : 'Add'}
      </Button>
    </form>
  )
}
```

## Кастомизация компонентов

Поскольку компоненты находятся в вашем проекте, вы можете их модифицировать:

```typescript
// src/components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        // Добавьте свой вариант
        success: "bg-green-500 text-white hover:bg-green-600",
      },
    },
  }
)
```

## Best Practices

### 1. Используйте CLI для добавления
```bash
npx shadcn@latest add <component>
```
Это гарантирует правильную структуру и зависимости.

### 2. Модифицируйте после добавления
Компоненты можно и нужно адаптировать под проект:
- Измените цвета
- Добавьте новые варианты
- Оптимизируйте под свои нужды

### 3. Используйте cn() helper
```typescript
import { cn } from "@/lib/utils"

<Button className={cn("custom-class", isPrimary && "bg-blue-500")}>
  Click me
</Button>
```

### 4. Комбинируйте с Server Actions
```typescript
<form action={serverAction}>
  <Input name="email" />
  <Button type="submit">Submit</Button>
</form>
```

## Компоненты, которые стоит добавить

Рекомендуемые компоненты для типичного проекта:

**Базовые:**
- `button` - кнопки
- `input` - поля ввода
- `label` - метки
- `form` - формы (если используете RHF)

**Feedback:**
- `toast` / `sonner` - уведомления (проект использует sonner)
- `alert` - оповещения
- `badge` - бейджи

**Layout:**
- `card` - карточки
- `separator` - разделители
- `dialog` - модальные окна
- `sheet` - боковые панели

**Navigation:**
- `dropdown-menu` - выпадающие меню
- `tabs` - вкладки
- `breadcrumb` - хлебные крошки

## Архитектура компонентов

shadcn/ui следует паттерну "композиция поверх конфигурации":

```typescript
// Плохо - слишком много пропсов
<Button color="blue" size="large" rounded={true} />

// Хорошо - композиция с классами
<Button className="bg-blue-500 text-lg rounded-full">
  Click me
</Button>
```

## Troubleshooting

### Компонент не найден
```bash
# Убедитесь, что компонент добавлен
npx shadcn@latest add button
```

### Конфликты стилей
```typescript
// Используйте cn() для правильного мержинга классов
import { cn } from "@/lib/utils"

<Button className={cn("base-class", conditionalClass)}>
```

### TypeScript ошибки
```bash
# Проверьте, что установлены все типы
npm install -D @types/react @types/react-dom
```

## Ссылки

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Component List](https://ui.shadcn.com/docs/components)
- [Theming Guide](https://ui.shadcn.com/docs/theming)
- [Dark Mode](https://ui.shadcn.com/docs/dark-mode)
- [Radix UI](https://www.radix-ui.com) - primitives
- [Tailwind CSS](https://tailwindcss.com) - styling

## Примеры из проекта

### TodoForm с shadcn/ui компонентами
```typescript
'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTodoCreate } from "@/hooks/useTodoCreate"

export function TodoForm({ action, todos }) {
  const { formRef, inputRef, formAction, isPending } = useTodoCreate({
    action,
    todos,
  })

  return (
    <form ref={formRef} action={formAction}>
      <Input
        ref={inputRef}
        name="description"
        placeholder="What needs to be done?"
        disabled={isPending}
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Adding...' : 'Add Todo'}
      </Button>
    </form>
  )
}
```

### Использование с Radix UI primitives
```typescript
import { Separator } from "@/components/ui/separator"

<div>
  <h2>Section 1</h2>
  <Separator />
  <h2>Section 2</h2>
</div>
```
