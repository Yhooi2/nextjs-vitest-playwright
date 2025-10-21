# Drizzle Kit

## Версия в проекте
`0.31.5`

## Описание
Drizzle Kit - это CLI для управления миграциями Drizzle ORM.

## Commands

```bash
# Generate migrations
npm run drizzle:generate

# Apply migrations (dev)
npm run drizzle:migrate:dev

# Apply migrations (prod)
npm run drizzle:migrate:prod
```

## Конфигурация

См. `drizzle.config.ts`:

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle/migrations',
  schema: './src/core/*/schemas/drizzle-*.ts',
  dialect: 'sqlite',
  dbCredentials: { url: 'dev.db.sqlite3' },
});
```

## Workflow

1. Измените схему в `src/core/*/schemas/drizzle-*.ts`
2. `npm run drizzle:generate` - создаст SQL миграцию
3. `npm run drizzle:migrate:dev` - применит миграцию

## Ссылки
- [Drizzle Kit Docs](https://orm.drizzle.team/kit-docs/overview)
