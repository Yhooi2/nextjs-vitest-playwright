import { makeUpdateValidatedTodo } from '../factories/make-update-validated-todo';
import { defaultRepository } from '../repositories/default.repository';
import { Todo, TodoPresenter } from '../schemas/todo.contract';

export async function updateTodoUseCase(
  id: string,
  updateTodo: Partial<Todo>
): Promise<TodoPresenter> {
  const validResult = makeUpdateValidatedTodo(updateTodo);
  if (!validResult.success) return validResult;
  const result = defaultRepository.update(id, validResult.todo);
  return result;
}
