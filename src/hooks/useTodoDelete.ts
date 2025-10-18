import { TodoListProps } from '@/components/TodoList';
import { Todo } from '@/core/todo/schemas/todo.contract';
import { sanitizeStr } from '@/utils/sanitize-str';
import { useEffect, useOptimistic, useRef } from 'react';
import { toast } from 'sonner';

const DELETE_DELAY = 5000;
const CANCEL_TOAST = 500;

type PendingDeletion = {
  todo: Todo;
  timeoutId: NodeJS.Timeout;
  toastId: string | number;
};
type OptimisticAction = { type: 'delete'; id: string } | { type: 'restore'; todo: Todo };

export function useTodoDelete({ action, todos }: TodoListProps) {
  const pendingDeletions = useRef<Map<string, PendingDeletion>>(new Map());
  const [optimisticTodos, updateOptimisticTodos] = useOptimistic(
    todos,
    (state, action: OptimisticAction) =>
      action.type === 'delete'
        ? state.filter((todo) => todo.id !== action.id)
        : [...state, action.todo]
  );

  useEffect(() => {
    const deletionsMap = pendingDeletions.current;
    return () => {
      deletionsMap.forEach(({ timeoutId }) => {
        clearTimeout(timeoutId);
      });
      deletionsMap.clear();
    };
  }, []);
  function cancelDeletion(todoId: string) {
    // ?
    const pending = pendingDeletions.current.get(todoId);
    if (!pending) return;
    clearTimeout(pending.timeoutId);
    pendingDeletions.current.delete(todoId);
    updateOptimisticTodos({ type: 'restore', todo: pending.todo });
    toast.dismiss(pending.toastId);
    toast.info('Action cancelled', {
      id: pending.toastId,
      description: 'Task restored seccessfully',
      duration: CANCEL_TOAST,
      action: {
        label: 'Close',
        onClick: () => toast.dismiss(pending.toastId),
      },
    });
  }

  async function executeDeletion(todoId: string, todo: Todo) {
    const cleanId = sanitizeStr(todoId);
    if (!cleanId) return;
    try {
      const result = await action(cleanId);
      if (!result.success) {
        updateOptimisticTodos({ type: 'restore', todo });

        toast.error('Failed to delete task', {
          description: result.errors[0],
        });
        return;
      }
    } catch (error) {
      updateOptimisticTodos({ type: 'restore', todo });
      toast.error('Failed to delete task', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      pendingDeletions.current.delete(todoId);
    }
  }

  async function handleTodoDelete(todo: Todo) {
    const cleanId = sanitizeStr(todo.id);
    if (!cleanId) return;
    updateOptimisticTodos({ type: 'delete', id: cleanId });
    const timeoutId = setTimeout(() => {
      executeDeletion(cleanId, todo);
    }, DELETE_DELAY);

    const toastId = toast.success('Task deleted', {
      description: todo.description,
      duration: DELETE_DELAY,
      action: {
        label: 'Undo',
        onClick: () => cancelDeletion(cleanId),
      },
    });
    pendingDeletions.current.set(cleanId, { todo, timeoutId, toastId });
  }
  return { optimisticTodos, handleTodoDelete };
}
