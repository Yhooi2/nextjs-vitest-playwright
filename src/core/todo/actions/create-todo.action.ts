'use server';

import { revalidatePath } from 'next/cache';
import { TodoPresenter } from '../schemas/todo.contract';
import { createTodoUseCase } from '../usecases/create-todo.usecase';

export async function createTodoAction(description: string): Promise<TodoPresenter> {
  const createResult = await createTodoUseCase(description);
  if (createResult.success) revalidatePath('/');
  return createResult;
}
