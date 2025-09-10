// import { InferSelectModel } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const todoTable = sqliteTable("todo", {
    id: text("id").primaryKey(),
    describtion: text("describtion").notNull(),
    createdAt: text("created_at").notNull()
});

// export type TodoTable = InferSelectModel<typeof todoTable>