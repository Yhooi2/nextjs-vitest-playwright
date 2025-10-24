## Unreleased

- feat(todo): add `deleted_at` column and align Drizzle schema
  - Migration: `src/db/drizzle/migrations/0001_living_gamma_corps.sql` (ALTER TABLE `todo` ADD `deleted_at` text;)
  - Files changed: `src/core/todo/schemas/drizzle-todo-table-schema.ts`, migration above, tests updated if needed
  - Notes: Create a backup tag `before-todo-migration` before making large changes. Open PR `feat/todo-deleted-at` and run migrations locally: `npm run drizzle:migrate:dev` then verify with `sqlite3 dev.db.sqlite3 ".schema todo"` or `.schema todos` depending on table name.

---

<!--
Replace the migration name above with the exact migration filename if it differs.
Add the PR URL here after opening the PR.
-->
