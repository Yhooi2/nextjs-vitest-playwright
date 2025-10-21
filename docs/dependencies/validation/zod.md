# Zod

## Версия в проекте
`4.1.12`

## Описание
Zod - это TypeScript-first библиотека для валидации схем с автоматическим выводом типов.

## Использование в проекте

### Form Validation
Файл `src/hooks/useTodoCreate.ts`:

```typescript
import z from 'zod';
import { sanitizeStr } from '@/utils/sanitize-str';

const formSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, { message: 'Task must not be empty!' })
    .max(200, { message: 'Task must not be more 200 letters!' })
    .transform(sanitizeStr),
});

// Использование
const parsed = formSchema.safeParse({ description: raw });

if (!parsed.success) {
  return {
    success: false,
    issues: parsed.error.issues,
    data: { description: raw }
  };
}

// parsed.data.description теперь валидирован и sanitized
const validDescription = parsed.data.description;
```

### Domain Validation
Файл `src/core/todo/schemas/validate-todo-description.ts`:

```typescript
import z from 'zod';
import { sanitizeStr } from '@/utils/sanitize-str';

const todoDescriptionSchema = z
  .string()
  .trim()
  .min(1, { message: 'Description must not be empty' })
  .max(200, { message: 'Description must not be more than 200 characters' })
  .transform(sanitizeStr);

export function validateTodoDescription(description: string) {
  return todoDescriptionSchema.safeParse(description);
}
```

## Основные методы

### safeParse vs parse

```typescript
// safeParse - возвращает result object без throws
const result = schema.safeParse(data);

if (!result.success) {
  console.error(result.error.issues);
  // [{ code: 'too_small', message: 'String must contain at least 1 character(s)', ... }]
} else {
  console.log(result.data); // Validated data
}

// parse - throws ZodError при невалидных данных
try {
  const data = schema.parse(rawData);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(error.issues);
  }
}
```

## Типы валидаций

### String Validation
```typescript
z.string()
  .min(1)                          // Минимальная длина
  .max(200)                        // Максимальная длина
  .email()                         // Email формат
  .url()                           // URL формат
  .uuid()                          // UUID формат
  .trim()                          // Убрать пробелы по краям
  .toLowerCase()                   // В нижний регистр
  .toUpperCase()                   // В верхний регистр
  .regex(/^[a-z]+$/)              // Regex pattern
  .startsWith('prefix')            // Начинается с
  .endsWith('suffix')              // Заканчивается на
  .includes('substring')           // Содержит
  .datetime()                      // ISO datetime
  .ip()                           // IP address
  .transform(s => s.toLowerCase()) // Кастомная трансформация
```

### Number Validation
```typescript
z.number()
  .min(0)                    // Минимум
  .max(100)                  // Максимум
  .int()                     // Целое число
  .positive()                // Положительное
  .negative()                // Отрицательное
  .nonnegative()             // >= 0
  .nonpositive()             // <= 0
  .multipleOf(5)             // Кратно 5
  .finite()                  // Конечное число
  .safe()                    // Безопасное число (в пределах Number.MAX_SAFE_INTEGER)
```

### Object Validation
```typescript
const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(18).optional(),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
});

type User = z.infer<typeof userSchema>;
// {
//   id: string;
//   name: string;
//   email: string;
//   age?: number | undefined;
//   role: "admin" | "user" | "guest";
// }
```

### Array Validation
```typescript
z.array(z.string())              // string[]
  .min(1)                        // Минимум элементов
  .max(10)                       // Максимум элементов
  .length(5)                     // Точное количество
  .nonempty()                    // Не пустой массив

z.tuple([z.string(), z.number()]) // [string, number]
```

### Union & Intersection
```typescript
// Union (или)
const stringOrNumber = z.union([z.string(), z.number()]);
// или короче:
const stringOrNumber = z.string().or(z.number());

// Intersection (и)
const nameSchema = z.object({ name: z.string() });
const ageSchema = z.object({ age: z.number() });
const personSchema = z.intersection(nameSchema, ageSchema);
// или короче:
const personSchema = nameSchema.and(ageSchema);
```

### Optional & Nullable
```typescript
z.string().optional()        // string | undefined
z.string().nullable()        // string | null
z.string().nullish()         // string | null | undefined
z.string().default('hello')  // string (с default значением)
```

## Трансформации

### Custom Transforms
```typescript
const sanitized = z
  .string()
  .transform(s => s.trim().toLowerCase())
  .transform(s => s.replace(/[^\w\s]/g, ''));

// В проекте:
import { sanitizeStr } from '@/utils/sanitize-str';

const schema = z
  .string()
  .trim()
  .transform(sanitizeStr);
```

### Refine (Custom Validation)
```typescript
const passwordSchema = z
  .string()
  .min(8)
  .refine(val => /[A-Z]/.test(val), {
    message: 'Must contain at least one uppercase letter',
  })
  .refine(val => /[0-9]/.test(val), {
    message: 'Must contain at least one number',
  });
```

### SuperRefine
```typescript
const schema = z.object({
  password: z.string(),
  confirmPassword: z.string(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    });
  }
});
```

## Error Handling

### Форматирование ошибок для UI
В проекте (`src/hooks/useTodoCreate.ts`):

```typescript
if (!parsed.success) {
  return {
    success: false,
    issues: parsed.error.issues,  // ZodIssue[]
    data: { description: raw }
  };
}

// Конвертация server errors в ZodIssue формат:
return {
  success: false,
  issues: result.errors.map((err) => ({
    code: 'custom' as const,
    path: ['description'],
    message: err,
  })),
  data: { description: raw },
};
```

### ZodIssue типы
```typescript
type ZodIssue = {
  code: ZodIssueCode;
  path: (string | number)[];
  message: string;
  // ... other properties
};
```

## Type Inference

### Вывод типов из схемы
```typescript
const todoSchema = z.object({
  id: z.string(),
  description: z.string(),
  createdAt: z.string(),
});

type Todo = z.infer<typeof todoSchema>;
// {
//   id: string;
//   description: string;
//   createdAt: string;
// }

// Input type (до трансформаций)
type TodoInput = z.input<typeof todoSchema>;

// Output type (после трансформаций)
type TodoOutput = z.output<typeof todoSchema>;
```

## Интеграция с React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof formSchema>;

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(formSchema),
});
```

## Best Practices в проекте

### 1. Используйте safeParse
```typescript
// ✓ Хорошо
const result = schema.safeParse(data);
if (!result.success) {
  // Handle errors
}

// ✗ Плохо (throws)
const data = schema.parse(data);
```

### 2. Трансформации для sanitization
```typescript
const schema = z
  .string()
  .trim()
  .transform(sanitizeStr);
```

### 3. Переиспользование схем
```typescript
// Base schema
const descriptionSchema = z.string().trim().min(1).max(200);

// Reuse in different contexts
const todoSchema = z.object({
  description: descriptionSchema,
});

const updateSchema = z.object({
  description: descriptionSchema.optional(),
});
```

### 4. Кастомные error messages
```typescript
z.string()
  .min(1, { message: 'Task must not be empty!' })
  .max(200, { message: 'Task must not be more 200 letters!' });
```

## Полезные ссылки

- [Zod Documentation](https://zod.dev)
- [Primitives](https://zod.dev/?id=primitives)
- [Objects](https://zod.dev/?id=objects)
- [Error Handling](https://zod.dev/?id=error-handling)
- [Transformations](https://zod.dev/?id=transformations)
