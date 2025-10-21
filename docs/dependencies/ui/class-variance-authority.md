# Class Variance Authority (CVA)

## Версия в проекте
`0.7.1`

## Описание
CVA - это библиотека для создания вариантов компонентов с type-safe API.

## Использование в проекте

### Button Component Example
```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        destructive: 'bg-red-500 text-white',
        outline: 'border border-input',
        ghost: 'hover:bg-accent',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps extends VariantProps<typeof buttonVariants> {
  // other props
}

export const Button = ({ variant, size, className }: ButtonProps) => (
  <button className={cn(buttonVariants({ variant, size, className }))}>
    Click me
  </button>
);
```

## TypeScript Support
```typescript
type ButtonProps = VariantProps<typeof buttonVariants>;
// {
//   variant?: "default" | "destructive" | "outline" | "ghost";
//   size?: "default" | "sm" | "lg";
// }
```

## Ссылки
- [CVA Docs](https://cva.style)
