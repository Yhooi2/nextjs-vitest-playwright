# Radix UI

## Версии в проекте
- `@radix-ui/react-label` - 2.1.7
- `@radix-ui/react-separator` - 1.1.7
- `@radix-ui/react-slot` - 1.2.3

## Описание
Radix UI - это **библиотека unstyled, accessible компонентов** для React. Это **headless UI primitives**, которые обеспечивают функциональность и доступность, оставляя стилизацию на ваше усмотрение.

## Ключевые особенности

### Unstyled (Headless)
- Компоненты **без встроенных стилей**
- Полный контроль над внешним видом
- Используются с Tailwind CSS, CSS-in-JS, или любым другим решением

### Accessibility First
- WAI-ARIA compliant
- Поддержка клавиатурной навигации
- Screen reader support
- Focus management

### Composition
- Компоненты композируются из примитивов
- Гибкая архитектура
- API, основанное на композиции

## Использование в проекте

Radix UI используется как **основа для shadcn/ui компонентов**. Все компоненты shadcn/ui построены поверх Radix UI primitives.

### Slot Pattern

`@radix-ui/react-slot` для полиморфных компонентов:

```typescript
import { Slot } from '@radix-ui/react-slot'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp ref={ref} {...props} />
  }
)
Button.displayName = 'Button'
```

**Использование:**
```typescript
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Button рендерится как button
<Button>Click me</Button>

// Button рендерится как Link (slot pattern)
<Button asChild>
  <Link href="/dashboard">Dashboard</Link>
</Button>

// Результат: <a href="/dashboard" class="...button-classes">Dashboard</a>
```

**Зачем это нужно:**
- Semantic HTML (ссылка остается ссылкой, кнопка - кнопкой)
- Сохранение стилей Button
- Правильная доступность
- Type safety

### Label

Доступные метки для form fields с автоматической связкой:

```typescript
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

<div>
  <Label htmlFor="email">Email address</Label>
  <Input id="email" type="email" placeholder="Email" />
</div>
```

**Под капотом** (Radix UI):
```typescript
import * as LabelPrimitive from '@radix-ui/react-label'

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn("text-sm font-medium", className)}
    {...props}
  />
))
```

**Что дает Radix Label:**
- Правильная связка через `htmlFor`
- Клик по label фокусирует input
- Screen reader support
- Keyboard navigation

### Separator

Семантические разделители с правильной доступностью:

```typescript
import { Separator } from '@/components/ui/separator'

<div>
  <div>Section 1</div>
  <Separator />
  <div>Section 2</div>
</div>
```

**Под капотом** (Radix UI):
```typescript
import * as SeparatorPrimitive from '@radix-ui/react-separator'

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
```

**Props:**
- `orientation`: `"horizontal"` | `"vertical"`
- `decorative`: если `true`, скрыт от screen readers
- `className`: custom styles

## Другие Radix UI компоненты в shadcn/ui

Хотя в проекте напрямую установлены только 3 Radix пакета, shadcn/ui компоненты могут использовать больше:

### Dialog / Modal
```bash
npx shadcn@latest add dialog
```

Устанавливает `@radix-ui/react-dialog`:
```typescript
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <h2>Dialog Title</h2>
    <p>Dialog content here</p>
  </DialogContent>
</Dialog>
```

### Dropdown Menu
```bash
npx shadcn@latest add dropdown-menu
```

Устанавливает `@radix-ui/react-dropdown-menu`:
```typescript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Другие доступные компоненты
- **Accordion** - `@radix-ui/react-accordion`
- **Alert Dialog** - `@radix-ui/react-alert-dialog`
- **Checkbox** - `@radix-ui/react-checkbox`
- **Radio Group** - `@radix-ui/react-radio-group`
- **Select** - `@radix-ui/react-select`
- **Switch** - `@radix-ui/react-switch`
- **Tabs** - `@radix-ui/react-tabs`
- **Toast** - `@radix-ui/react-toast`
- **Tooltip** - `@radix-ui/react-tooltip`

## Архитектура Radix UI

### Композиция примитивов

Radix компоненты состоят из примитивов:

```typescript
// Dialog состоит из:
<Dialog>              {/* Root - контейнер */}
  <DialogTrigger>     {/* Trigger - кнопка открытия */}
  <DialogPortal>      {/* Portal - рендер в body */}
    <DialogOverlay>   {/* Overlay - фон */}
    <DialogContent>   {/* Content - контент */}
      <DialogTitle>   {/* Title - заголовок */}
      <DialogDescription> {/* Description */}
      <DialogClose>   {/* Close - кнопка закрытия */}
```

### Управляемое vs Неуправляемое

Radix поддерживает оба режима:

```typescript
// Неуправляемое (Radix контролирует состояние)
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>Content</DialogContent>
</Dialog>

// Управляемое (вы контролируете состояние)
const [open, setOpen] = useState(false)

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>Content</DialogContent>
</Dialog>
```

## Best Practices

### 1. Используйте Slot для полиморфизма
```typescript
<Button asChild>
  <a href="https://example.com">External Link</a>
</Button>
```

### 2. Правильная связка Label + Input
```typescript
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

### 3. Используйте shadcn/ui CLI
```bash
npx shadcn@latest add <component>
```
Это автоматически установит нужные Radix зависимости.

### 4. Кастомизация через className
```typescript
<Separator className="my-8 bg-gray-300" />
```

## Доступность (a11y)

Radix UI из коробки обеспечивает:

### Keyboard Navigation
- `Tab` / `Shift+Tab` - навигация
- `Enter` / `Space` - активация
- `Escape` - закрытие модалов
- `Arrow keys` - навигация в меню

### ARIA Attributes
```html
<!-- Dialog автоматически добавляет -->
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Title</h2>
  <p id="dialog-description">Description</p>
</div>
```

### Focus Management
- Автоматический focus trap в модалах
- Возврат фокуса после закрытия
- Focus visible indicators

## Интеграция с React 19

Radix UI полностью совместим с React 19:

```typescript
'use client' // Radix компоненты требуют client-side

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useActionState } from 'react'

export function FormDialog({ action }) {
  const [state, formAction, isPending] = useActionState(action, initialState)

  return (
    <Dialog>
      <DialogContent>
        <form action={formAction}>
          <Input disabled={isPending} />
          <Button type="submit">Submit</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

## Ссылки

- [Radix UI Docs](https://www.radix-ui.com)
- [Radix Primitives](https://www.radix-ui.com/primitives)
- [Radix Themes](https://www.radix-ui.com/themes)
- [shadcn/ui](https://ui.shadcn.com) - компоненты на Radix
- [Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)
