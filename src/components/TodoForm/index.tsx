'use client';

import { CreateTodoAction } from '@/core/todo/actions/todo.action.types';
import { sanitizeStr } from '@/utils/sanitize-str';
import { CirclePlusIcon } from 'lucide-react';
import { useActionState } from 'react';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Field } from './field';

const formSchema = z.object({
  description: z.string().min(1, { message: 'Task must not be empty!' }).transform(sanitizeStr),
});

type FormState = { success: boolean; errors: string[]; data: { description: string } };

export type TodoFormProps = {
  action: CreateTodoAction;
};

export function TodoForm({ action }: TodoFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (_: FormState, formData: FormData): Promise<FormState> => {
      const raw = formData.get('description') as string;
      const parsed = formSchema.safeParse({ description: raw });
      if (!parsed.success) {
        return {
          success: false,
          errors: parsed.error.issues.map((err) => err.message),
          data: { description: raw },
        };
      }
      const result = await action(parsed.data.description);
      if (!result.success) return { ...result, data: { description: raw } };
      return { success: true, errors: [], data: { description: '' } } as FormState;
    },
    { success: false, errors: [], data: { description: '' } } as FormState
  );

  const isInvalid = !state.success && state.errors.length > 0;
  return (
    <form action={formAction} className="flex flex-col flex-1 gap-6">
      <Field data-invalid={isInvalid}>
        <Input
          name="description"
          labelText="Task"
          placeholder="Input task"
          disabled={isPending}
          aria-invalid={isInvalid}
          errorMessage={state?.errors[0]}
          defaultValue={state.data.description}
        />
        {/* <FieldDescription>Enter a description for your new task.</FieldDescription> */}
        {/* {isInvalid && <FieldError>{state.errors[0]}</FieldError>} */}
      </Field>
      <Button type="submit" disabled={isPending}>
        <CirclePlusIcon />
        <span>{isPending ? 'Creating Task...' : 'Create Task'}</span>
      </Button>
    </form>
  );
}
