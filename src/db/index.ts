import { todoTable } from '@/core/todo/schemas/drizzle-todo-table-schema';
import { getFullEnv } from '@/env/configs';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as fs from 'fs';
import * as path from 'path';

const makeDrizzle = () => {
  const { databaseFile, drizzleMigrationsFolder, currentEnv } = getFullEnv();

  // Debug logs removed

  const sqliteDataBase = new Database(databaseFile);
  const db = drizzle(sqliteDataBase, {
    schema: { todo: todoTable },
  });

  // Apply migrations in development too
  if (['development', 'test', 'e2e'].includes(currentEnv)) {
    console.log('Running database migrations...');
    const journalPath = path.join(drizzleMigrationsFolder, 'meta/_journal.json');
    try {
      migrate(db, { migrationsFolder: drizzleMigrationsFolder });
      console.log('Migrations applied successfully');
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }
  return db;
};

declare global {
  // eslint-disable-next-line no-var
  var __DB__: DrizzleDb;
}

if (!global.__DB__) {
  global.__DB__ = makeDrizzle();
}

export const drizzleDb = { db: global.__DB__, todoTable };
export type DrizzleDb = ReturnType<typeof makeDrizzle>;
