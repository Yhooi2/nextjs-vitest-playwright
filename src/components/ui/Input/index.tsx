import { cn } from '@/lib/utils';
import { ComponentProps, useId } from 'react';
import { Label } from './label';

type Props = ComponentProps<'input'> & {
  errorMessage?: string;
  labelText?: string;
};

function Input({ className, type = 'text', errorMessage = '', labelText = '', ...props }: Props) {
  const id = useId();
  const errorId = `${id}-error`;
  const isInvalid = !!errorMessage;
  const areaLabel = labelText || props.placeholder;
  return (
    <div className="flex flex-col gap-2 flex-1">
      <Label htmlFor={id}>{labelText}</Label>
      <input
        id={id}
        type={type}
        data-slot="input"
        aria-invalid={isInvalid}
        aria-label={areaLabel}
        aria-describedby={isInvalid ? errorId : undefined}
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm read-only:bg-muted/100 dark:read-only:bg-muted/100',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 aria-invalid:placeholder:text-destructive/60 aria-invalid:text-destructive/80 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          className
        )}
        {...props}
      />
      {isInvalid && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export { Input, type Props };
