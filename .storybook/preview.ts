import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Preview } from '@storybook/nextjs-vite';
import '../src/app/globals.css'; // replace with the name of your tailwind css file

/* snipped for brevity */

export const decorators = [
  withThemeByDataAttribute({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'light',
    attributeName: 'data-mode',
  }),
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
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
    // Optional: Disable backgrounds since we're using themes
    backgrounds: { disabled: true },
    // If using Next.js App Router exclusively
    nextjs: {
      appDirectory: true,
    },
  },
};

export default preview;
