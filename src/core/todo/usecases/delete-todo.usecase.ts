import { sanitizeStr } from '@/utils/sanitize-str';
import { defaultRepository } from '../repositories/default.repository';

export async function deleteTodoUseCase(id: string) {
  const cleanId = sanitizeStr(id);
  if (!cleanId) return { success: false, error: 'Invalid ID' };
  return defaultRepository.delete(id);
}
