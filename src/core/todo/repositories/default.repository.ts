import { drizzleDb } from '@/db';
import { DrizzleTodoRepository } from './drizzle-todo.repository';
import { TodoRepository } from './todo.contract.repository';

export const defaultRepository: TodoRepository = new DrizzleTodoRepository(drizzleDb.db);
