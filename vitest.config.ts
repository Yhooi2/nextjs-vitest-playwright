/// <reference types="vitest/config" />
/// <reference types="vitest" />
// Обеспечивает распознавание типов Vitest TypeScript

import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

// Сначала загрузите переменные окружения
// Я использую командную строку для этого (но оставил её здесь, если вам удобно)
// import dotenv from 'dotenv';
//  dotenv.config({ path: '.env.test' });
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { fileURLToPath } from 'node:url';
const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon

export default defineConfig({
  test: {
    // Определяет тестовую среду как jsdom
    // (симулирует DOM в Node.js, идеально подходит для тестирования компонентов React)
    environment: 'jsdom',
    // Позволяет использовать такие функции, как `describe`, `it`, `expect`
    // без ручного импорта
    globals: true,
    // Запускает тесты параллельно (поведение Vitest по умолчанию)
    // Указывается явно, если какой-либо тест с доступом к SQLite
    // генерирует конфликты в уникальных ограничениях (например, UNIQUE)
    fileParallelism: false,
    // Файл выполняется перед каждым **тестовым файлом**
    // (идеально подходит для глобальных конфигураций, таких как jest-dom и cleanup)
    setupFiles: ['vitest.setup.ts'],
    // Выполняется один раз до (setup) и после (tearDown) набора
    // inteiТестовый файл
    globalSetup: ['vitest.global.setup.ts'],
    // Определяет, какие файлы будут считаться тестами (модульными и интеграционными)
    // Интеграционные тесты: .test.ts(x) | Модульные тесты: .spec.ts(x)
    include: ['src/**/*.{spec,test}.{ts,tsx}'],
    // Максимальное время выполнения каждого теста (в миллисекундах)
    // до того, как он будет считаться зависшим или проваленным
    testTimeout: 10000,
    // Конфигурация покрытия тестами
    coverage: {
      // Папка, в которой будут создаваться отчёты о покрытии
      reportsDirectory: './coverage',
      // Использует встроенный движок покрытия Node.js
      provider: 'v8',
      // Какие файлы будут анализироваться на предмет покрытия кода
      include: ['src/**/*.{ts,tsx}'],
      // Файлы и папки, которые следует игнорировать в отчёте о покрытии
      exclude: [
        // Игнорировать тестовые файлы
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        // Игнорировать файлы которые содержат ТОЛЬКО типы или интерфейсы
        '**/types/**',
        '**/*.d.ts',
        '**/*.type.{ts,tsx}',
        '**/*.types.{ts,tsx}',
        '**/*.contract.{ts,tsx}',
        '**/*.contract.*.{ts,tsx}',
        '**/*.protocol.{ts,tsx}',
        '**/*.interface.{ts,tsx}',
        // Игнорировать layout.tsx (если нужно протестировать макет, удалите его)
        'src/app/**/layout.{ts,tsx}',
        // Игнорировать файлы и папки mock и тестовых утилит
        '**/*.mock.{ts,tsx}',
        '**/*.mocks.{ts,tsx}',
        '**/mocks/**',
        '**/__mocks__/**',
        '**/__tests__/**',
        '**/__test-utils__/**',
        '**/*.test-util.ts',
        // Игнорирует файлы и папки Storybook
        '**/*.story.{ts,tsx}',
        '**/*.stories.{ts,tsx}',
        '**/stories/**',
        '**/__stories__/**',
      ],
    },
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
  // Активирует плагин React (преобразование JSX, HMR и т. д.)
  plugins: [react()],
  resolve: {
    alias: {
      // Позволяет использовать @/ в качестве ярлыка для папки src
      // Пример: импортировать Button из '@/components/Button'
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
