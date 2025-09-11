import { DrizzleDb } from '@/db/drizzle/migrations';
import { eq } from 'drizzle-orm';
import { todoTable } from '../schemas/drizzle-todo-table-schema';
import { Todo, TodoPresenter } from '../schemas/todo.contract';
import { TodoRepository } from './todo.contract.repository';

export class DrizzleTodoRepository implements TodoRepository {
  private readonly db: DrizzleDb;
  constructor(db: DrizzleDb) {
    this.db = db;
  }
  // Implement the methods defined in the TodoRepository interface
  async findAll(): Promise<Todo[]> {
    return this.db.query.todo.findMany({
      orderBy: (todo, { desc }) => [desc(todo.createdAt), desc(todo.description)],
    });
  }
  async findById(id: string): Promise<Todo | undefined> {
    return this.db.query.todo.findFirst({
      where: (todo, { eq }) => eq(todo.id, id),
    });
  }

  async create(todo: Todo): Promise<TodoPresenter> {
    const foundTodo = await this.findById(todo.id);
    if (foundTodo) {
      return {
        success: false,
        errors: ['Todo with this ID already exists'],
      };
    }

    await this.db.insert(todoTable).values(todo);
    return { success: true, todo };
  }

  async delete(id: string): Promise<TodoPresenter> {
    const foundTodo = await this.findById(id);
    if (!foundTodo) {
      return {
        success: false,
        errors: ['Todo with this ID does not exist'],
      };
    }
    await this.db.delete(todoTable).where(eq(todoTable.id, id));
    return {
      success: true,
      todo: foundTodo,
    };
  }
}
