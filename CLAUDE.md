# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
```bash
npm run dev              # Start development server with Turbopack
npm run build            # Build production bundle with Turbopack
npm start                # Start production server
```

### Testing

**Unit Tests** (`.spec.ts(x)` files):
```bash
npm test                 # Run all tests once (stops on first failure)
npm run test:watch       # Run all tests in watch mode
npm run test:unit        # Run only unit tests
npm run test:unit:watch  # Run unit tests in watch mode
```

**Integration Tests** (`.test.ts(x)` files):
```bash
npm run test:int         # Run only integration tests (no file parallelism due to SQLite)
npm run test:int:watch   # Run integration tests in watch mode
```

**E2E Tests** (`.e2e.ts` files with Playwright):

**⚠️ Note:** Playwright is installed but **NOT currently configured**. There is no `playwright.config.ts` file and no `.e2e.ts` test files in the project. The scripts below are placeholders for future E2E testing setup.

```bash
npm run test:e2e         # Run E2E tests headless
npm run test:e2e:headed  # Run E2E tests with visible browser
npm run test:e2e:debug   # Run E2E tests in debug mode
npm run test:e2e:ui      # Open Playwright UI mode
npm run test:e2e:report  # Show last test report
```

**Combined Testing**:
```bash
npm run test:all         # Run all tests (unit + integration + E2E)
npm run test:cov         # Run tests with coverage report
```

**Important**: Different test types use different `.env` files:
- Unit/integration tests: `.env.test`
- E2E tests: `.env.e2e`
- Dev server for E2E: `npm run dev:test` (uses `.env.e2e`)

### Database Migrations (Drizzle ORM)
```bash
npm run drizzle:generate      # Generate migrations from schema changes
npm run drizzle:migrate:dev   # Apply migrations (development)
npm run drizzle:migrate:prod  # Apply migrations (production)
```

### Code Quality
```bash
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run format:check     # Check formatting without writing
```

### Storybook
```bash
npm run storybook        # Start Storybook dev server (port 6006)
npm run build-storybook  # Build static Storybook
```

## Architecture Overview

This is a **Next.js 15** todo application using **React 19** with a **clean architecture** approach. The codebase follows **feature-based organization** with clear separation between UI, business logic, and data access layers.

### Layered Architecture Pattern

```
UI Layer (Components)
    ↓
Application Layer (Hooks + Server Actions)
    ↓
Business Logic Layer (Use Cases)
    ↓
Data Access Layer (Repository Pattern)
    ↓
Database (Drizzle ORM + SQLite)
```

### Key Directories

- **`src/app/`** - Next.js 15 App Router (minimal, mostly layout)
- **`src/components/`** - React components
  - `ui/` - Primitive components (shadcn/ui + Radix UI)
  - Feature components (TodoForm, TodoList, TaskInput)
- **`src/core/`** - Business logic (domain layer)
  - Organized by feature (currently only `todo/`)
  - Each feature contains: `actions/`, `usecases/`, `repositories/`, `schemas/`, `factories/`
- **`src/hooks/`** - Custom React hooks
- **`src/db/`** - Database configuration (Drizzle ORM)
- **`src/env/`** - Environment configuration

### Repository Pattern

All database access goes through repositories:

1. **Contract** (`*.contract.repository.ts`) - Interface defining repository methods
2. **Implementation** (`drizzle-*.repository.ts`) - Concrete implementation with Drizzle
3. **Default Export** (`default.repository.ts`) - Singleton instance

Example:
```typescript
// Get the repository
import todoRepository from '@/core/todo/repositories/default.repository';

// Use in use cases or actions
await todoRepository.create(todo);
```

### Server Actions Pattern (Next.js 15)

Server mutations use Next.js server actions (marked with `'use server'`):

```typescript
// src/core/todo/actions/create-todo.action.ts
'use server';
export async function createTodoAction(data: TodoInputDto) {
  // Validation + business logic
  const result = await createTodoUseCase(data);
  revalidatePath('/'); // Invalidate cache
  return result;
}
```

**Key Points**:
- Server actions are called directly from client components
- No API routes needed
- Use `revalidatePath()` to invalidate Next.js cache
- All actions are in `src/core/*/actions/`

### Use Cases

Business logic is isolated in use case files:

```typescript
// src/core/todo/usecases/create-todo.usecase.ts
export async function createTodoUseCase(input: TodoInputDto) {
  // 1. Validate with factory
  const todo = makeNewValidatedTodo(input);
  // 2. Persist with repository
  return todoRepository.create(todo);
}
```

Use cases are **pure business logic** - no UI concerns, no HTTP knowledge. They:
- Accept input DTOs
- Validate with factories
- Call repositories
- Return domain objects

### Testing Conventions

**File Naming**:
- `*.spec.ts(x)` - Unit tests (isolated, mocked dependencies)
- `*.test.ts(x)` - Integration tests (can access database)
- `*.e2e.ts` - End-to-end tests (Playwright)

**Test Utilities**:
- Mock data in `__tests__/mocks/` directories
- Helper functions in `__tests__/utils/` directories
- Use `vi.mock()` for module mocking
- Use `vi.spyOn()` for partial mocking

**Testing Library Best Practices** (from ANOTATION.md):
- Prefer `getByRole`, `getByText`, `getByLabelText` over `getByTestId`
- Use `userEvent` for interactions (not `fireEvent`)
- Use `findBy*` for async content
- Test user behavior, not implementation details

**Important**: Tests use separate SQLite databases per environment:
- Integration tests: `.int.test.db.sqlite3`
- E2E tests: `e2e.test.db.sqlite3`
- Databases are auto-cleaned in `vitest.global.setup.ts` and `afterEach` hooks

### Form Handling with React 19

Forms use **React 19's `useActionState`** hook:

**Note:** The project has `react-hook-form` and `@hookform/resolvers` installed as dependencies, but they are **NOT currently used** in the codebase. All forms use the native React 19 approach described below.

```typescript
const [state, formAction, isPending] = useActionState(
  async (_: FormState, formData: FormData): Promise<FormState> => {
    // 1. Parse FormData
    const raw = formData.get('description') as string;

    // 2. Validate with Zod
    const parsed = formSchema.safeParse({ description: raw });
    if (!parsed.success) {
      return { success: false, issues: parsed.error.issues, data };
    }

    // 3. Call server action
    const result = await action(parsed.data.description);

    // 4. Return new state
    return result.success ? initialState : { success: false, ... };
  },
  initialState
);
```

**Pattern**:
- Form validation happens in custom hooks (e.g., `useTodoCreate`)
- Zod schemas validate FormData directly
- `useActionState` manages form state, pending state, and server action calls
- Optimistic updates with `useOptimistic` for instant feedback

Custom hooks encapsulate form logic:
- `useTodoCreate` - Form submission with optimistic updates + keyboard shortcuts (⌘K to focus)
- `useTodoDelete` - Deletion with 5-second undo capability

### Optimistic Updates

Uses React 19's `useOptimistic` hook for instant UI feedback:

```typescript
const [optimisticTodos, updateOptimisticTodos] = useOptimistic(
  todos,
  (state, action) => {
    if (action.type === 'add') return [...state, action.todo];
    if (action.type === 'delete') return state.filter(t => t.id !== action.id);
    return state;
  }
);

// Add optimistically before server responds
updateOptimisticTodos({ type: 'add', todo: tempTodo });
await createTodoAction(todo);
updateOptimisticTodos({ type: 'delete', id: tempId });
```

### Environment Configuration

Environment handling is in `src/env/configs.ts`:

```typescript
const envConfigs = {
  development: { databaseFile: 'dev.db.sqlite3', ... },
  production: { databaseFile: 'prod.db.sqlite3', ... },
  test: { databaseFile: '.int.test.db.sqlite3', ... },
  e2e: { databaseFile: 'e2e.test.db.sqlite3', ... }
};
```

Different environments use different database files to avoid conflicts.

### UI Components (shadcn/ui)

UI components follow the **shadcn/ui** pattern:
- Built with **Radix UI** primitives (headless, accessible)
- Styled with **Tailwind CSS v4**
- Variants managed with **class-variance-authority (CVA)**

Example pattern:
```typescript
const buttonVariants = cva(baseStyles, {
  variants: {
    variant: { default, destructive, outline, ghost, link },
    size: { default, sm, lg, icon }
  }
});

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

Components use the **Slot pattern** for polymorphic rendering (via `@radix-ui/react-slot`).

### Tailwind CSS v4 Configuration

The project uses **Tailwind CSS v4** with the new configuration approach:

**File: `src/app/globals.css`**
```css
@import 'tailwindcss';
@import 'tw-animate-css';

@theme inline {
  --color-primary: var(--primary);
  --color-background: var(--background);
  /* ... other CSS variables mapped to Tailwind */
}

/* Custom dark mode variant using data-mode attribute */
@custom-variant dark (&:where([data-mode="dark"], [data-mode="dark"] *));

/* Specify source files for Tailwind */
@source "./app/**/*.{js,ts,jsx,tsx}";

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground font-sans;
  }
}
```

**Key v4 Features Used:**
- **No `tailwind.config.js`** - Configuration in CSS via `@theme inline`
- **`@import 'tailwindcss'`** - Direct import in CSS
- **`@custom-variant`** - Custom dark mode using `data-mode` attribute instead of class
- **`@source`** - Explicit content paths
- **OKLCH color space** - Modern color values (e.g., `oklch(0.147 0.004 49.25)`)
- **PostCSS plugin** - `@tailwindcss/postcss` in `postcss.config.mjs`

**Dark Mode:**
Dark mode is toggled via `data-mode` attribute on HTML element:
```html
<html data-mode="dark">  <!-- or "light" -->
```

This is managed by `next-themes` package with custom storage.

### PostCSS Configuration

**File: `postcss.config.mjs`**
```javascript
const config = {
  plugins: { '@tailwindcss/postcss': {} },
};

export default config;
```

The project uses the **`@tailwindcss/postcss`** plugin instead of the traditional `tailwindcss` and `autoprefixer` plugins. This is the recommended approach for Tailwind CSS v4.

### Storybook Setup

Storybook stories are colocated with components:
- Stories use `*.stories.tsx` naming
- Configured with `@storybook/nextjs-vite`
- Dark mode support via `@storybook/addon-themes` with `data-mode` attribute
- Uses mock data from `__tests__/mocks/` to avoid server dependencies

See `STORYBOOK.md` for detailed configuration.

## Common Development Patterns

### Adding a New Feature

1. Create feature directory: `src/core/feature-name/`
2. Define domain models: `schemas/feature-name.schema.ts` + `contracts/feature-name.contract.ts`
3. Create repository: `repositories/feature-name.contract.repository.ts` + implementation
4. Add use cases: `usecases/action-name.usecase.ts`
5. Create server actions: `actions/action-name.action.ts`
6. Build UI components in `src/components/FeatureName/`
7. Create custom hooks in `src/hooks/useFeature*.ts`
8. Write tests alongside each file

### Adding Database Schema Changes

1. Modify schema in `src/db/drizzle/schema.ts`
2. Generate migration: `npm run drizzle:generate`
3. Review generated SQL in `drizzle/migrations/`
4. Apply migration: `npm run drizzle:migrate:dev`

### Working with Server Actions

Server actions automatically:
- Run on the server (even when called from client components)
- Serialize/deserialize data
- Work with Next.js cache (use `revalidatePath()` or `revalidateTag()`)

Pattern:
```typescript
'use server';

export async function myAction(data: InputDto): Promise<Result> {
  const validated = validateInput(data);
  const result = await myUseCase(validated);
  revalidatePath('/relevant-path');
  return result;
}
```

### Testing with SQLite Constraints

Since tests use SQLite:
- File parallelism is **disabled** (`fileParallelism: false` in vitest.config.ts)
- Database is cleaned in `afterEach` hooks
- Use test utilities: `clearDrizzleTodoTable()`, `cleanupTestDatabase()`

For unit tests that don't need the database, use `*.spec.ts` naming and mock repositories:
```typescript
vi.mock('@/core/todo/repositories/default.repository');
```

## Key Dependencies

- **Next.js 15** - React framework with App Router
- **React 19** - UI library with new hooks (`useActionState`, `useOptimistic`)
- **TypeScript 5** - Type safety
- **Drizzle ORM** - Database ORM (with better-sqlite3)
- **Zod** - Runtime validation
- **Tailwind CSS v4** - Styling
- **Radix UI** - Headless UI primitives
- **shadcn/ui** - UI component patterns
- **class-variance-authority** - Variant management
- **Vitest** - Unit/integration testing
- **Playwright** - E2E testing
- **Storybook** - Component development/documentation
- **Sonner** - Toast notifications

## Notes

- The codebase uses **Russian comments** in some files (from ANOTATION.md and vitest.config.ts) - this is intentional documentation from the original author
- **Turbopack** is enabled for faster builds (`--turbopack` flag)
- All tests stop on first failure (`--bail 1` flag) for faster feedback
- Database migrations run automatically on app startup in non-production environments
- Forms leverage **React 19 native features** (`useActionState`, `useOptimistic`) instead of third-party libraries
