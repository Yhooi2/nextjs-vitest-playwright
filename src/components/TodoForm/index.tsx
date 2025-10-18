'use client';

import { CreateTodoAction } from '@/core/todo/actions/todo.action.types';
import { Todo } from '@/core/todo/schemas/todo.contract';
import { useTodoCreate } from '@/hooks/useTodoCreate';
import { TaskInput } from '../TaskInput';

export type TodoFormProps = {
  action: CreateTodoAction;
  todos: Todo[];
  onSuccess?: (description: string) => void;
};

export function TodoForm({ action, todos, onSuccess }: TodoFormProps) {
  const { formRef, inputRef, formAction, isPending, description, issues } = useTodoCreate({
    action,
    todos,
    onSuccess,
  });

  return (
    <form ref={formRef} action={formAction}>
      <TaskInput
        ref={inputRef}
        label="New Task"
        defaultValue={description}
        disabled={isPending}
        issues={issues}
        placeholder="Add new task... (⌘K to focus)"
      />
    </form>
  );
}
