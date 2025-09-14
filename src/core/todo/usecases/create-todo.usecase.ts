import { makeNewValidatedTodo } from '../factories/make-new-validated-todo';
import { defaultRepository } from '../repositories/default.repository';

export async function CreateTodoUseCase(description: string) {
  const validResult = makeNewValidatedTodo(description);
  if (!validResult.success) return validResult;
  const result = await defaultRepository.create(validResult.todo);
  return result;
}
