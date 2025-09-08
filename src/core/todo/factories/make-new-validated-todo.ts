import { sanitizeStr } from '@/utils/sanitize-str';
import { MakeValidateTodo } from '../schemas/todo.contract';
import { validateTodoDescription } from '../schemas/validate-todo-description';
import { makeNewTodo } from './make-new-todo';

export function makeNewValidatedTodo(description: string): MakeValidateTodo {
  const clearDescription = sanitizeStr(description);
  const result = validateTodoDescription(clearDescription);

  if (result.seccess) {
    return {
      seccess: true,
      data: makeNewTodo(clearDescription),
    };
  }
  return {
    seccess: false,
    errors: result.errors,
  };
}
