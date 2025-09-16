import { sanitizeStr } from '@/utils/sanitize-str';
import { defaultRepository } from '../repositories/default.repository';
import { TodoPresenter } from '../schemas/todo.contract';

export async function deleteTodoUseCase(id: string): Promise<TodoPresenter> {
  const cleanId = sanitizeStr(id);
  if (!cleanId) return { success: false, errors: ['Invalid ID'] };
  return defaultRepository.delete(id);
}
