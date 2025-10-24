import { TodoTable } from './drizzle-todo-table-schema';

export type Todo = TodoTable;

export type InvalidTodo = {
  success: false;
  errors: string[];
};
export type ValidTodo = {
  success: true;
  todo: Todo;
};
export type ValidUpdateTodo = {
  success: true;
  todo: Partial<Todo>;
};

export type TodoPresenter = InvalidTodo | ValidTodo;

export type ValidateTodoDescription = {
  success: boolean;
  errors: string[];
};
