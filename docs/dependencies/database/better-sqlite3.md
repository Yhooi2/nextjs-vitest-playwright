# better-sqlite3

## Версия в проекте
`12.2.0`

## Описание
better-sqlite3 - это синхронный SQLite3 драйвер для Node.js с отличной производительностью.

## Использование в проекте

См. `docs/dependencies/database/drizzle-orm.md` для примеров интеграции.

```typescript
import Database from 'better-sqlite3';

const sqlite = new Database('path/to/database.db');
const db = drizzle(sqlite, { schema });
```

## Окружения
- `development`: `dev.db.sqlite3`
- `production`: `prod.db.sqlite3`
- `test`: `.int.test.db.sqlite3`
- `e2e`: `e2e.test.db.sqlite3`

## Ссылки
- [better-sqlite3 Docs](https://github.com/WiseLibs/better-sqlite3)
