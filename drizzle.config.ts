import { getFullEnv } from "@/env/configs";
import { defineConfig } from "drizzle-kit";

const {databaseFile, drizzleMigrateFolder, drizzleSchemaFiles} = getFullEnv();
export default defineConfig({
  dialect: "sqlite",
  schema: drizzleSchemaFiles,
  out: drizzleMigrateFolder,
  dbCredentials: {
    url: databaseFile,
  },
});