# Документация проекта

Эта папка содержит полную документацию по проекту и всем его зависимостям.

## Быстрый старт

**Начните с:** [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md) - комплексный обзор проекта, архитектуры, паттернов и всех ключевых концепций.

## Структура документации

```
docs/
├── PROJECT_OVERVIEW.md          # 📖 Главный обзорный документ
│
└── dependencies/                # Детальная документация по зависимостям
    │
    ├── framework/              # Фреймворк и UI библиотеки
    │   ├── nextjs.md           # Next.js 15 (App Router, Server Actions, ISR)
    │   └── react.md            # React 19 (useActionState, useOptimistic)
    │
    ├── database/               # База данных
    │   ├── drizzle-orm.md      # Drizzle ORM (queries, migrations, patterns)
    │   ├── better-sqlite3.md   # SQLite драйвер
    │   └── drizzle-kit.md      # CLI для миграций
    │
    ├── validation/             # Валидация данных
    │   └── zod.md              # Zod (schemas, validation, transforms)
    │
    ├── ui/                     # UI компоненты и стилизация
    │   ├── tailwindcss.md      # Tailwind CSS v4
    │   ├── radix-ui.md         # Radix UI primitives
    │   ├── class-variance-authority.md  # CVA для вариантов
    │   └── lucide-react.md     # Иконки
    │
    ├── testing/                # Тестирование
    │   ├── vitest.md           # Unit/Integration тесты
    │   ├── playwright.md       # E2E тесты
    │   └── testing-library.md  # React Testing Library
    │
    ├── forms/                  # Работа с формами
    │   └── react-hook-form.md  # React Hook Form (не используется активно)
    │
    └── utils/                  # Утилиты
        ├── sonner.md           # Toast notifications
        ├── next-themes.md      # Theme management
        ├── date-fns.md         # Date utilities
        └── storybook.md        # Component documentation
```

## Ключевые документы

### Для новых разработчиков
1. [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md) - начните здесь
2. [`framework/nextjs.md`](./dependencies/framework/nextjs.md) - Server Actions, App Router
3. [`framework/react.md`](./dependencies/framework/react.md) - React 19 hooks
4. [`database/drizzle-orm.md`](./dependencies/database/drizzle-orm.md) - работа с БД

### Для тестирования
1. [`testing/vitest.md`](./dependencies/testing/vitest.md) - Unit/Integration тесты
2. [`testing/playwright.md`](./dependencies/testing/playwright.md) - E2E тесты
3. [`testing/testing-library.md`](./dependencies/testing/testing-library.md) - React тесты

### Для UI разработки
1. [`ui/tailwindcss.md`](./dependencies/ui/tailwindcss.md) - Стилизация
2. [`ui/radix-ui.md`](./dependencies/ui/radix-ui.md) - Headless components
3. [`ui/class-variance-authority.md`](./dependencies/ui/class-variance-authority.md) - Варианты

## Дополнительные ресурсы

В корне проекта также доступны:
- `CLAUDE.md` - Полные инструкции для Claude Code
- `ANOTATION.md` - Детальные заметки по тестированию (Luiz Otávio)
- `STORYBOOK.md` - Setup guide для Storybook

## Как использовать эту документацию

### Изучение архитектуры
```bash
# 1. Прочитайте главный обзор
cat docs/PROJECT_OVERVIEW.md

# 2. Изучите конкретные технологии
cat docs/dependencies/framework/nextjs.md
cat docs/dependencies/database/drizzle-orm.md
```

### Поиск по документации
```bash
# Найти информацию о Server Actions
grep -r "Server Actions" docs/

# Найти примеры useActionState
grep -r "useActionState" docs/
```

## Особенности документации

✅ **Практические примеры** - все примеры взяты из реального кода проекта
✅ **Code snippets** - готовые к использованию фрагменты кода
✅ **Best practices** - рекомендации и паттерны
✅ **Ссылки на официальную документацию** - для глубокого погружения
✅ **TypeScript first** - все примеры с типизацией

## Обновление документации

Эта документация была создана **2025-10-21** на основе:
- Изучения архитектуры проекта
- Анализа конфигурационных файлов
- Официальной документации Next.js/Vercel
- Общих знаний о библиотеках

Для актуализации конкретной зависимости обратитесь к официальной документации (ссылки в конце каждого файла).

## Контакты

Автор проекта: **Luiz Otávio Miranda** ([GitHub](https://github.com/luizomf))

---

**Создано с помощью:** Claude Code
**Дата:** 2025-10-21
