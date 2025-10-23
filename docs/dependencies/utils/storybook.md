# Storybook

## Версия в проекте
`9.1.6`

## Описание
Storybook - это инструмент для разработки и документирования UI компонентов в изоляции. Используется для:
- Component development без запуска всего приложения
- Living documentation с интерактивными примерами
- Visual testing и regression testing
- Automated interaction testing через Play functions

## Установленные аддоны

В проекте используются следующие аддоны:

| Аддон | Версия | Назначение |
|-------|--------|-----------|
| `@storybook/nextjs-vite` | 9.1.6 | Next.js framework с Vite builder |
| `@storybook/addon-themes` | 9.1.6 | Dark/light mode switcher |
| `@storybook/addon-a11y` | 9.1.6 | Accessibility testing |
| `@storybook/addon-vitest` | 9.1.6 | Vitest integration для component tests |
| `@storybook/addon-docs` | 9.1.6 | Auto-generated documentation |
| `@storybook/addon-mcp` | 0.0.6 | MCP server для AI интеграции |
| `@chromatic-com/storybook` | 4.1.1 | Visual regression testing |

## Конфигурация

### Основной конфиг (`.storybook/main.ts`)

```typescript
import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    '@storybook/addon-themes',
    '@storybook/addon-mcp',
  ],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  staticDirs: ['../public'],
};

export default config;
```

### Preview конфиг (`.storybook/preview.ts`)

```typescript
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Preview } from '@storybook/nextjs-vite';
import { Toaster } from '@/components/ui/sonner';
import '../src/app/globals.css';

// Global decorators
export const decorators = [
  // Theme switcher
  withThemeByDataAttribute({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'light',
    attributeName: 'data-mode',
  }),

  // Toaster для toast notifications
  (Story) => (
    <>
      <Story />
      <Toaster />
    </>
  ),
];

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo', // or 'error' to fail CI
    },
    backgrounds: { disabled: true },
    nextjs: {
      appDirectory: true,
    },
  },
};

export default preview;
```

## Запуск

```bash
npm run storybook        # Dev server (http://localhost:6006)
npm run build-storybook  # Build static для deploy
```

## Component Story Format (CSF) 3.0

### Базовая структура

```typescript
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from './Button';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// META CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const meta = {
  title: 'Design System/Button',
  component: Button,
  parameters: {
    layout: 'centered', // 'centered' | 'fullscreen' | 'padded'
  },
  tags: ['autodocs'], // Auto-generate docs page
  args: {
    // Default args для всех stories
    variant: 'default',
    size: 'default',
  },
  argTypes: {
    // Controls configuration
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'ghost', 'link'],
      description: 'Visual variant of the button',
      table: {
        category: 'Styling',
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STORIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const Playground: Story = {
  // Пустой - наследует все из meta
  // Интерактивная песочница с Controls panel
};

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
};
```

### Play Functions для Interactions

```typescript
import { expect, userEvent, within } from '@storybook/test';

export const Interactive: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Click the button', async () => {
      const button = canvas.getByRole('button');
      await userEvent.click(button);
    });

    await step('Verify action', async () => {
      await expect(canvas.getByText('Clicked')).toBeInTheDocument();
    });
  },
};
```

## Best Practices

### ✅ DO

- **Playground story первой** - интерактивная песочница
- **Default args в meta** - избегай дублирования
- **ArgTypes с категориями** - группируй props (`Content`, `Validation`, `State`, `Layout`)
- **Parameters.layout** - `'centered'` для forms/buttons
- **Tags autodocs** - для public компонентов
- **Decorators для providers** - Toaster, ThemeProvider, Context
- **Play functions** - для critical user flows
- **getByRole** - accessibility-first queries

### ❌ DON'T

- ❌ Дублировать args через `...Default.args`
- ❌ Использовать `getByTestId` когда есть `getByRole`
- ❌ Забывать про accessibility (a11y addon)
- ❌ Создавать stories без meta.component
- ❌ Игнорировать TypeScript типы

## Темы (Dark Mode)

Настройка через `@storybook/addon-themes`:

```typescript
import { withThemeByDataAttribute } from '@storybook/addon-themes';

export const decorators = [
  withThemeByDataAttribute({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'light',
    attributeName: 'data-mode', // Соответствует Tailwind CSS v4 конфигу
  }),
];
```

**⚠️ ВАЖНО:** В проекте используется `data-mode` атрибут, а не класс `dark`. Это для Tailwind CSS v4 с custom variant.

## Accessibility Testing

Addon `@storybook/addon-a11y` автоматически проверяет:
- ARIA labels
- Color contrast
- Keyboard navigation
- Screen reader support

Конфигурация в preview.ts:
```typescript
parameters: {
  a11y: {
    test: 'todo', // Показывает violations в UI
    // test: 'error', // Фейлит CI на violations
  },
}
```

## Component Testing с Vitest

`@storybook/addon-vitest` позволяет запускать stories как тесты:

```bash
npm run test-storybook
```

Stories с Play functions автоматически становятся тестами.

## Полная документация

Для детального учебника по Storybook 9 best practices см.:
- **[`docs/STORYBOOK_TASKINPUT_LESSON.md`](../../STORYBOOK_TASKINPUT_LESSON.md)** - полный учебник с примерами
- **[`STORYBOOK.md`](../../../STORYBOOK.md)** - setup guide в корне проекта

## Примеры в проекте

- [`TaskInput.stories.tsx`](../../../src/components/TaskInput/TaskInput.stories.tsx) - reference implementation всех best practices
- [`Button.stories.tsx`](../../../src/components/ui/Button/Button.stories.tsx) - пример с custom render и иконками
- [`TodoForm.stories.tsx`](../../../src/components/TodoForm/TodoForm.stories.tsx) - пример с mock actions
- [`TodoList.stories.tsx`](../../../src/components/TodoList/TodoList.stories.tsx) - пример с mock data

## Структура stories в проекте

```
src/
├── components/
│   ├── TaskInput/
│   │   ├── index.tsx
│   │   └── TaskInput.stories.tsx    # Colocated stories
│   ├── TodoForm/
│   │   ├── index.tsx
│   │   └── TodoForm.stories.tsx
│   └── ui/
│       └── Button/
│           ├── index.tsx
│           └── Button.stories.tsx
```

**Pattern:** Stories colocated с компонентами (не в отдельной папке).

## Troubleshooting

### Проблема: Toasts не отображаются

**Решение:** Добавить Toaster в global decorator (`.storybook/preview.ts`):

```typescript
export const decorators = [
  withThemeByDataAttribute({...}),
  (Story) => (
    <>
      <Story />
      <Toaster />
    </>
  ),
];
```

### Проблема: Dark mode не работает

**Причина:** Используется `data-mode` атрибут, а не класс `dark`.

**Решение:** В `globals.css` должен быть:
```css
@custom-variant dark (&:where([data-mode="dark"], [data-mode="dark"] *));
```

### Проблема: TypeScript errors в stories

**Решение:** Проверь что используешь правильные типы:
```typescript
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  component: MyComponent,
} satisfies Meta<typeof MyComponent>;

type Story = StoryObj<typeof meta>;
```

## MCP Integration

Аддон `@storybook/addon-mcp` (версия 0.0.6) предоставляет MCP server на `http://localhost:6006/mcp`.

**Доступные инструменты через MCP:**
- Query компонентов
- Получение props информации
- Доступ к stories
- Интеграция с AI для UI implementation

Для использования с Claude Code, сервер уже настроен в `.mcp.json`.

## Ссылки

- [Storybook 9 Docs](https://storybook.js.org/docs/9.0) - официальная документация
- [Component Story Format 3.0](https://storybook.js.org/docs/api/csf) - CSF спецификация
- [Writing Stories](https://storybook.js.org/docs/writing-stories) - гайд по написанию stories
- [Play Functions](https://storybook.js.org/docs/writing-stories/play-function) - interaction testing
- [Storybook + Next.js](https://storybook.js.org/docs/get-started/frameworks/nextjs) - Next.js integration

---

**Обновлено:** 2025-10-23
**Версия:** 9.1.6
