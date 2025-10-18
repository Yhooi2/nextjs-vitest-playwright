import { Todo } from '@/core/todo/schemas/todo.contract';
import { useOptimistic } from 'react';

type OptimisticAction = { type: 'delete'; id: string } | { type: 'add'; todo: Todo };

export function useOptimisticTodos(todos: Todo[]) {
  return useOptimistic(todos, (state, action: OptimisticAction) =>
    action.type === 'delete'
      ? state.filter((todo) => todo.id !== action.id)
      : [...state, action.todo]
  );
}
