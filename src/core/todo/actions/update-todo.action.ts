'use server';

import { revalidatePath } from 'next/cache';
import { Todo, TodoPresenter } from '../schemas/todo.contract';
import { updateTodoUseCase } from '../usecases/update-todo.usecase';

export async function updateTodoAction(
  id: string,
  updateTodo: Partial<Todo>
): Promise<TodoPresenter> {
  const updateResult = await updateTodoUseCase(id, updateTodo);
  if (updateResult.success) revalidatePath('/');
  return updateResult;
}

// Wrappers
export async function deleteSelfTodoAction(id: string) {
  const deletedAt = new Date().toISOString();
  return updateTodoAction(id, { deletedAt });
}
export async function restoreTodoAction(id: string) {
  return updateTodoAction(id, { deletedAt: null });
}
