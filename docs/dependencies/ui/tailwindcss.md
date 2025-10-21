# Tailwind CSS v4

## Версия в проекте
`4.x` (установлен через `@tailwindcss/postcss`)

## Описание
Tailwind CSS v4 - это **utility-first CSS фреймворк** с **новым Rust-based engine**, который приносит кардинальные изменения в конфигурацию и производительность.

## Ключевые изменения в v4

### 1. CSS-First Configuration
**Больше нет `tailwind.config.js`!** Вся конфигурация теперь в CSS через директиву `@theme`.

### 2. Встроенный PostCSS
Не нужен `postcss-import` - всё встроено в `@tailwindcss/postcss`.

### 3. Новый Engine
Переписан на Rust для невероятной скорости компиляции.

## Конфигурация проекта

### PostCSS Setup

`postcss.config.mjs`:
```javascript
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
```

**Важно:** Используется `@tailwindcss/postcss` вместо классического `tailwindcss` + `autoprefixer`.

### globals.css

`src/app/globals.css`:
```css
@import 'tailwindcss';
@import 'tw-animate-css';

@theme inline {
  --color-primary: var(--primary);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-border: var(--border);
  /* ... другие CSS переменные */
}

/* Custom dark mode variant */
@custom-variant dark (&:where([data-mode="dark"], [data-mode="dark"] *));

/* Specify source files for Tailwind */
@source "./app/**/*.{js,ts,jsx,tsx}";

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground font-sans;
  }
}
```

### Ключевые директивы v4

#### @import
```css
@import 'tailwindcss';
```
Импортирует Tailwind CSS напрямую - больше не нужны `@tailwind base/components/utilities`.

#### @theme
```css
@theme {
  --color-primary: oklch(0.7 0.2 200);
  --font-sans: 'Inter', sans-serif;
  --breakpoint-3xl: 1920px;
}
```
Определяет кастомные значения темы (цвета, шрифты, breakpoints).

#### @theme inline
```css
@theme inline {
  --color-primary: var(--primary);
}
```
Использует существующие CSS переменные для темы.

#### @custom-variant
```css
@custom-variant dark (&:where([data-mode="dark"], [data-mode="dark"] *));
```
Создает кастомные варианты (вместо конфигурации в JS).

#### @source
```css
@source "./app/**/*.{js,ts,jsx,tsx}";
```
Указывает, где Tailwind должен искать классы.

#### @utility
```css
@utility tab-* {
  tab-size: *;
}
```
Создает функциональные утилиты.

## Dark Mode

### Кастомный Dark Mode через data-attribute

Проект использует `data-mode` атрибут вместо стандартного `.dark` класса:

```css
@custom-variant dark (&:where([data-mode="dark"], [data-mode="dark"] *));
```

### HTML Setup
```html
<html data-mode="dark">
  <body>
    <div className="bg-white dark:bg-black">
      <!-- content -->
    </div>
  </body>
</html>
```

### Использование
```tsx
<div className="bg-background dark:bg-background-dark">
  <h1 className="text-foreground dark:text-foreground-dark">
    Hello World
  </h1>
</div>
```

### next-themes Integration
```typescript
'use client'

import { ThemeProvider } from 'next-themes'

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="data-mode" defaultTheme="system">
      {children}
    </ThemeProvider>
  )
}
```

## OKLCH Color Space

Tailwind CSS v4 использует современное цветовое пространство OKLCH:

```css
@theme {
  --color-primary: oklch(0.7 0.2 200);
  /* L (lightness), C (chroma), H (hue) */
}
```

**Преимущества OKLCH:**
- Перцептивно-равномерное цветовое пространство
- Лучше для accessibility
- Более предсказуемые переходы цветов

## CSS Variables как Theme

В проекте используется паттерн с CSS переменными:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
}

[data-mode="dark"] {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 9%;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
```

Теперь можно использовать:
```html
<div className="bg-background text-foreground">
```

## Утилиты в проекте

### cn() Helper Function

`src/lib/utils.ts`:
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Использование:**
```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  "base-class",
  isPrimary && "bg-primary",
  "hover:opacity-80"
)}>
```

**Зачем нужен:**
- `clsx` - условные классы
- `twMerge` - правильное объединение Tailwind классов (последний класс перезаписывает конфликты)

### Example: Conditional Styling
```typescript
<Button
  className={cn(
    "font-medium",
    variant === "primary" && "bg-blue-500",
    variant === "secondary" && "bg-gray-500",
    size === "lg" && "px-6 py-3",
    size === "sm" && "px-2 py-1"
  )}
>
  Click me
</Button>
```

## Breakpoints

Tailwind v4 использует те же breakpoints:

```css
@theme {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

**Использование:**
```html
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

## Animations

Проект использует `tw-animate-css` для дополнительных анимаций:

```css
@import 'tw-animate-css';
```

**Примеры:**
```html
<div className="animate-fade-in">Fade In</div>
<div className="animate-slide-up">Slide Up</div>
```

## Best Practices

### 1. Используйте CSS переменные для темы
```css
@theme inline {
  --color-primary: var(--primary);
}
```

### 2. Кастомные варианты через @custom-variant
```css
@custom-variant hocus (&:where(:hover, :focus));
```

```html
<button className="hocus:opacity-80">Hover or Focus</button>
```

### 3. Функциональные утилиты
```css
@utility tab-* {
  tab-size: *;
}
```

```html
<pre className="tab-4">Code with tab-size: 4</pre>
```

### 4. Используйте cn() для объединения классов
```typescript
className={cn("base", conditional && "active")}
```

## Migration из v3

Если вы переходите с v3:

1. **Удалите `tailwind.config.js`**
2. **Установите `@tailwindcss/postcss`**
   ```bash
   npm install -D @tailwindcss/postcss
   ```
3. **Обновите PostCSS конфиг**
   ```javascript
   module.exports = {
     plugins: {
       '@tailwindcss/postcss': {},
     },
   }
   ```
4. **Переместите конфигурацию в CSS**
   ```css
   @import 'tailwindcss';

   @theme {
     /* ваша тема */
   }
   ```

## Интеграция с Next.js

Tailwind CSS v4 отлично работает с Next.js 15:

`src/app/layout.tsx`:
```typescript
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

## Интеграция с shadcn/ui

shadcn/ui компоненты полностью совместимы с Tailwind v4:

```typescript
import { Button } from "@/components/ui/button"

<Button className="bg-primary text-primary-foreground">
  Click me
</Button>
```

## Performance

Tailwind CSS v4 значительно быстрее v3:
- **10x** быстрее компиляция (благодаря Rust)
- **Incremental builds** - пересобирает только измененное
- **Меньший bundle** - оптимизированный CSS output

## Troubleshooting

### Классы не применяются

1. Проверьте `@source`:
   ```css
   @source "./app/**/*.{js,ts,jsx,tsx}";
   ```

2. Убедитесь, что PostCSS настроен:
   ```javascript
   plugins: {
     '@tailwindcss/postcss': {},
   }
   ```

### Dark mode не работает

Проверьте custom variant:
```css
@custom-variant dark (&:where([data-mode="dark"], [data-mode="dark"] *));
```

### CSS переменные не находятся

Используйте `@theme inline`:
```css
@theme inline {
  --color-primary: var(--primary);
}
```

## Полезные ссылки

- [Tailwind CSS v4 Documentation](https://tailwindcss.com)
- [Tailwind v4 Blog Post](https://tailwindcss.com/blog/tailwindcss-v4)
- [PostCSS Plugin](https://github.com/tailwindlabs/tailwindcss-postcss)
- [OKLCH Color Picker](https://oklch.com)
- [tw-animate-css](https://github.com/tailwindlabs/tailwindcss-animate)

## Примеры из проекта

### Button с вариантами
```typescript
<Button className="bg-primary hover:bg-primary/90">
  Primary Button
</Button>

<Button className="bg-destructive text-destructive-foreground">
  Delete
</Button>
```

### Responsive Layout
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card key={item.id}>{item.title}</Card>
  ))}
</div>
```

### Dark Mode Toggle
```typescript
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <p>This text changes color in dark mode</p>
</div>
```
