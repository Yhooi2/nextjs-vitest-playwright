# Storybook

## Версия в проекте
`9.1.6`

## Описание
Storybook - это инструмент для разработки и документирования UI компонентов.

## Конфигурация

См. `STORYBOOK.md` в корне проекта для полной конфигурации.

### Запуск
```bash
npm run storybook        # Dev server (port 6006)
npm run build-storybook  # Build static
```

### Stories Pattern
```typescript
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Button' },
};
```

## Темы
Поддержка dark mode через `@storybook/addon-themes`:

```typescript
import { withThemeByDataAttribute } from '@storybook/addon-themes';

export const decorators = [
  withThemeByDataAttribute({
    themes: { light: 'light', dark: 'dark' },
    defaultTheme: 'light',
    attributeName: 'data-mode',
  }),
];
```

## Ссылки
- [Storybook Docs](https://storybook.js.org)
