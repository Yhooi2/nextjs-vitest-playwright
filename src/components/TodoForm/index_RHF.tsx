'use client';

import { CreateTodoAction } from '@/core/todo/actions/todo.action.types';
import { sanitizeStr } from '@/utils/sanitize-str';
import { zodResolver } from '@hookform/resolvers/zod';
import { CirclePlusIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Field } from './field';

const formSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, { message: 'Task must not be empty!' })
    .transform(sanitizeStr),
});
type TodoFormData = z.infer<typeof formSchema>;
// type FormState = { success: boolean; errors: string[]; error?: string };

export type TodoFormProps = {
  action: CreateTodoAction;
};

export function TodoForm({ action }: TodoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<TodoFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { description: '' },
    mode: 'onBlur',
  });

  const onSubmit = async (data: TodoFormData) => {
    const rawDescription = data.description as string;
    const parsed = formSchema.safeParse({ description: rawDescription });
    if (!parsed.success) {
      setError('description', { message: parsed.error.issues.map((err) => err.message).join(',') });
      return;
    }
    const result = await action(parsed.data.description);
    if (!result.success) {
      setError('description', { message: result.errors.join(',') });
      return;
    }
    reset();
  };

  const isInvalid = !!errors.description;
  const errorMessage = errors.description?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 gap-6">
      <Field data-invalid={isInvalid}>
        <Input
          {...register('description')}
          labelText="Task"
          placeholder="Input task"
          disabled={isSubmitting}
          aria-invalid={isInvalid}
          errorMessage={errorMessage}
        />
        {/* <FieldDescription>Enter a description for your new task.</FieldDescription> */}
        {/* {isInvalid && <FieldError>{state.errors[0]}</FieldError>} */}
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        <CirclePlusIcon />
        <span>{isSubmitting ? 'Creating Task...' : 'Create Task'}</span>
      </Button>
    </form>
  );
}
