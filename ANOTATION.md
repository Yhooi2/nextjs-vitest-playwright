# Заметки Луиза Отавио 😅

Автор: [Luiz Otávio Miranda](https://github.com/luizomf) в июне 2025.

**Личный справочный материал**

Эти заметки были сделаны во время создания тестов для проекта. Они не были задуманы как "формальный" контент, а как реальный гид от того, кто находится в коде, ломает голову и тестирует все на практике. Решил поделиться с вами, потому что знаю, что может помочь. Используйте как справочник, быструю консультацию или даже для адаптации в своих собственных проектах.

Файлы крайне многословны (с большим количеством комментариев). Это сделано специально для объяснения каждой строки кода. Сделал это, чтобы избежать пропуска вещей без объяснения причин.

---

## Настройки git

```sh
# Настроить имя пользователя
git config user.name "Luiz Otávio"

# Настроить email пользователя
git config user.email "luizomf@gmail.com"

# Изменить имя ветки на main
git branch -m main

# Гарантировать, что Git конвертирует CRLF в LF только при коммите (отлично для мультиплатформенных проектов)
git config core.autocrlf input

# Заставить Git всегда использовать LF как конец строки
git config core.eol lf

# Проверить примененные настройки
git config --list --local

# Добавление репозитория
git add .
git commit -m "initial"
git remote add origin LINK-REPO
git push origin main -u
```

---

## Установка vitest

Команды и детали о том, что мы установили

```sh
npm i -D vitest @vitejs/plugin-react @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Ниже только то, что мы будем использовать на протяжении уроков
npm i drizzle-orm better-sqlite3 clsx date-fns lucide-react
npm i -D dotenv dotenv-cli drizzle-kit @types/better-sqlite3 tsx
```

Для чего эти пакеты нужны?

| Пакет                         | Для чего служит?                                                                        |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| `vitest`                      | Современный test runner (заменяет Jest с похожим синтаксисом)                           |
| `@vitejs/plugin-react`        | Поддержка JSX/TSX в Vite (необходимо для проектов React)                                |
| `@vitest/coverage-v8`         | Генерирует отчет покрытия используя движок V8 (как в Node)                              |
| `jsdom`                       | Эмулирует DOM в Node.js (нужно для тестирования компонентов React)                      |
| `@testing-library/react`      | Рендерит и взаимодействует с компонентами способом, похожим на пользователя             |
| `@testing-library/jest-dom`   | Добавляет полезные matchers как `.toBeInTheDocument()` к `expect`                       |
| `@testing-library/user-event` | Имитирует реалистичные события как клики и набор текста (с фокусом, задержками, и т.д.) |
| `drizzle-orm`                 | Современная, простая и безопасная ORM для SQL баз данных                                |
| `better-sqlite3`              | Быстрая и синхронная база данных SQLite (идеально для тестов и разработки)              |
| `clsx`                        | Объединяет классы условно (отлично с Tailwind)                                          |
| `date-fns`                    | Функциональная библиотека для работы с датами                                           |
| `lucide-react`                | Набор современных иконок для React                                                      |
| `dotenv`                      | Загружает переменные окружения из файлов `.env`                                         |
| `drizzle-kit`                 | CLI Drizzle (используется для генерации и применения миграций в базе)                   |
| `@types/better-sqlite3`       | TypeScript типы для `better-sqlite3`                                                    |
| `tsx`                         | Выполняет TypeScript файлы напрямую в Node (без необходимости компилировать заранее)    |

---

## Настройка vitest

Создать файл `./vitest.config.ts` (`code vitest.config.ts`):

```ts
/// <reference types="vitest" />
// Гарантирует, что TypeScript распознает типы Vitest

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// Загружает переменные окружения перед всем
// Я использую командную строку для этого (но оставил здесь на случай, если понадобится)
// import dotenv from 'dotenv';
// dotenv.config({ path: '.env.test' });

export default defineConfig({
  test: {
    // Определяет среду тестирования как jsdom
    // (имитирует DOM в Node.js, идеально для тестов компонентов React)
    environment: 'jsdom',

    // Позволяет использовать функции как `describe`, `it`, `expect`
    // без ручного импорта
    globals: true,

    // Запуск тестов параллельно (поведение по умолчанию Vitest)
    // Оставлено явно на случай, если какой-то тест с доступом к SQLite
    // создаст конфликт в ограничениях уникальности (например: UNIQUE constraint)
    fileParallelism: false,

    // Файл, выполняемый перед каждым **файлом теста**
    // (идеально для глобальной настройки как jest-dom и cleanup)
    setupFiles: ['vitest.setup.ts'],

    // Выполняется один раз до (setup) и после (tearDown) всего
    // набора тестов
    globalSetup: ['vitest.global.setup.ts'],

    // Определяет, какие файлы будут считаться тестами (unit и integration)
    // Интеграционные тесты: .test.ts(x) | Модульные тесты: .spec.ts(x)
    include: ['src/**/*.{spec,test}.{ts,tsx}'],

    // Максимальное время для каждого теста (в миллисекундах)
    // прежде чем он будет считаться зависшим или неуспешным
    testTimeout: 10000,

    // Настройка покрытия тестов
    coverage: {
      // Папка, где будут генерироваться отчеты покрытия
      reportsDirectory: './coverage',

      // Использует нативный механизм coverage Node.js
      provider: 'v8',

      // Какие файлы будут анализироваться для покрытия кода
      include: ['src/**/*.{ts,tsx}'],

      // Файлы и папки, которые будут игнорироваться в отчете покрытия
      exclude: [
        // Игнорирует файлы тестов
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',

        // Игнорирует файлы, которые содержат ТОЛЬКО типы или интерфейсы
        '**/types/**',
        '**/*.d.ts',
        '**/*.type.{ts,tsx}',
        '**/*.types.{ts,tsx}',
        '**/*.contract.{ts,tsx}',
        '**/*.protocol.{ts,tsx}',
        '**/*.interface.{ts,tsx}',

        // Игнорирует layout.tsx (если нужно тестировать layout, удалите)
        'src/app/**/layout.{ts,tsx}',

        // Игнорирует файлы и папки моков и утилит тестов
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
  },
  // Активирует плагин React (JSX transform, HMR, и т.д.)
  plugins: [react()],
  resolve: {
    alias: {
      // Позволяет использовать @/ как сокращение для папки src
      // Пример: import Button from '@/components/Button'
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
```

Создать файл `./vitest.setup.ts` (`code vitest.setup.ts`):

```ts
// Этот файл выполняется перед каждым ФАЙЛОМ теста.
// Идеально для настройки jest-dom, глобальных моков или сброса состояний между файлами.

// Импортирует функции Vitest для использования после тестов
// `afterEach` = выполняет что-то после каждого теста
// `expect` = основная функция для создания утверждений (тестирования результатов)
import { afterEach, expect } from 'vitest';

// Импортирует функцию `cleanup` из Testing Library
// Она "очищает" DOM после каждого теста, чтобы гарантировать, что один тест не влияет на другой
import { cleanup } from '@testing-library/react';

// Импортирует дополнительные matchers из jest-dom, адаптированные для Vitest
// Пример: `.toBeInTheDocument()`, `.toHaveAttribute()`, и т.д.
// Без этого `expect(...).toBeInTheDocument()` выдаст ошибку
import '@testing-library/jest-dom/vitest';

// Импортирует все matchers из jest-dom, адаптированные для Vitest
// Это предотвращает предупреждения, связанные с act(...) при обновлениях React
// и гарантирует, что matchers как `.toBeInTheDocument()` работают корректно
import * as matchers from '@testing-library/jest-dom/matchers';
import { clearDrizzleTodoTable } from '@/core/todo/__tests__/utils/clear-drizzle-todo-table';

// Расширяет глобальный expect с matchers из jest-dom
// Без этого может появиться предупреждение типа "You might have forgotten to wrap an update in act(...)"
expect.extend(matchers);

// Эта функция запускается автоматически после **каждого** теста
// Служит для очистки всего и предотвращения взаимного влияния тестов
afterEach(async () => {
  // Очищает DOM между тестами (удаляет то, что было отрендерено)
  cleanup();

  // Сбрасывает все spy и mock Vitest (`vi.fn`, `vi.spyOn`, и т.д.)
  // Гарантирует независимость тестов и отсутствие "мусора" от предыдущих выполнений
  vi.resetAllMocks();

  // Очищает таблицу базы данных на случай, если остался мусор
  await clearDrizzleTodoTable();
});
```

Файл `vitest.global.setup.ts`:

```ts
import cleanupTestDatabase from '@/utils/__tests__/utils/cleanup-test-database';

// Выполняется один раз до (setup) и после (tearDown) всего
// набора тестов

export async function setup() {
  // Запускается перед всеми тестами
  // Это немного избыточно, но иногда тест выполняется не полностью
  // и оставляет мусор, как старые базы данных или данные в таблице
  await cleanupTestDatabase();
}

export async function teardown() {
  // Запускается после всех тестов
  await cleanupTestDatabase();
}
```

Файл `tsconfig.json`:

```json
{
  // другие настройки
  "compilerOptions": {
    // другие настройки
    "types": ["vitest/globals"],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
  // другие настройки
}
```

Файл `package.json`:

```json
{
  // другие настройки
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "drizzle:generate": "drizzle-kit generate",
    "drizzle:migrate": "drizzle-kit migrate",
    "dev:test": "dotenv -e .env.e2e -- next dev",
    "start:test": "dotenv -e .env.e2e -- next start",
    "test": "dotenv -e .env.test -- vitest run --bail 1",
    "test:all": "npm run test && npm run test:e2e",
    "test:watch": "dotenv -e .env.test -- vitest --bail 1",
    "test:unit": "dotenv -e .env.test -- vitest run --exclude 'src/**/*.{test,e2e}.{ts,tsx}' --fileParallelism",
    "test:unit:watch": "dotenv -e .env.test -- vitest --exclude 'src/**/*.{test,e2e}.{ts,tsx}' --fileParallelism",
    "test:int": "dotenv -e .env.test -- vitest run --exclude 'src/**/*.{spec,e2e}.{ts,tsx}' --no-file-parallelism",
    "test:int:watch": "dotenv -e .env.test -- vitest --exclude 'src/**/*.{spec,e2e}.{ts,tsx}' --no-file-parallelism",
    "test:cov": "dotenv -e .env.test -- vitest run --coverage --no-file-parallelism",
    "test:e2e": "dotenv -e .env.e2e -- playwright test",
    "test:e2e:headed": "dotenv -e .env.e2e -- playwright test --headed",
    "test:e2e:debug": "dotenv -e .env.e2e -- playwright test --debug",
    "test:e2e:ui": "dotenv -e .env.e2e -- playwright test --ui",
    "test:e2e:report": "dotenv -e .env.e2e -- playwright show-report",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
  // другие настройки
}
```

---

## Типы тестов: модульные, интеграционные и e2e

### 🧪 Модульные тесты (`*.spec.ts(x)`)

Тестируют **один изолированный элемент** — как чистые функции, классы или даже небольшие компоненты. Если этот элемент зависит от другого (например: одна функция вызывает другую, или компонент использует другой), **зависимость должна быть замокана**. Эти тесты не включают DOM, сеть, базу данных или реальные побочные эффекты.

📌 Примеры:

- Тестировать функцию `sum(a, b)` возвращает правильное значение.
- Тестировать, что компонент `<Button>` рендерит правильный текст.
- Тестировать, что функция вызывает другую с ожидаемыми аргументами (с `vi.fn`).

### 🔄 Интеграционные тесты (`*.test.ts(x)`)

Проверяют **интеграцию между двумя или более реальными элементами системы**, как компонент, использующий другие компоненты, хук, зависящий от контекста, или функция, взаимодействующая с внутренним API. Нет реальных внешних побочных эффектов — **мокаем базу данных, сеть, файлы, email**, и т.д.

📌 Примеры:

- Тестировать, что `<TodoForm />` рендерит todos правильно и вызывает `createTodoAction`.
- Тестировать, что форма отправляет правильные данные в функцию `handleSubmit`.
- Тестировать, что API правильно вызывает репозиторий (с моком базы данных).

### 🌐 End-to-end тесты (`*.e2e.ts`)

Имитируют **реальное поведение пользователя** или всей системы. Включают приложение, работающее по-настоящему (через Playwright, Vitest с реальным fetch, и т.д.). В идеале используют отдельную и чистую базу данных, могут мокать или не мокать внешние сервисы как email, storage, и т.д.

📌 Примеры:

- Пользователь заполняет форму, отправляет и видит новый элемент на экране.
- Тест API обращается к `/login`, отправляет учетные данные, получает JWT и обращается к приватному маршруту.
- Email подтверждения имитируется через мок, но весь поток выполняется реально.

---

## Некоторые примеры фраз для `test` и `it`

Поскольку у нас могут быть трудности с написанием названий тестов, вот несколько примеров:

```
| Действие             | Адаптируемый пример                           |
|----------------------|---------------------------------------------|
| `renders`            | `renders input with label`                  |
| `shows`              | `shows tooltip on hover`                    |
| `hides`              | `hides error when fixed`                    |
| `calls`              | `calls onChange when typed`                 |
| `submits`            | `submits form with valid data`              |
| `navigates`          | `navigates to dashboard on login`           |
| `displays`           | `displays success toast after submit`       |
| `updates`            | `updates value on user typing`              |
| `toggles`            | `toggles theme on switch click`             |
| `finds`              | `finds items using role`                    |
| `handles`            | `handles fetch failure with fallback UI`    |
| `validates`          | `validates required fields`                 |
| `matches`            | `matches snapshot for default state`        |
| `generates`          | `generates a random string`                 |
| `creates`            | `creates new user object`                   |
| `builds`             | `builds slug from text`                     |
| `constructs`         | `constructs query from filters`             |
| `fetches`            | `fetches post data from API`                |
| `receives`           | `receives response from mocked fetch`       |
| `sends`              | `sends correct payload to server`           |
| `formats`            | `formats ISO date to locale format`         |
| `parses`             | `parses API response to expected shape`     |
| `filters`            | `filters results based on user input`       |
| `maps`               | `maps API data to UI structure`             |
| `resolves`           | `resolves promise with expected data`       |
| `rejects`            | `rejects with error when API fails`         |
```

## Различия между `mock`, `mocked` и `stubGlobal`

### ✅ `vi.mock`

Служит для **мока целых модулей** (например: `fs/promises`, `axios`, `date-fns`). Вы можете вернуть объект с `vi.fn()` в каждой функции, которую хотите перехватить. Если модуль экспортирует `default`, нужно мокать и это тоже (как правильно сделали с `default: { ... }`).

### ✅ `vi.mocked(...)`

Используется, чтобы **сказать TypeScript, что эта функция уже была замокана** и, следовательно, имеет методы как `.mockResolvedValue()` и подобные.

> Он **не создает** мок. Только "типизирует" правильно что-то **что уже было замокано раньше** с `vi.mock`.

### ✅ `vi.stubGlobal`

Мокает **любое глобальное значение** во время теста. Служит как для функций (`fetch`, `setTimeout`, `crypto`), так и для значений (`Date`, `Math.random`, и т.д.). Очень полезно, когда вы хотите тестировать что-то, что напрямую зависит от глобальных переменных.

> Совет: в отличие от `vi.mock`, `vi.stubGlobal` может быть сброшен с `vi.resetAllMocks()` в `afterEach`.

### 💡 Дополнительный совет: `vi.spyOn(...)`

Служит для **шпионажа** за методами уже существующих объектов (без необходимости мокать все). Идеально для _частичных моков_, типа `console.log`, `Date.now`, или функции внутри сервиса, который не хотите полностью мокать.

---

## Правила testing library для следования хорошим практикам

### 1. Используйте селекторы, основанные на том, что видит пользователь

Избегайте тестирования классов, ID или внутренней структуры. Фокусируйтесь на содержимом, доступном пользователю.

```tsx
screen.getByText('Добро пожаловать');
screen.getByRole('button', { name: /сохранить/i });
screen.getByLabelText('Пароль');
```

### 2. Предпочитайте `findBy*` для асинхронного содержимого

Используйте `findBy` для ожидания появления элемента после взаимодействий.

```tsx
await screen.findByText('Данные загружены');
```

### 3. Используйте `userEvent` для имитации взаимодействий

Имитирует реальные взаимодействия с фокусом, задержкой, клавиатурой и кликом.

```tsx
await userEvent.click(screen.getByRole('button', { name: /отправить/i }));
await userEvent.type(screen.getByLabelText('Имя'), 'Отавио');
```

### 4. Централизуйте общие рендеры

Создайте помощники как `renderWithProviders`, если используете Context, Theme, Redux, и т.д.

```tsx
function renderWithTheme(ui) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}
```

### 5. Тестируйте то, что ожидал бы пользователь

Проверяйте сообщения, состояния, отключенные кнопки и визуальные изменения.

```tsx
expect(screen.getByText('Ошибка при сохранении')).toBeInTheDocument();
expect(button).toBeDisabled();
```

---

## ❌ Плохие практики – Чего избегать при использовании testing library

### 1. Избегайте `getByTestId` как стандарт

Используйте только если **нет другого доступного способа** выбора.

```tsx
// Избегайте:
screen.getByTestId('кнопка-отправить');
```

### 2. Не тестируйте классы, стили или внутреннюю структуру

Это делает тесты хрупкими. Изменения в CSS ломают тесты без необходимости.

```tsx
// Избегайте:
expect(button).toHaveClass('btn-primary');
```

### 3. Не используйте `waitFor` без реальной необходимости

Используйте `waitFor` для общих условий, но предпочитайте `findBy` для элементов.

```tsx
// Менее идеально:
await waitFor(() => {
  expect(screen.getByText('Готово')).toBeInTheDocument();
});

// Лучше:
await screen.findByText('Готово');
```

### 4. Не тестируйте внутреннюю реализацию

Избегайте знания о `useState`, `ref`, `context`, и т.д. Тестируйте поведения и визуальные эффекты.

```tsx
// Избегайте:
expect(setStateSpy).toHaveBeenCalled();

// Предпочитайте:
expect(screen.getByText('Счетчик: 1')).toBeInTheDocument();
```

---

### 🧠 Дополнения

- **Использование `getByRole` помогает в доступности**
- **Мокайте только необходимое** (внешние API, не внутреннее поведение)
- **Пишите название теста как поведение пользователя**

```tsx
// Хорошо:
test('показывает ошибку при отправке пустой формы', () => { ... })

// Плохо:
test('вызывает handleSubmit с пустыми данными', () => { ... })
```

---

### 💡 Финальный совет

> "Тестируйте, как пользователь использовал бы. Не как разработчик реализовал." – Kent C. Dodds

---

## 🧪 Методы Testing Library – Быстрый обзор

### 🟩 `getBy*`

- **Синхронно** ищет элемент.
- Если **не найдет → выбрасывает ошибку**.
- Идеально, когда элемент уже **должен быть видимым.**

```ts
screen.getByText('Отправить');
```

### 🟦 `findBy*`

- **Асинхронный**, ждет появления элемента.
- Полезно после кликов, fetch, анимаций, и т.д.
- Внутренне использует `waitFor`.

```ts
await screen.findByText('Загружается...');
```

### 🟥 `queryBy*`

- Возвращает `null`, если **не найдет** (без ошибки).
- Идеально для тестирования **что что-то не на экране**.

```ts
expect(screen.queryByText('Ошибка')).not.toBeInTheDocument();
```

### 🧭 Порядок приоритета селекторов

> От наиболее рекомендуемого к наименее рекомендуемому (с точки зрения пользователя):

1. ✅ `getByRole`
2. ✅ `getByLabelText`
3. ✅ `getByPlaceholderText`
4. ✅ `getByText`
5. ✅ `getByDisplayValue`
6. ✅ `getByAltText`
7. ⚠️ `getByTitle`
8. 🚫 `getByTestId` (использовать только в крайнем случае)

---

## Наименование файлов

Организация файлов следует следующему принципу:

| Суффикс файла      | Указывает на что?                                        | Когда использовать                                                                              |
| ------------------ | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `.spec.ts(x)`      | **Модульный тест**                                       | Для тестирования чистых функций, изолированных компонентов или логики без внешних зависимостей. |
| `.test.ts(x)`      | **Интеграционный тест**                                  | Для тестирования интеграции между частями системы (например: компонент + внешняя логика).       |
| `.e2e.ts(x)`       | **End-to-end тест**                                      | Для имитации полного потока приложения (обычно используя Playwright).                           |
| `.mock.ts(x)`      | **Ручной мок**                                           | Когда нужно имитировать данные или поведения в тестах.                                          |
| `.test-util.ts(x)` | **Утилита теста**                                        | Вспомогательные функции для setup, динамического мока или создания данных для тестов.           |
| `.contract.ts`     | **Контракт типа**                                        | Определяет контракты: интерфейсы, типы или абстрактные классы без реальной логики.              |
| `.schema.ts`       | **Схема валидации или базы данных**                      | Определяет валидации с Zod, структуры таблиц с Drizzle, и т.д.                                  |
| `.repository.ts`   | **Репозиторий данных**                                   | Реализует правила доступа к данным согласно контракту.                                          |
| `имя-функции.ts`   | **Изолированные функции**                                | Файлы со специфическими функциями (имя файла = имя функции).                                    |
| `Другие`           | **Например: `.dto.ts`, `.service.ts`, `.controller.ts`** | Используйте, когда хотите прояснить функцию файла в домене приложения.                          |

---

## ⚠️ Контролируемое использование `any`, `@ts-expect-error` и отключения ESLint

Во время тестов и специфических случаев иногда **нам нужно принуждать недопустимые ситуации** или обходить правила, которые имеют смысл в большинстве случаев, но не там. Это хитрости для решения этого **безопасно и осознанно**:

---

### ✅ `@ts-expect-error`

Служит для **предупреждения TypeScript, что вы ожидаете ошибку в следующей строке**. Если ошибка существует, все в порядке. Если ошибки больше нет, TS предупредит вас, что директива осталась без цели.

```ts
// @ts-expect-error передача числа там, где ожидалась строка
await createTodoUseCase({ title: 123 });
```

📌 **Используйте только когда вы ХОТИТЕ тестировать неверные входные данные.** 👉 Никогда не используйте `@ts-ignore` вместо этого — он игнорирует все без предупреждения.

---

### ✅ Отключить ESLint в определенной строке

ESLint может жаловаться на вещи, на которые TS не жалуется. Классический пример — использование `any`, даже с `@ts-expect-error`. Чтобы отключить **только одно правило и только в одной строке**, сделайте так:

```ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const valor: any = 'контролируемый тест';
```

Вы можете совмещать с `@ts-expect-error`:

```ts
// @ts-expect-error принуждение неверного ввода
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const valor: any = 'значение';
```

---

### ✅ Отключить правило ESLint для **целого блока**

Если это большой фрагмент (как внутри функции или длинного теста), можно открыть и закрыть область с `eslint-disable` и `eslint-enable`:

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
function executaTesteEspecial(dado: any) {
  const resultado: any = dado + 1;
  return resultado;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
```

---

### 🚨 ВАЖНОЕ ПРЕДУПРЕЖДЕНИЕ

> НЕ ИСПОЛЬЗУЙТЕ `any`, `@ts-expect-error` и `eslint-disable` ВЕЗДЕ ПОДРЯД.

Эти ресурсы существуют для **намеренных и контролируемых моментов** — как тесты неверных входных данных, сложные моки или интеграции с библиотеками, у которых нет хороших типов.

Если вы используете это как стандарт, вы **убиваете преимущества TypeScript и ESLint** и, вероятно, прячете баги случайно.

---

### 🧠 Золотые правила

- ✅ Используйте `@ts-expect-error` **когда тестируете или принуждаете ошибку**.
- ✅ Используйте `eslint-disable` **только когда ESLint более назойлив, чем полезен, и возвращайте с `enable` потом**.
- ❌ Не используйте `@ts-ignore` — это кнопка "забить", и вы забудете, где поставили.
- ❌ Не используйте `any` без объяснения причины (даже в тестах).
- ✅ Когда возможно, **создавайте типизированные помощники** или **собственные моки** вместо прибегания к `any`.

---

## E2e тесты с playwright

Ссылка: [Официальный сайт](https://playwright.dev/)

```sh
# Остальное он спросит все и настроит все для вас
npm init playwright@latest
```

Файл `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.e2e\.ts/,
  fullyParallel: false,
  workers: 1,
  globalTeardown: './src/utils/__tests__/utils/cleanup-test-database.ts',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],

        launchOptions: {
          headless: true,
          slowMo: 0,
        },
      },
    },
  ],
  webServer: {
    command: 'npm run dev:test',
    url: 'http://localhost:3000',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
});
```

---

## ✅ Правила Playwright для следования хорошим практикам

### 1. Используйте видимые и доступные селекторы

Предпочитайте `getByRole`, `getByText`, `getByLabel`, и т.д. — как пользователь видит и взаимодействует.

```ts
await page.getByRole('button', { name: /отправить/i }).click();
await page.getByLabel('Пароль').fill('123456');
await page.getByText('Добро пожаловать').isVisible();
```

---

### 2. Используйте `await expect()` для валидации поведения

Всегда используйте `await` с `expect` и сочетайте с `.toBeVisible()`, `.toHaveText()`, и т.д.

```ts
await expect(page.getByText('Сохранено успешно')).toBeVisible();
await expect(page.getByRole('button', { name: /сохранить/i })).toBeDisabled();
```

---

### 3. Ждите поведения, не таймеры

Избегайте `waitForTimeout`. Предпочитайте ждать реальные элементы или события.

```ts
// Плохо:
await page.waitForTimeout(1000);

// Хорошо:
await expect(page.getByText('Данные загружены')).toBeVisible();
```

---

### 4. Имитируйте, как использовал бы пользователь

Кликайте, печатайте, навигируйте — без прямого манипулирования DOM.

```ts
await page.getByRole('textbox', { name: /имя/i }).fill('Отавио');
await page.getByRole('button', { name: /отправить/i }).click();
```

---

### 5. Тестируйте как реальный поток

Тестируйте полные сценарии использования: вход, навигация, ошибка, подтверждение, и т.д.

```ts
test('пользователь входит и видит панель', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Email').fill('user@email.com');
  await page.getByLabel('Пароль').fill('безопасныйПароль123');
  await page.getByRole('button', { name: /войти/i }).click();
  await expect(page.getByText('Панель пользователя')).toBeVisible();
});
```

---

## ❌ Плохие практики – Чего избегать в Playwright

### 1. Избегайте хрупких селекторов

Не используйте `page.locator('div:nth-child(3) > span')` — это легко ломается.

```ts
// Избегайте:
await page.locator('form button:nth-child(2)').click();
```

---

### 2. Не используйте `waitForTimeout` как стандарт

Это делает тесты медленными и нестабильными.

```ts
// Избегайте:
await page.waitForTimeout(2000);
```

---

### 3. Не зависьте от внутренней структуры или классов

DOM может измениться, но поведение должно остаться. Фокусируйтесь на **пользовательском опыте**.

```ts
// Избегайте:
await page.locator('.input-primary').fill('...');

// Предпочитайте:
await page.getByRole('textbox', { name: /имя/i }).fill('...');
```

---

## 🧪 Быстрый обзор методов Playwright

### 🔵 `page.getByRole()`

- Лучший вариант, доступный и семантичный
- Помогает в доступности

```ts
await page.getByRole('button', { name: /сохранить/i });
```

---

### 🟢 `page.getByText()`

- Ищет по видимому тексту
- Очень полезно для сообщений, заголовков, и т.д.

```ts
await page.getByText('Регистрация выполнена успешно');
```

---

### 🟡 `page.getByLabel()`

- Идеально для полей ввода с метками

```ts
await page.getByLabel('Пароль').fill('123456');
```

---

### 🧭 Порядок приоритета селекторов

> С точки зрения пользователя:

1. ✅ `getByRole`
2. ✅ `getByLabel`
3. ✅ `getByText`
4. ✅ `getByPlaceholder`
5. ⚠️ `locator('css')` (избегать если возможно)
6. 🚫 `nth-child`, `class`, `id` (крайний случай)

---

### 💡 Финальный совет

> "Тестируйте реальный поток пользователя. Если ваш тест зависит от точного DOM, он неправильный."

---

## Прощание Луиза Отавио

Будьте здоровы 👋. \
Избегайте наркотиков (или используйте с осторожностью, как `vi.mock`). \
Делайте упражнения (больше чем snapshot тесты). \
Спите хорошо (хотя бы до деплоя). \
И, пожалуйста, **не изменяйте код в продакшене используя `nano`** (я тоже не умею пользоваться `vi`, так что делайте локально).

Увидимся в следующих тестах. Поцелуи 😘.

Автор: [Luiz Otávio Miranda](https://github.com/luizomf)

---
