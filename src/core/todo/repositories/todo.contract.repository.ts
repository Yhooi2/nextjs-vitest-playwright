import { Todo, TodoPresenter } from '../schemas/todo.contract';

export interface FindAllTodoRepository {
  findAll: () => Promise<Todo[]>;
}
interface FindTodoByIdRepository {
  findById: (id: string) => Promise<Todo | undefined>;
}

export interface CreateTodoRepository {
  create: (todo: Todo) => Promise<TodoPresenter>;
}
export interface UpdateTodoRepository {
  update: (id: string, todo: Partial<Todo>) => Promise<TodoPresenter>;
}

export interface DeleteTodoRepository {
  delete: (id: string) => Promise<TodoPresenter>;
}

export interface TodoRepository
  extends FindAllTodoRepository,
    FindTodoByIdRepository,
    CreateTodoRepository,
    UpdateTodoRepository,
    DeleteTodoRepository {}
