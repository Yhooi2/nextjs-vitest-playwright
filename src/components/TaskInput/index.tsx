import { cn } from '@/lib/utils';
import { PlusIcon } from 'lucide-react';
import { forwardRef, useId } from 'react';
import TextareaAutosize, { type TextareaAutosizeProps } from 'react-textarea-autosize';
import z from 'zod';
import { Button } from '../ui/Button';
import { Field, FieldDescription, FieldError, FieldLabel } from '../ui/field';
import { InputGroup, InputGroupAddon, InputGroupButton } from '../ui/input-group';

const MIN_ROWS = 1;
const MAX_ROWS = 5;

export const styles = {
  base: cn(
    'flex field-sizing-content min-h-16 w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-base transition-[color,box-shadow] outline-none md:text-sm',
    // States
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
    'read-only:bg-muted/100 dark:read-only:bg-muted/50'
  ),
};

export type TaskInputProps = {
  label?: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
  issues?: z.core.$ZodIssue[];
  minRows?: number;
  maxRows?: number;
  submitLabel?: string;
  className?: string;
} & TextareaAutosizeProps;

export const TaskInput = forwardRef<HTMLTextAreaElement, TaskInputProps>(
  (
    {
      label,
      placeholder,
      defaultValue,
      description,
      disabled = false,
      issues,
      minRows = MIN_ROWS,
      maxRows = MAX_ROWS,
      submitLabel = 'Create task',
      className,
      ...props
    }: TaskInputProps,
    ref
  ) => {
    const hasErrors = Boolean(issues?.length);
    const ariaLabel = label || placeholder || description;

    const id = useId();
    const inputId = `${id}-input`;
    const errorId = `${id}-error`;
    const descriptionId = `${id}-description`;

    const ariaDescribedBy =
      [description ? descriptionId : null, hasErrors ? errorId : null].filter(Boolean).join(' ') ||
      undefined;
    return (
      <Field
        data-invalid={hasErrors}
        className={cn('grid w-full min-w-xs max-w-sm gap-6', className)}
      >
        {label && <FieldLabel htmlFor={inputId}>{label}</FieldLabel>}
        {description && <FieldDescription id={descriptionId}>{description}</FieldDescription>}

        <InputGroup>
          <TextareaAutosize
            className={styles.base}
            name="description"
            ref={ref}
            id={inputId}
            placeholder={placeholder}
            data-slot="input-group-control"
            aria-label={ariaLabel}
            aria-invalid={hasErrors}
            aria-describedby={ariaDescribedBy}
            defaultValue={defaultValue}
            disabled={disabled}
            autoComplete="off"
            minRows={minRows}
            maxRows={maxRows}
            {...props}
          />
          <InputGroupAddon align="block-end">
            <InputGroupButton asChild className="ml-auto" size="sm">
              <Button type="submit" disabled={disabled} aria-label={submitLabel}>
                <PlusIcon /> {submitLabel}
              </Button>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        {issues && <FieldError errors={issues} id={errorId} />}
      </Field>
    );
  }
);
TaskInput.displayName = 'TaskInput';
