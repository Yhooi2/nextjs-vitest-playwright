import { TodoListProps } from '@/components/TodoList';
import { Todo } from '@/core/todo/schemas/todo.contract';
import { sanitizeStr } from '@/utils/sanitize-str';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useOptimisticTodos } from './useOptimisticTodos';

const CANCEL_TOAST = 500;
const DELETE_DELAY = 5000;

type PendingDeletion = {
  todo: Todo;
  toastId: string | number;
  restorable: boolean;
};

export function useTodoDelete({ action, todos }: TodoListProps) {
  const pendingDeletions = useRef<Map<string, PendingDeletion>>(new Map());
  const [optimisticTodos, updateOptimisticTodos] = useOptimisticTodos(todos);

  // Clear after close
  useEffect(() => {
    const deletionsMap = pendingDeletions.current;
    return () => deletionsMap.clear();
  }, []);

  function cancelDeletion(todoId: string) {
    console.log('click Undo');
    const pending = pendingDeletions.current.get(todoId);
    if (!pending) return;
    pending.restorable = false;

    pendingDeletions.current.delete(todoId);
    updateOptimisticTodos({ type: 'add', todo: pending.todo });
    toast.info('Action cancelled', {
      id: pending.toastId,
      description: 'Task restored successfully',
      duration: CANCEL_TOAST,
    });
  }

  async function handleTodoDelete(todo: Todo) {
    const cleanId = sanitizeStr(todo.id);
    console.log('click Close');
    if (!cleanId) return;
    console.log('id is right, start deleting...');
    updateOptimisticTodos({ type: 'delete', id: cleanId });
    const toastId = toast.success('Task deleted', {
      description: todo.description,
      duration: DELETE_DELAY,
      action: {
        label: 'Undo',
        onClick: () => cancelDeletion(cleanId),
      },
    });
    pendingDeletions.current.set(cleanId, { todo, toastId, restorable: true });
    console.log('task deleting');
    try {
      const result = await action(cleanId);
      if (!result.success) {
        console.log('action failed');

        const pending = pendingDeletions.current.get(cleanId);
        if (pending?.restorable) updateOptimisticTodos({ type: 'add', todo });

        toast.error('Failed to delete task', {
          id: toastId,
          description: result.errors[0],
        });
        return;
      }
      console.log('action success');
    } catch (error) {
      console.log('action failed Unknown error');
      updateOptimisticTodos({ type: 'add', todo });
      toast.error('Failed to delete task', {
        id: toastId,
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setTimeout(() => {
        pendingDeletions.current.delete(cleanId);
      }, DELETE_DELAY);
    }
  }
  return { optimisticTodos, handleTodoDelete };
}
