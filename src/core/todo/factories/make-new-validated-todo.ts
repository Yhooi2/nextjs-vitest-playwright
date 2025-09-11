import { sanitizeStr } from '@/utils/sanitize-str';
import { TodoPresenter } from '../schemas/todo.contract';
import { validateTodoDescription } from '../schemas/validate-todo-description';
import { makeNewTodo } from './make-new-todo';

export function makeNewValidatedTodo(description: string): TodoPresenter {
  const clearDescription = sanitizeStr(description);
  const result = validateTodoDescription(clearDescription);

  if (result.success) {
    return {
      success: true,
      todo: makeNewTodo(clearDescription),
    };
  }
  return {
    success: false,
    errors: result.errors,
  };
}
