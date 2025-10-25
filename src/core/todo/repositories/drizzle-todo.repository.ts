import { DrizzleDb } from '@/db';
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
  async findAllActive(): Promise<Todo[]> {
    return this.db.query.todo.findMany({
      where: (todo, { isNull }) => isNull(todo.deletedAt),
      orderBy: (todo, { desc }) => [desc(todo.createdAt), desc(todo.description)],
    });
  }
  async findAllDeleted(): Promise<Todo[]> {
    return this.db.query.todo.findMany({
      where: (todo, { isNotNull }) => isNotNull(todo.deletedAt),
      orderBy: (todo, { desc }) => [desc(todo.deletedAt), desc(todo.deletedAt)],
    });
  }
  async findById(id: string): Promise<Todo | undefined> {
    return this.db.query.todo.findFirst({
      where: (todo, { eq }) => eq(todo.id, id),
    });
  }
  async findByDescription(description: string): Promise<Todo | undefined> {
    return this.db.query.todo.findFirst({
      where: (todo, { eq }) => eq(todo.description, description),
    });
  }

  async create(todo: Todo): Promise<TodoPresenter> {
    const foundTodoById = await this.findById(todo.id);
    if (foundTodoById) {
      return {
        success: false,
        errors: ['Todo with this ID already exists'],
      };
    }

    const foundTodoByDescription = await this.findByDescription(todo.description);
    if (foundTodoByDescription) {
      return {
        success: false,
        errors: ['Todo with this description already exists'],
      };
    }

    await this.db.insert(todoTable).values(todo);
    return { success: true, todo };
  }
  async update(id: string, todo: Partial<Todo>): Promise<TodoPresenter> {
    const foundTodo = await this.findById(id);
    if (!foundTodo) {
      return {
        success: false,
        errors: ['Todo with this ID does not exist'],
      };
    }
    await this.db.update(todoTable).set(todo).where(eq(todoTable.id, id));
    const updateTodo = await this.findById(id);
    return {
      success: true,
      todo: updateTodo!,
    };
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
