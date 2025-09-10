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
