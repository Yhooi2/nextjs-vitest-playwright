'use server';

import { revalidatePath } from 'next/cache';
import { deleteTodoUseCase } from '../usecases/delete-todo.usecase';

export async function deleteTodoAction(id: string) {
  const deleteResult = await deleteTodoUseCase(id);
  if (deleteResult.success) revalidatePath('/');
  return deleteResult;
}
