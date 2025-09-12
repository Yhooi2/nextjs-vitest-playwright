import { DrizzleTodoRepository } from '@/core/todo/repositories/drizzle-todo.repository';
import { Todo } from '@/core/todo/schemas/todo.contract';
import { drizzleDb } from '@/db';

export async function makeHelpersTodoRepository() {
  const { db, todoTable } = drizzleDb;
  const repository = new DrizzleTodoRepository(db);

  const insertTodoDb = () => db.insert(todoTable);
  const clearDb = () => db.delete(todoTable);

  const insertTodos = async () => {
    const todos = new Array<Todo>();
    for (let i = 0; i < 5; ++i) {
      const si = i.toString();
      todos.push({ id: si, description: 'descreption' + si, createdAt: si });
    }
    await insertTodoDb().values(todos);
    return todos.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  };
  const todo = { id: '0', description: 'test', createdAt: new Date().toISOString() };
  const successResult = { success: true, todo };

  return { repository, insertTodoDb, clearDb, insertTodos, todo, successResult };
}
