# next-themes

## Версия в проекте
`0.4.6`

## Описание
next-themes - это библиотека для управления темами в Next.js с SSR support.

## Setup

```typescript
import { ThemeProvider } from 'next-themes';

<ThemeProvider attribute="data-mode" defaultTheme="system">
  {children}
</ThemeProvider>
```

## Usage

```typescript
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();

<button onClick={() => setTheme('dark')}>Dark</button>
<button onClick={() => setTheme('light')}>Light</button>
<button onClick={() => setTheme('system')}>System</button>
```

## Ссылки
- [next-themes GitHub](https://github.com/pacocoursey/next-themes)
