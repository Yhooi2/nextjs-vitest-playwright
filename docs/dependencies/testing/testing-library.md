# Testing Library (React)

## Версия в проекте
`@testing-library/react` - `16.3.0`
`@testing-library/user-event` - `14.6.1`
`@testing-library/jest-dom` - `6.8.0`

## Описание
Testing Library - это набор утилит для тестирования React компонентов с фокусом на поведение пользователя.

## Основные принципы

1. **Тестируйте как пользователь** - используйте то, что видит пользователь
2. **Избегайте implementation details** - не тестируйте внутреннюю реализацию
3. **Доступность** - используйте ARIA roles и labels

## Queries (приоритет)

### 1. ✅ getByRole (лучший выбор)
```typescript
screen.getByRole('button', { name: /submit/i });
screen.getByRole('textbox', { name: /email/i });
screen.getByRole('heading', { level: 1 });
screen.getByRole('link', { name: /learn more/i });
```

### 2. ✅ getByLabelText
```typescript
screen.getByLabelText('Password');
screen.getByLabelText(/confirm password/i);
```

### 3. ✅ getByPlaceholderText
```typescript
screen.getByPlaceholderText('Enter your email');
```

### 4. ✅ getByText
```typescript
screen.getByText('Welcome back');
screen.getByText(/hello world/i);
```

### 5. ✅ getByDisplayValue
```typescript
screen.getByDisplayValue('Current value');
```

### 6. ⚠️ getByTestId (крайний случай)
```typescript
screen.getByTestId('custom-element');
```

## Query Variants

### getBy* - синхронный, throws если не найден
```typescript
const button = screen.getByRole('button');
// Throws если не найден
```

### queryBy* - синхронный, returns null
```typescript
const error = screen.queryByText('Error message');
expect(error).not.toBeInTheDocument(); // ✅ для проверки отсутствия
```

### findBy* - асинхронный, для динамического контента
```typescript
const message = await screen.findByText('Data loaded');
// Ждет появления элемента
```

## User Events

### Предпочитайте userEvent вместо fireEvent
```typescript
import userEvent from '@testing-library/user-event';

// ✅ Good - симулирует реальное поведение
await userEvent.click(button);
await userEvent.type(input, 'Hello');

// ❌ Bad - низкоуровневые события
fireEvent.click(button);
fireEvent.change(input, { target: { value: 'Hello' } });
```

### Основные действия
```typescript
// Click
await userEvent.click(element);
await userEvent.dblClick(element);

// Type
await userEvent.type(input, 'Hello world');
await userEvent.clear(input);

// Keyboard
await userEvent.keyboard('{Enter}');
await userEvent.keyboard('{Control>}a{/Control}'); // Ctrl+A

// Select
await userEvent.selectOptions(select, 'option-value');

// Upload
await userEvent.upload(input, file);

// Tab navigation
await userEvent.tab();
```

## Пример из проекта

`src/components/TodoForm/TodoForm.test.tsx`:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoForm } from './index';

describe('TodoForm', () => {
  it('creates todo on submit', async () => {
    const mockAction = vi.fn();
    render(<TodoForm action={mockAction} todos={[]} />);

    const input = screen.getByLabelText('New Task');
    await userEvent.type(input, 'Buy milk');

    const button = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(mockAction).toHaveBeenCalledWith('Buy milk');
    });
  });

  it('shows validation error for empty input', async () => {
    render(<TodoForm action={vi.fn()} todos={[]} />);

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(await screen.findByText('Task must not be empty!')).toBeInTheDocument();
  });
});
```

## jest-dom Matchers

```typescript
// Visibility
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).not.toBeVisible();

// Form elements
expect(input).toBeDisabled();
expect(input).toBeEnabled();
expect(checkbox).toBeChecked();
expect(input).toHaveValue('text');
expect(select).toHaveDisplayValue('Option 1');

// Text content
expect(element).toHaveTextContent('Hello');
expect(element).toContainHTML('<span>Hello</span>');

// Attributes
expect(link).toHaveAttribute('href', '/home');
expect(button).toHaveClass('btn-primary');
expect(element).toHaveStyle({ color: 'red' });

// Accessibility
expect(button).toHaveAccessibleName('Submit');
expect(element).toHaveAccessibleDescription('Click to submit');
```

## Async Testing

### waitFor
```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// С опциями
await waitFor(
  () => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  },
  { timeout: 3000, interval: 100 }
);
```

### findBy (предпочтительнее)
```typescript
// Вместо waitFor + getBy
const element = await screen.findByText('Loaded');
expect(element).toBeInTheDocument();
```

## Rendering

### Basic Render
```typescript
const { container, rerender, unmount } = render(<Component />);
```

### With Providers
```typescript
function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider>
      <UserProvider>
        {ui}
      </UserProvider>
    </ThemeProvider>
  );
}

// Usage
renderWithProviders(<MyComponent />);
```

## Best Practices (из ANOTATION.md)

### 1. Используйте селекторы, основанные на том, что видит пользователь
```typescript
// ✅ Good
screen.getByRole('button', { name: /save/i });
screen.getByLabelText('Password');

// ❌ Bad
screen.getByTestId('save-button');
container.querySelector('.btn-primary');
```

### 2. Предпочитайте findBy* для асинхронного контента
```typescript
// ✅ Good
await screen.findByText('Data loaded');

// ❌ Less ideal
await waitFor(() => {
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});
```

### 3. Используйте userEvent для имитации взаимодействий
```typescript
// ✅ Good
await userEvent.click(button);
await userEvent.type(input, 'text');

// ❌ Bad
fireEvent.click(button);
```

### 4. Тестируйте поведение, не реализацию
```typescript
// ✅ Good
expect(screen.getByText('Count: 1')).toBeInTheDocument();

// ❌ Bad
expect(setStateSpy).toHaveBeenCalledWith(1);
```

## Debugging

```typescript
// Print DOM
screen.debug();

// Print specific element
screen.debug(screen.getByRole('button'));

// Get available queries
screen.logTestingPlaygroundURL();
```

## Полезные ссылки

- [Testing Library Documentation](https://testing-library.com/react)
- [Queries](https://testing-library.com/docs/queries/about)
- [User Events](https://testing-library.com/docs/user-event/intro)
- [jest-dom](https://github.com/testing-library/jest-dom)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
