import { CreateTodoAction } from '@/core/todo/actions/todo.action.types';
import { Todo } from '@/core/todo/schemas/todo.contract';
import { sanitizeStr } from '@/utils/sanitize-str';
import { useActionState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import z from 'zod';
import { useOptimisticTodos } from './useOptimisticTodos';

const formSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, { message: 'Task must not be empty!' })
    .max(200, { message: 'Task must not be more 200 letters!' })
    .transform(sanitizeStr),
});

type FormState = {
  success: boolean;
  issues?: z.core.$ZodIssue[];
  data: { description: string };
};

const initialState: FormState = {
  success: true,
  issues: undefined,
  data: { description: '' },
};

export type UseTodoCreateProps = {
  action: CreateTodoAction;
  todos: Todo[];
  onSuccess?: (description: string) => void;
};

export function useTodoCreate({ action, todos, onSuccess }: UseTodoCreateProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [optimisticTodos, updateOptimisticTodos] = useOptimisticTodos(todos);

  const [state, formAction, isPending] = useActionState(
    async (_: FormState, formData: FormData): Promise<FormState> => {
      const raw = formData.get('description') as string;
      const parsed = formSchema.safeParse({ description: raw });

      if (!parsed.success) {
        return {
          success: false,
          issues: parsed.error.issues,
          data: { description: raw },
        };
      }
      const parsedDescription = parsed.data.description;
      const tempId = `temp-${Date.now()}`;
      updateOptimisticTodos({
        type: 'add',
        todo: {
          id: tempId,
          description: parsedDescription,
          createdAt: new Date().toISOString(),
        },
      });

      const result = await action(parsedDescription);
      updateOptimisticTodos({ type: 'delete', id: tempId });

      if (!result.success) {
        toast.error('Failed to create task', {
          description: result.errors.join(', '),
        });

        // Converted  server errors to ZodIssue format
        return {
          success: false,
          issues: result.errors.map((err) => ({
            code: 'custom' as const,
            path: ['description'],
            message: err,
          })),
          data: { description: raw },
        };
      }

      toast.success('Tast created', { description: parsedDescription });
      onSuccess?.(parsedDescription);
      formRef.current?.reset();

      return initialState;
    },
    initialState
  );

  // Auto-focus
  useEffect(() => {
    if (state.success && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state.success]);

  // Keyboard shortcut: Cmd/Ctrl + K for focus

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    formRef,
    inputRef,
    formAction,
    isPending,
    issues: state.issues,
    description: state.data.description,
    optimisticTodos,
  };
}
