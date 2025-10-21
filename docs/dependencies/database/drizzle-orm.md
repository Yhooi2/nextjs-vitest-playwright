# Drizzle ORM

## Версия в проекте
`0.44.4`

## Описание
Drizzle ORM - это TypeScript-first ORM для SQL баз данных с отличной типизацией и производительностью.

## Использование в проекте

### Database Setup
Файл `src/db/index.ts`:

```typescript
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { todoTable } from '@/core/todo/schemas/drizzle-todo-table-schema';

const makeDrizzle = () => {
  const { databaseFile, drizzleMigrationsFolder, currentEnv } = getFullEnv();

  const sqliteDataBase = new Database(databaseFile);
  const db = drizzle(sqliteDataBase, {
    schema: { todo: todoTable },
  });

  // Auto-migrate in development/test/e2e
  if (['development', 'test', 'e2e'].includes(currentEnv)) {
    console.log('Running database migrations...');
    try {
      migrate(db, { migrationsFolder: drizzleMigrationsFolder });
      console.log('Migrations applied successfully');
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }
  return db;
};

// Singleton pattern
declare global {
  var __DB__: DrizzleDb;
}

if (!global.__DB__) {
  global.__DB__ = makeDrizzle();
}

export const drizzleDb = { db: global.__DB__, todoTable };
export type DrizzleDb = ReturnType<typeof makeDrizzle>;
```

### Schema Definition
Файл `src/core/todo/schemas/drizzle-todo-table-schema.ts`:

```typescript
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const todoTable = sqliteTable('todo', {
  id: text('id').primaryKey().notNull(),
  description: text('description').unique().notNull(),
  createdAt: text('created_at').notNull(),
});
```

### Repository Pattern
Файл `src/core/todo/repositories/drizzle-todo.repository.ts`:

```typescript
import { DrizzleDb } from '@/db';
import { eq } from 'drizzle-orm';
import { todoTable } from '../schemas/drizzle-todo-table-schema';
import { Todo, TodoPresenter } from '../schemas/todo.contract';
import { TodoRepository } from './todo.contract.repository';

export class DrizzleTodoRepository implements TodoRepository {
  private readonly db: DrizzleDb;

  constructor(db: DrizzleDb) {
    this.db = db;
  }

  async findAll(): Promise<Todo[]> {
    return this.db.query.todo.findMany({
      orderBy: (todo, { desc }) => [desc(todo.createdAt), desc(todo.description)],
    });
  }

  async findById(id: string): Promise<Todo | undefined> {
    return this.db.query.todo.findFirst({
      where: (todo, { eq }) => eq(todo.id, id),
    });
  }

  async findByDescription(description: string): Promise<Todo | undefined> {
    return this.db.query.todo.findFirst({
      where: (todo, { eq }) => eq(todo.description, description),
    });
  }

  async create(todo: Todo): Promise<TodoPresenter> {
    const foundTodoById = await this.findById(todo.id);
    if (foundTodoById) {
      return {
        success: false,
        errors: ['Todo with this ID already exists'],
      };
    }

    const foundTodoByDescription = await this.findByDescription(todo.description);
    if (foundTodoByDescription) {
      return {
        success: false,
        errors: ['Todo with this description already exists'],
      };
    }

    await this.db.insert(todoTable).values(todo);
    return { success: true, todo };
  }

  async delete(id: string): Promise<TodoPresenter> {
    const foundTodo = await this.findById(id);
    if (!foundTodo) {
      return {
        success: false,
        errors: ['Todo with this ID does not exist'],
      };
    }

    await this.db.delete(todoTable).where(eq(todoTable.id, id));
    return { success: true, todo: foundTodo };
  }
}
```

## Drizzle Kit

### Конфигурация
Файл `drizzle.config.ts`:

```typescript
import { getFullEnv } from '@/env/configs';
import { defineConfig } from 'drizzle-kit';

const { databaseFile, drizzleMigrationsFolder, drizzleSchemaFiles } = getFullEnv();

const config = defineConfig({
  out: drizzleMigrationsFolder,
  schema: drizzleSchemaFiles,
  dialect: 'sqlite',
  dbCredentials: {
    url: databaseFile,
  },
});

export default config;
```

### Scripts
```json
{
  "scripts": {
    "drizzle:generate": "dotenv -e .env.development -- drizzle-kit generate",
    "drizzle:migrate:dev": "dotenv -e .env.development -- drizzle-kit migrate",
    "drizzle:migrate:prod": "dotenv -e .env.production -- drizzle-kit migrate"
  }
}
```

## Основные операции

### Query
```typescript
// Find all with ordering
const todos = await db.query.todo.findMany({
  orderBy: (todo, { desc }) => [desc(todo.createdAt)],
});

// Find one with conditions
const todo = await db.query.todo.findFirst({
  where: (todo, { eq }) => eq(todo.id, '123'),
});
```

### Insert
```typescript
await db.insert(todoTable).values({
  id: 'uuid-here',
  description: 'New todo',
  createdAt: new Date().toISOString(),
});
```

### Update
```typescript
import { eq } from 'drizzle-orm';

await db
  .update(todoTable)
  .set({ description: 'Updated description' })
  .where(eq(todoTable.id, '123'));
```

### Delete
```typescript
import { eq } from 'drizzle-orm';

await db
  .delete(todoTable)
  .where(eq(todoTable.id, '123'));
```

## Миграции

### Создание миграции
```bash
npm run drizzle:generate
```

Это создаст SQL файл в `drizzle/migrations/` на основе изменений в схеме.

### Применение миграций
```bash
# Development
npm run drizzle:migrate:dev

# Production
npm run drizzle:migrate:prod
```

### Автоматические миграции
Проект настроен на автоматические миграции в dev/test/e2e режимах:

```typescript
if (['development', 'test', 'e2e'].includes(currentEnv)) {
  migrate(db, { migrationsFolder: drizzleMigrationsFolder });
}
```

## Environment Configuration

Проект использует разные БД для разных окружений:

```typescript
const envConfigs = {
  development: { databaseFile: 'dev.db.sqlite3' },
  production: { databaseFile: 'prod.db.sqlite3' },
  test: { databaseFile: '.int.test.db.sqlite3' },
  e2e: { databaseFile: 'e2e.test.db.sqlite3' }
};
```

## Type Safety

Drizzle обеспечивает полную типизацию:

```typescript
// Типы выводятся автоматически
const todo: Todo = await db.query.todo.findFirst(...);

// IntelliSense для всех полей
await db.insert(todoTable).values({
  id: 'uuid',           // ✓ string
  description: 'text',  // ✓ string
  createdAt: '2024-...' // ✓ string
  // wrongField: 'value' // ✗ Type error
});
```

## Querying Operators

```typescript
import { eq, ne, gt, lt, gte, lte, like, and, or } from 'drizzle-orm';

// Equals
where: (todo, { eq }) => eq(todo.id, '123')

// Not equals
where: (todo, { ne }) => ne(todo.id, '123')

// Like
where: (todo, { like }) => like(todo.description, '%important%')

// And/Or
where: (todo, { and, eq, like }) => and(
  eq(todo.id, '123'),
  like(todo.description, '%task%')
)
```

## Best Practices в проекте

### 1. Repository Pattern
- Инкапсуляция всей работы с БД
- Контракты (interfaces) для абстракции
- Singleton экземпляр repository

### 2. Singleton Database Connection
```typescript
// Global singleton для переиспользования соединения
if (!global.__DB__) {
  global.__DB__ = makeDrizzle();
}
```

### 3. Auto-migrations в Development
- Миграции применяются автоматически при старте
- Отдельные БД для test/e2e окружений
- Очистка БД в `afterEach` хуках тестов

### 4. Type-safe Queries
- Использование `db.query` API для читаемости
- Типизированные where conditions
- Автоматический вывод типов

## Relational Queries

Drizzle поддерживает реляционные запросы (relationships):

```typescript
// Define relations in schema
export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
});

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  userId: integer('user_id').references(() => users.id),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));

// Query with relations
const usersWithPosts = await db.query.users.findMany({
  with: {
    posts: true,
  },
});
```

## Transactions

Drizzle поддерживает транзакции для атомарных операций:

```typescript
await db.transaction(async (tx) => {
  await tx.insert(todoTable).values(newTodo);
  await tx.update(userTable).set({ todoCount: count + 1 });
});
```

## Prepared Statements

Для повышения производительности используйте prepared statements:

```typescript
const getTodoById = db.query.todo
  .findFirst({
    where: (todo, { eq }) => eq(todo.id, sql.placeholder('id')),
  })
  .prepare();

// Reuse prepared statement
const todo = await getTodoById.execute({ id: '123' });
```

## Полезные ссылки

- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)
- [SQLite dialect](https://orm.drizzle.team/docs/get-started-sqlite)
- [Queries](https://orm.drizzle.team/docs/rqb)
- [better-sqlite3 driver](https://orm.drizzle.team/docs/get-started-sqlite#better-sqlite3)
