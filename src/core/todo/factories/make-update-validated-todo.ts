import { sanitizeStr } from '@/utils/sanitize-str';
import { InvalidTodo, Todo, ValidUpdateTodo } from '../schemas/todo.contract';
import { validateTodoDescription } from '../schemas/validate-todo-description';

export function makeUpdateValidatedTodo(updateTodo: Partial<Todo>): InvalidTodo | ValidUpdateTodo {
  if (updateTodo.description !== undefined) {
    const clearDescription = sanitizeStr(updateTodo.description);
    const result = validateTodoDescription(clearDescription);
    if (!result.success)
      return {
        success: false,
        errors: result.errors,
      };
    updateTodo.description = clearDescription;
  }

  if (updateTodo.id) {
    delete updateTodo.id;
  }

  if (updateTodo.createdAt) {
    delete updateTodo.createdAt;
  }

  return {
    success: true,
    todo: updateTodo,
  };
}
