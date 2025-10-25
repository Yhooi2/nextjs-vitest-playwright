import { DrizzleTodoRepository } from '@/core/todo/repositories/drizzle-todo.repository';
import { Todo } from '@/core/todo/schemas/todo.contract';
import { drizzleDb } from '@/db';

export const makeTestTodos = () => {
  const newTodo = new Array<Todo>();
  for (let i = 0; i < 5; ++i) {
    const si = i.toString();
    newTodo.push({ id: si, description: 'descreption' + si, createdAt: si, deletedAt: null });
  }
  return newTodo;
};
export const makeTestTodosDeleted = () => {
  const newTodo = new Array<Todo>();
  for (let i = 0; i < 5; ++i) {
    const si = i.toString();
    newTodo.push({ id: si, description: 'description' + si, createdAt: 'any', deletedAt: si });
  }
  return newTodo;
};
export async function makeTodosRepository(fn: () => Array<Todo> = makeTestTodos) {
  const { db, todoTable } = drizzleDb;
  const repository = new DrizzleTodoRepository(db);
  const todos = fn();

  const insertTodoDb = () => db.insert(todoTable);
  const updateTodoDb = () => db.update(todoTable);
  const clearDb = () => db.delete(todoTable);

  return { repository, insertTodoDb, updateTodoDb, clearDb, todos };
}

export const insertTestTodos = async () => {
  const { todos, insertTodoDb } = await makeTodosRepository(makeTestTodos);

  await insertTodoDb().values(todos);
  return todos;
};
export const insertTestTodosDeleted = async () => {
  const { todos, insertTodoDb } = await makeTodosRepository(makeTestTodosDeleted);

  await insertTodoDb().values(todos);
  return todos;
};
