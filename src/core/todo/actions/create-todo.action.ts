import { revalidatePath } from 'next/cache';
import { TodoPresenter } from '../schemas/todo.contract';
import { CreateTodoUseCase } from '../usecases/create-todo.usecase';

export async function createTodoAction(description: string): Promise<TodoPresenter> {
  'use server';

  const createResult = await CreateTodoUseCase(description);
  if (createResult.success) revalidatePath('/');
  return createResult;
}
