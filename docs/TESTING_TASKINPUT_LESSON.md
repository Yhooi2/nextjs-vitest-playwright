# 🧪 Учебник: Тестирование TaskInput компонента

**Полное руководство по тестированию React компонентов с Vitest + React Testing Library + User Event**

**На примере компонента TaskInput**

---

---

### Testing Pyramid

```
        /\
       /  \       E2E Tests (Playwright)
      /----\      ← Мало, медленные, дорогие
     /      \
    /--------\    Integration Tests (.test.tsx)
   /          \   ← Средне количество
  /------------\
 /              \ Unit Tests (.spec.tsx)
/________________\ ← Много, быстрые, дешевые
```

**Правило 70/20/10:**

- 70% - Unit тесты
- 20% - Integration тесты
- 10% - E2E тесты

---

### Naming Convention

| Тип файла    | Что тестирует                                  | Пример               |
| ------------ | ---------------------------------------------- | -------------------- |
| `*.spec.tsx` | **Unit test** - компонент в изоляции           | `TaskInput.spec.tsx` |
| `*.test.tsx` | **Integration test** - компонент + зависимости | `TodoForm.test.tsx`  |
| `*.e2e.ts`   | **E2E test** - полный user flow                | `todo-app.e2e.ts`    |

---

### 🔗 Связь со Storybook

**Storybook stories** и **тесты** дополняют друг друга:

| Аспект           | Storybook             | Tests                      |
| ---------------- | --------------------- | -------------------------- |
| **Цель**         | Визуальная разработка | Автоматическая проверка    |
| **Когда**        | Во время разработки   | Перед коммитом / в CI      |
| **Проверка**     | Вручную (глазами)     | Автоматически (assertions) |
| **Изоляция**     | Да (с моками)         | Да (с моками)              |
| **Документация** | UI состояния          | Поведение и контракт       |

**Best Practice**: Используйте одни и те же mock данные!

```typescript
// src/components/TaskInput/__tests__/mocks/issues.ts
export const mockIssues: z.core.$ZodIssue[] = [
  { code: 'custom', path: ['description'], message: 'Required' }
];

// TaskInput.spec.tsx
import { mockIssues } from './__tests__/mocks/issues';
test('shows error', () => {
  render(<TaskInput issues={mockIssues} />);
});

// TaskInput.stories.tsx
import { mockIssues } from './__tests__/mocks/issues';
export const WithError: Story = {
  args: { issues: mockIssues }
};

```

---

### beforeEach / afterEach

**Запускаются до/после каждого теста** в блоке describe:

```typescript
describe('user interaction', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    // ← Выполняется ПЕРЕД каждым test()
    user = userEvent.setup();
    console.log('Test starting...');
  });

  afterEach(() => {
    // ← Выполняется ПОСЛЕ каждого test()
    console.log('Test completed');
  });

  test('allows typing', async () => {
    const el = renderTaskInput();
    await user.type(el, 'Hello'); // ← Используем user из beforeEach
  });
});
```

---

### beforeAll / afterAll

**Запускаются один раз** для всего блока describe:

```typescript
describe('with mock server', () => {
  beforeAll(() => {
    // ← Один раз ПЕРЕД всеми тестами
    server.listen();
  });

  afterAll(() => {
    // ← Один раз ПОСЛЕ всех тестов
    server.close();
  });

  test('fetches data', () => {
    /* ... */
  });
  test('handles error', () => {
    /* ... */
  });
});
```

---

## 4. 🔍 Queries - Поиск элементов DOM

### Типы Queries

React Testing Library предоставляет **3 типа queries** для поиска элементов:

| Тип        | Возвращает              | Async | Когда использовать               |
| ---------- | ----------------------- | ----- | -------------------------------- |
| `getBy*`   | Элемент или throw error | ❌    | Элемент **должен быть** в DOM    |
| `queryBy*` | Элемент или `null`      | ❌    | Проверка **отсутствия** элемента |
| `findBy*`  | Promise<Элемент>        | ✅    | Элемент появится **async**       |

---

### getBy\* - Элемент должен существовать

**Использование**: Когда элемент **точно должен быть** в DOM

```typescript
test('renders label', () => {
  render(<TaskInput label="Task" />);

  // ✅ Элемент есть → вернёт элемент
  const label = screen.getByText('Task');
  expect(label).toBeInTheDocument();
});

test('missing element throws', () => {
  render(<TaskInput />);

  // ❌ Элемента нет → выбросит ошибку
  expect(() => {
    screen.getByText('Nonexistent');
  }).toThrow();
});
```

**⚠️ Ошибка**: Если элемент не найден, тест упадёт с понятным сообщением

---

### queryBy\* - Проверка отсутствия

**Использование**: Когда проверяем что элемента **нет** в DOM

```typescript
test('error not shown initially', () => {
  render(<TaskInput />);

  // ✅ Элемента нет → вернёт null (тест пройдёт)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('error appears when invalid', () => {
  render(<TaskInput issues={[mockError]} />);

  // ✅ Элемент есть → вернёт элемент
  expect(screen.queryByRole('alert')).toBeInTheDocument();
});
```

**Правило**: `queryBy*` для `.not.toBeInTheDocument()`

---

### findBy\* - Async элементы

**Использование**: Когда элемент появится **после async операции**

```typescript
test('shows success message after submit', async () => {
  render(<TaskForm />);

  await userEvent.click(screen.getByRole('button'));

  // ✅ Ждём появления элемента (до 1 секунды по умолчанию)
  const message = await screen.findByText('Task created');
  expect(message).toBeInTheDocument();
});
```

**findBy* = getBy* + waitFor**

```typescript
// Эти два варианта эквивалентны:

// Вариант 1: findBy
const element = await screen.findByText('Hello');

// Вариант 2: getBy + waitFor
await waitFor(() => {
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

---

### Priority Order - Порядок выбора Queries

**Порядок от лучшего к худшему:**

1. **ByRole** ← 🥇 Лучший (accessibility)
2. **ByLabelText** ← 🥈 Хороший (для форм)
3. **ByPlaceholderText** ← 🥉 Нормально
4. **ByText** ← 👌 Допустимо
5. **ByDisplayValue** ← 😐 Если нет других вариантов
6. **ByAltText** ← 🖼️ Для изображений
7. **ByTitle** ← 🤷 Редко
8. **ByTestId** ← ❌ Последний вариант (implementation detail)

---

### ByRole - Лучший выбор

**Почему ByRole лучший?**

1. Соответствует как пользователи видят страницу
2. Проверяет accessibility (semantic HTML)
3. Работает со screen readers

```typescript
test('finds textarea by role', () => {
  render(<TaskInput />);

  // ✅ Лучший способ
  const textarea = screen.getByRole('textbox');
  expect(textarea).toBeInTheDocument();
});

test('finds button by role and name', () => {
  render(<TaskInput submitLabel="Create" />);

  // ✅ С фильтром по имени
  const button = screen.getByRole('button', { name: /create/i });
  expect(button).toBeInTheDocument();
});
```

**Популярные roles:**

| HTML                      | Role       |
| ------------------------- | ---------- |
| `<textarea>`              | `textbox`  |
| `<input type="text">`     | `textbox`  |
| `<button>`                | `button`   |
| `<a>`                     | `link`     |
| `<div role="alert">`      | `alert`    |
| `<h1>` - `<h6>`           | `heading`  |
| `<img>`                   | `img`      |
| `<input type="checkbox">` | `checkbox` |

---

### ByLabelText - Для форм

**Использование**: Для input/textarea с `<label>`

```typescript
test('finds input by label', () => {
  render(
    <>
      <label htmlFor="task">Task</label>
      <input id="task" />
    </>
  );

  // ✅ Находит input по связанному label
  const input = screen.getByLabelText('Task');
  expect(input).toBeInTheDocument();
});

test('finds with regex', () => {
  render(<TaskInput label="Task Description" />);

  // ✅ Регулярное выражение (case-insensitive)
  const input = screen.getByLabelText(/task/i);
  expect(input).toBeInTheDocument();
});
```

---

### ByPlaceholderText

**Использование**: Когда нет label, но есть placeholder

```typescript
test('finds by placeholder', () => {
  render(<TaskInput placeholder="Enter task..." />);

  const input = screen.getByPlaceholderText('Enter task...');
  expect(input).toBeInTheDocument();
});
```

**⚠️ Предупреждение**: Лучше использовать label для accessibility!

---

### ByText

**Использование**: Для поиска по видимому тексту

```typescript
test('finds error message', () => {
  render(<TaskInput issues={[mockError]} />);

  // ✅ Находит элемент с текстом
  const error = screen.getByText('This field is required');
  expect(error).toBeInTheDocument();
});

test('finds with partial match', () => {
  render(<TaskInput label="Task Description" />);

  // ✅ Часть текста
  const label = screen.getByText(/description/i);
  expect(label).toBeInTheDocument();
});
```

---

### ByTestId - Последний вариант

**Использование**: Когда **нет других способов**

```typescript
// ❌ ПЛОХО - implementation detail
test('finds by test id', () => {
  render(<div data-testid="custom-element" />);
  const element = screen.getByTestId('custom-element');
});

// ✅ ХОРОШО - используй role
test('finds by role', () => {
  render(<div role="navigation" />);
  const element = screen.getByRole('navigation');
});
```

**Почему ByTestId плохой?**

- Не проверяет accessibility
- Implementation detail (пользователь не видит testid)
- Добавляет "мусор" в HTML

---

### screen vs container

**Два способа поиска элементов:**

#### screen (рекомендуется)

```typescript
test('using screen', () => {
  render(<TaskInput />);

  // ✅ Глобальный объект, короткий синтаксис
  const input = screen.getByRole('textbox');
});
```

#### container (для edge cases)

```typescript
test('using container', () => {
  const { container } = render(<TaskInput />);

  // Поиск по селектору (если нет другого способа)
  const field = container.querySelector('[data-invalid]');
  expect(field).toBeInTheDocument();
});
```

**Правило**: Используй `screen`, только если невозможно - `container`

---

### Таблица сравнения Queries

| Query         | Sync/Async | Найден →         | Не найден → | Use Case                       |
| ------------- | ---------- | ---------------- | ----------- | ------------------------------ |
| `getBy*`      | Sync       | Элемент          | **Error**   | Элемент должен быть            |
| `queryBy*`    | Sync       | Элемент          | `null`      | Проверка отсутствия            |
| `findBy*`     | **Async**  | Promise<Элемент> | **Error**   | Async появление                |
| `getAllBy*`   | Sync       | Массив           | **Error**   | Несколько элементов            |
| `queryAllBy*` | Sync       | Массив           | `[]`        | Проверка отсутствия нескольких |
| `findAllBy*`  | **Async**  | Promise<Массив>  | **Error**   | Async несколько                |

---

## 5. 👤 User Event - Симуляция действий

### userEvent vs fireEvent

**Две библиотеки для симуляции событий:**

| Аспект             | userEvent                     | fireEvent                |
| ------------------ | ----------------------------- | ------------------------ |
| **Реалистичность** | ✅ Как настоящий пользователь | ❌ Только событие        |
| **События**        | Триггерит все события         | Только одно событие      |
| **Async**          | ✅ Всегда async               | ❌ Sync                  |
| **Рекомендация**   | 🥇 **Используй всегда**       | ❌ Только для edge cases |

---

### userEvent - Как настоящий пользователь

**Пример с `userEvent.type()`:**

```typescript
await userEvent.type(input, 'Hello');

// ↓ Триггерит ВСЕ эти события:
// 1. keyDown ('H')
// 2. keyPress ('H')
// 3. input (value: 'H')
// 4. keyUp ('H')
// 5. keyDown ('e')
// ... и так далее для каждой буквы
```

**Пример с `fireEvent.change()`:**

```typescript
fireEvent.change(input, { target: { value: 'Hello' } });

// ↓ Триггерит ТОЛЬКО:
// 1. change (value: 'Hello')
```

---

### userEvent.setup()

**⚠️ ВАЖНО**: Всегда вызывайте `setup()` перед использованием!

```typescript
test('allows typing', async () => {
  const el = renderTaskInput();

  // ✅ ПРАВИЛЬНО - создаём экземпляр
  const user = userEvent.setup();
  await user.type(el, 'Hello');

  // ❌ НЕПРАВИЛЬНО - без setup()
  // await userEvent.type(el, 'Hello'); // ← Может не работать в некоторых случаях
});
```

**Зачем нужен setup()?**

1. Инициализирует состояние
2. Настраивает опции (delay, pointerEventsCheck, etc)
3. Гарантирует правильный порядок событий

---

### userEvent.type() - Ввод текста

**Синтаксис**: `await user.type(element, text, options?)`

```typescript
test('allows text input', async () => {
  const el = renderTaskInput();
  const user = userEvent.setup();

  // Вводим текст
  await user.type(el, 'Hello World');

  expect(el).toHaveValue('Hello World');
});
```

---

### Специальные клавиши

**userEvent поддерживает special keys:**

| Клавиша    | Синтаксис         |
| ---------- | ----------------- |
| Enter      | `{Enter}`         |
| Tab        | `{Tab}`           |
| Backspace  | `{Backspace}`     |
| Escape     | `{Escape}`        |
| Delete     | `{Delete}`        |
| Space      | `{Space}` или ` ` |
| Arrow Up   | `{ArrowUp}`       |
| Arrow Down | `{ArrowDown}`     |

```typescript
test('multiline input', async () => {
  const el = renderTaskInput();
  const user = userEvent.setup();

  // Enter создаёт новую строку
  await user.type(el, 'Line 1{Enter}Line 2');

  expect(el).toHaveValue('Line 1\nLine 2');
});

test('backspace removes character', async () => {
  const el = renderTaskInput({ defaultValue: 'Hello' });
  const user = userEvent.setup();

  // Удаляем последний символ
  await user.type(el, '{Backspace}');

  expect(el).toHaveValue('Hell');
});
```

---

### userEvent.clear() - Очистка input

```typescript
test('clears input', async () => {
  const el = renderTaskInput({ defaultValue: 'Initial' });
  const user = userEvent.setup();

  await user.clear(el);

  expect(el).toHaveValue('');
});
```

**Что делает `clear()`?**

1. Фокусирует элемент
2. Выделяет весь текст
3. Удаляет выделенный текст

---

### userEvent.click() - Клик

```typescript
test('clicks submit button', async () => {
  const handleSubmit = vi.fn();
  render(
    <form onSubmit={handleSubmit}>
      <TaskInput submitLabel="Create" />
    </form>
  );

  const user = userEvent.setup();
  const button = screen.getByRole('button', { name: /create/i });

  await user.click(button);

  expect(handleSubmit).toHaveBeenCalled();
});
```

---

### userEvent.keyboard() - Сложные комбинации

**Для комплексных клавиатурных взаимодействий:**

```typescript
test('keyboard shortcuts', async () => {
  const el = renderTaskInput();
  const user = userEvent.setup();

  // Ctrl+A (выделить всё)
  await user.keyboard('{Control>}a{/Control}');

  // Cmd+K (Mac shortcut)
  await user.keyboard('{Meta>}k{/Meta}');
});
```

---

### Опции userEvent.setup()

**Настройка поведения:**

```typescript
test('fast typing', async () => {
  const el = renderTaskInput();

  // delay: 1ms между нажатиями (по умолчанию 0)
  const user = userEvent.setup({ delay: 1 });

  await user.type(el, 'Fast typing test');
});

test('with delay', async () => {
  const el = renderTaskInput();

  // delay: 100ms (имитация медленного набора)
  const user = userEvent.setup({ delay: 100 });

  await user.type(el, 'Slow');
});
```

---

### fireEvent - Когда использовать

**❌ Обычно НЕ нужен** (используй userEvent)

**✅ Редкие случаи когда fireEvent нужен:**

```typescript
// 1. Специфические события которых нет в userEvent
test('handles paste event', () => {
  const el = renderTaskInput();

  fireEvent.paste(el, {
    clipboardData: {
      getData: () => 'Pasted text',
    },
  });
});

// 2. Прямое изменение value (для edge cases)
test('handles special characters', () => {
  const el = renderTaskInput();
  const specialChars = '!@#$%^&*()';

  fireEvent.change(el, { target: { value: specialChars } });

  expect(el).toHaveValue(specialChars);
});
```

---

### Async природа userEvent

**⚠️ ВСЕГДА используй `await`:**

```typescript
// ❌ НЕПРАВИЛЬНО - без await
test('wrong', () => {
  const user = userEvent.setup();
  user.type(input, 'Hello'); // ← НЕ await
  expect(input).toHaveValue('Hello'); // ← Упадёт!
});

// ✅ ПРАВИЛЬНО - с await
test('correct', async () => {
  // ← async test
  const user = userEvent.setup();
  await user.type(input, 'Hello'); // ← await
  expect(input).toHaveValue('Hello'); // ← Работает!
});
```

---

### Пример из TaskInput.spec.tsx

```typescript
describe('user interaction', () => {
  test('allows text input', async () => {
    const el = renderTaskInput();
    const user = userEvent.setup();

    await user.type(el, 'New task');
    expect(el).toHaveValue('New task');
  });

  test('allows multiline input', async () => {
    const el = renderTaskInput();
    const user = userEvent.setup();

    await user.type(el, 'Line 1{Enter}Line 2');
    expect(el).toHaveValue('Line 1\nLine 2');
  });

  test('cannot be edited when disabled', async () => {
    const el = renderTaskInput({ disabled: true, defaultValue: 'Locked' });
    const user = userEvent.setup();

    await user.type(el, 'New text');
    expect(el).toHaveValue('Locked'); // ← Значение не изменилось
  });
});
```

---

## 6. 🧩 Helper Functions - DRY принцип

### Зачем нужны Helper Functions?

**Проблема**: Дублирование кода в тестах

```typescript
// ❌ ПЛОХО - дублирование
test('test 1', () => {
  render(<TaskInput label="Task" placeholder="Enter" />);
  const input = screen.getByRole('textbox');
  expect(input).toBeInTheDocument();
});

test('test 2', () => {
  render(<TaskInput label="Task" placeholder="Enter" />);
  const input = screen.getByRole('textbox');
  expect(input).toHaveValue('');
});

test('test 3', () => {
  render(<TaskInput label="Task" placeholder="Enter" />);
  const input = screen.getByRole('textbox');
  expect(input).toBeDisabled();
});
```

**Решение**: Helper functions

```typescript
// ✅ ХОРОШО - переиспользование
const renderTaskInput = (props = {}) => {
  render(<TaskInput label="Task" placeholder="Enter" {...props} />);
  return screen.getByRole('textbox');
};

test('test 1', () => {
  const input = renderTaskInput();
  expect(input).toBeInTheDocument();
});

test('test 2', () => {
  const input = renderTaskInput();
  expect(input).toHaveValue('');
});

test('test 3', () => {
  const input = renderTaskInput({ disabled: true });
  expect(input).toBeDisabled();
});
```

---

### renderTaskInput() - Main Helper

**Самый важный helper** - рендерит компонент и возвращает элемент:

```typescript
type PropsPartial = Partial<TaskInputProps>;

const renderTaskInput = (props: PropsPartial = {}) => {
  render(<TaskInput {...props} />);
  return screen.getByRole('textbox');
};

// Использование
test('renders with label', () => {
  const el = renderTaskInput({ label: 'Task Description' });
  expect(screen.getByText('Task Description')).toBeInTheDocument();
});
```

**Преимущества:**

1. Короткий синтаксис
2. Сразу возвращает textarea
3. Partial props (передаём только нужные)

---

### makeTaskInput() - Factory функция

**Создаёт React element** с default props:

```typescript
const makeTaskInput = (props: PropsPartial = {}) => {
  const defaultProps: TaskInputProps = {
    label: 'Default Label',
    placeholder: 'Default placeholder',
    disabled: false,
    ...props, // ← Override defaults
  };

  return <TaskInput {...defaultProps} />;
};

// Использование
test('with custom props', () => {
  const element = makeTaskInput({ label: 'Custom' });
  render(element);
  expect(screen.getByText('Custom')).toBeInTheDocument();
});
```

---

### \_renderTaskInput() - Advanced Helper

**Возвращает и render result, и element:**

```typescript
const _renderTaskInput = (props: PropsPartial = {}) => {
  const renderRes = render(makeTaskInput(props));
  const renderTaskInput = renderRes.getByRole('textbox');
  return { renderRes, renderTaskInput };
};

// Использование когда нужен container
test('applies data-invalid', () => {
  const { renderRes } = _renderTaskInput({ issues: [mockError] });

  const field = renderRes.container.querySelector('[data-invalid]');
  expect(field).toHaveAttribute('data-invalid', 'true');
});
```

---

### createIssue() / createIssues() - Mock Data

**Генерация Zod validation errors:**

```typescript
const createIssue = (message: string): z.core.$ZodIssue => ({
  code: 'custom' as const,
  path: ['description'],
  message,
});

const createIssues = (message: string): z.core.$ZodIssue[] => [createIssue(message)];

// Использование
test('displays error message', () => {
  renderTaskInput({ issues: createIssues('This field is required') });

  const error = screen.getByRole('alert');
  expect(error).toHaveTextContent('This field is required');
});

test('multiple errors', () => {
  const issues = [
    createIssue('Must be at least 3 characters'),
    createIssue('Cannot start with a number'),
  ];

  renderTaskInput({ issues });

  expect(screen.getByText('Must be at least 3 characters')).toBeInTheDocument();
  expect(screen.getByText('Cannot start with a number')).toBeInTheDocument();
});
```

---

### Partial<Props> Pattern

**TypeScript utility type** для опциональных props:

```typescript
type TaskInputProps = {
  label: string;
  placeholder: string;
  disabled: boolean;
  issues?: z.core.$ZodIssue[];
};

// Все props опциональные
type PropsPartial = Partial<TaskInputProps>;

// Теперь можем передавать любые props
const renderTaskInput = (props: PropsPartial = {}) => {
  render(<TaskInput {...props} />);
  return screen.getByRole('textbox');
};

// ✅ Все варианты работают
renderTaskInput();
renderTaskInput({ label: 'Task' });
renderTaskInput({ disabled: true });
renderTaskInput({ label: 'Task', issues: mockIssues });
```

---

### Setup Helper в beforeEach

**Для переиспользования user instance:**

```typescript
describe('user interaction', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  test('allows typing', async () => {
    const el = renderTaskInput();
    await user.type(el, 'Hello');
    expect(el).toHaveValue('Hello');
  });

  test('allows clearing', async () => {
    const el = renderTaskInput({ defaultValue: 'Initial' });
    await user.clear(el);
    expect(el).toHaveValue('');
  });
});
```

---

### Структура Helpers в конце файла

```typescript
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧩 HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type PropsPartial = Partial<TaskInputProps>;

// Factory - создаёт React element
const makeTaskInput = (props: PropsPartial = {}) => {
  const defaultProps: TaskInputProps = {
    label: 'label',
    placeholder: 'placeholder',
    disabled: false,
    ...props,
  };
  return <TaskInput {...defaultProps} />;
};

// Advanced - возвращает render result + element
const _renderTaskInput = (props: PropsPartial = {}) => {
  const renderRes = render(makeTaskInput(props));
  const renderTaskInput = renderRes.getByRole('textbox');
  return { renderRes, renderTaskInput };
};

// Main - короткий синтаксис для большинства тестов
const renderTaskInput = (props: PropsPartial = {}) =>
  _renderTaskInput(props).renderTaskInput;

// Mock data helpers
const createIssue = (message: string): z.core.$ZodIssue => ({
  code: 'custom' as const,
  path: ['description'],
  message,
});

const createIssues = (message: string): z.core.$ZodIssue[] => [
  createIssue(message)
];
```

---

## 7. ♿ Accessibility Testing

### Зачем тестировать accessibility?

**Accessibility (a11y)** - возможность пользоваться приложением для:

1. 🦯 **Слабовидящих** (screen readers)
2. ⌨️ **Keyboard-only пользователей**
3. 🧩 **Людей с когнитивными нарушениями**
4. 🤖 **Поисковых роботов** (SEO)

**Тесты помогают:**

- Проверить ARIA attributes
- Убедиться в semantic HTML
- Проверить keyboard navigation
- Найти проблемы до production

---

### ARIA Attributes

**ARIA** (Accessible Rich Internet Applications) - набор атрибутов для улучшения доступности.

#### aria-label

**Accessible name** для элемента без видимого label:

```typescript
test('has aria-label', () => {
  const el = renderTaskInput({ label: 'Task Description' });

  // ✅ Проверяем что aria-label установлен
  expect(el).toHaveAttribute('aria-label', 'Task Description');
});

test('uses placeholder as fallback', () => {
  const el = renderTaskInput({
    label: undefined,
    placeholder: 'Enter task',
  });

  // ✅ Fallback на placeholder
  expect(el).toHaveAttribute('aria-label', 'Enter task');
});
```

---

#### aria-invalid

**Показывает что поле содержит ошибку:**

```typescript
test('not invalid by default', () => {
  const el = renderTaskInput();

  expect(el).toHaveAttribute('aria-invalid', 'false');
});

test('invalid when errors exist', () => {
  const el = renderTaskInput({ issues: createIssues('Required') });

  expect(el).toHaveAttribute('aria-invalid', 'true');
});
```

---

#### aria-describedby

**Связывает элемент с описанием/ошибкой:**

```typescript
test('links description via aria-describedby', () => {
  const el = renderTaskInput({ description: 'Helper text' });

  const description = screen.getByText('Helper text');
  const descriptionId = description.getAttribute('id');

  // ✅ Input ссылается на description через ID
  expect(el.getAttribute('aria-describedby')).toContain(descriptionId);
});

test('links both description and error', () => {
  const el = renderTaskInput({
    description: 'Helper text',
    issues: createIssues('Error message'),
  });

  const description = screen.getByText('Helper text');
  const error = screen.getByRole('alert');
  const ariaDescribedBy = el.getAttribute('aria-describedby');

  // ✅ Содержит ID обоих элементов
  expect(ariaDescribedBy).toContain(description.getAttribute('id'));
  expect(ariaDescribedBy).toContain(error.getAttribute('id'));
});
```

---

### Semantic HTML

**Правильные HTML элементы** автоматически доступны:

```typescript
test('uses semantic textarea', () => {
  render(<TaskInput />);

  // ✅ textarea имеет role="textbox" автоматически
  const textarea = screen.getByRole('textbox');
  expect(textarea.tagName).toBe('TEXTAREA');
});

test('label is semantic', () => {
  renderTaskInput({ label: 'Task' });

  const label = screen.getByText('Task');

  // ✅ Правильный HTML тег
  expect(label.tagName).toBe('LABEL');
});
```

**❌ Плохо:**

```html
<div onClick="{handleClick}">Click me</div>
```

**✅ Хорошо:**

```html
<button onClick="{handleClick}">Click me</button>
```

---

### role="alert" для ошибок

**Screen readers объявляют элементы с role="alert":**

```typescript
test('error has role alert', () => {
  renderTaskInput({ issues: createIssues('Required') });

  // ✅ Находим по role
  const error = screen.getByRole('alert');

  expect(error).toHaveTextContent('Required');
});

test('no alert when no errors', () => {
  renderTaskInput();

  // ✅ Alert отсутствует
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
```

---

### toHaveAccessibleName()

**Проверка что элемент имеет accessible name:**

```typescript
test('button has accessible name', () => {
  renderTaskInput({ submitLabel: 'Create Task' });

  const button = screen.getByRole('button');

  // ✅ Matcher от jest-dom
  expect(button).toHaveAccessibleName('Create Task');

  // Эквивалентно:
  expect(button).toHaveAccessibleName(/create task/i);
});
```

---

### Label associations

**Связь label с input через htmlFor/id:**

```typescript
// ✅ ПРАВИЛЬНО - явная связь
test('label linked to input', () => {
  render(
    <>
      <label htmlFor="task-input">Task</label>
      <input id="task-input" />
    </>
  );

  const input = screen.getByLabelText('Task');
  expect(input).toBeInTheDocument();
});

// ❌ НЕПРАВИЛЬНО - нет связи
test('label not linked', () => {
  render(
    <>
      <label>Task</label>
      <input />
    </>
  );

  // ← getByLabelText не найдёт input
  expect(() => screen.getByLabelText('Task')).toThrow();
});
```

---

### Accessibility Checklist

При тестировании проверяй:

- [ ] **ARIA labels** - все интерактивные элементы имеют accessible name
- [ ] **ARIA invalid** - ошибки помечены `aria-invalid="true"`
- [ ] **ARIA describedby** - описания и ошибки связаны с элементами
- [ ] **Semantic HTML** - используются правильные теги (`<button>`, `<label>`, etc)
- [ ] **role="alert"** - для критичных сообщений об ошибках
- [ ] **Label associations** - все inputs имеют связанные labels
- [ ] **Keyboard navigation** - можно использовать Tab, Enter, Escape

---

## 8. 🎭 Mocking

### Зачем нужен Mocking?

**Mocking** - замена реальных зависимостей на fake versions для:

1. **Изоляции** - тестируем только компонент
2. **Контроля** - предсказуемые результаты
3. **Скорости** - без реальных API calls
4. **Покрытия** - легко тестировать ошибки

---

### vi.fn() - Mock Functions

**Создание spy function** для отслеживания вызовов:

```typescript
import { vi } from 'vitest';

test('calls onSubmit handler', async () => {
  // Создаём mock function
  const handleSubmit = vi.fn();

  render(
    <form onSubmit={handleSubmit}>
      <TaskInput />
    </form>
  );

  const user = userEvent.setup();
  await user.click(screen.getByRole('button'));

  // ✅ Проверяем что функция была вызвана
  expect(handleSubmit).toHaveBeenCalled();
  expect(handleSubmit).toHaveBeenCalledTimes(1);
});
```

---

### Mock Function возвращаемое значение

```typescript
test('mock with return value', () => {
  const mockFn = vi.fn();

  // Установить возвращаемое значение
  mockFn.mockReturnValue('Hello');

  expect(mockFn()).toBe('Hello');
  expect(mockFn).toHaveBeenCalled();
});

test('mock with async return', async () => {
  const mockAsync = vi.fn();

  // Async возвращаемое значение
  mockAsync.mockResolvedValue({ success: true });

  const result = await mockAsync();
  expect(result).toEqual({ success: true });
});
```

---

### toHaveBeenCalled\*

**Assertions для mock functions:**

```typescript
const mockFn = vi.fn();

// Была ли функция вызвана?
expect(mockFn).toHaveBeenCalled();

// Сколько раз вызвана?
expect(mockFn).toHaveBeenCalledTimes(2);

// С какими аргументами?
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');

// Последний вызов
expect(mockFn).toHaveBeenLastCalledWith('last arg');

// Вызывалась ли с определёнными args хотя бы раз?
expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
```

---

### vi.mock() - Module Mocking

**Замена всего модуля:**

```typescript
// Мокируем модуль server action
vi.mock('@/core/todo/actions/create-todo.action', () => ({
  createTodoAction: vi.fn(),
}));

import { createTodoAction } from '@/core/todo/actions/create-todo.action';

test('calls server action on submit', async () => {
  // Настраиваем возвращаемое значение
  vi.mocked(createTodoAction).mockResolvedValue({
    success: true,
    data: { id: '1', description: 'Test' },
  });

  render(<TodoForm />);

  const user = userEvent.setup();
  await user.type(screen.getByRole('textbox'), 'Test task');
  await user.click(screen.getByRole('button'));

  // Проверяем что action вызван
  expect(createTodoAction).toHaveBeenCalledWith('Test task');
});
```

---

### MSW (Mock Service Worker)

**Для мокирования HTTP requests:**

```typescript
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Setup MSW server
const server = setupServer(
  http.get('/api/todos', () => {
    return HttpResponse.json([
      { id: '1', description: 'Task 1' },
      { id: '2', description: 'Task 2' },
    ]);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('fetches todos', async () => {
  render(<TodoList />);

  // Ждём загрузки данных
  const task1 = await screen.findByText('Task 1');
  const task2 = await screen.findByText('Task 2');

  expect(task1).toBeInTheDocument();
  expect(task2).toBeInTheDocument();
});
```

---

### Mock Props

**Простой способ** - передавать mock functions как props:

```typescript
test('calls onChange handler', async () => {
  const handleChange = vi.fn();

  render(<TaskInput onChange={handleChange} />);

  const user = userEvent.setup();
  await user.type(screen.getByRole('textbox'), 'A');

  expect(handleChange).toHaveBeenCalled();
});

test('calls onBlur handler', async () => {
  const handleBlur = vi.fn();

  render(<TaskInput onBlur={handleBlur} />);

  const input = screen.getByRole('textbox');
  input.focus();
  input.blur();

  expect(handleBlur).toHaveBeenCalled();
});
```

---

### Mocking Best Practices

1. **Мокируй внешние зависимости**:
   - ✅ API calls
   - ✅ Server actions
   - ✅ Third-party libraries
   - ❌ НЕ мокируй сам компонент

2. **Используй MSW для HTTP**:
   - Более реалистичный подход
   - Работает как на клиенте, так и на сервере

3. **Не переусердствуй**:
   - Integration тесты должны иметь меньше моков
   - Unit тесты - больше моков

4. **Очищай моки**:
   ```typescript
   afterEach(() => {
     vi.clearAllMocks();
   });
   ```

---

## 9. 📊 Test Categories - 5 групп

### Категории тестов

**Организация** тестов по функциональным группам:

1. **rendering** - Рендеринг и props
2. **accessibility** - Доступность и ARIA
3. **user interaction** - Взаимодействие пользователя
4. **state management** - Состояние компонента
5. **edge cases** - Граничные случаи

---

### 1. rendering - Рендеринг и Props

**Что тестируем**:

- Компонент рендерится без ошибок
- Props правильно отображаются
- Структура DOM корректна
- Default values применяются

```typescript
describe('rendering', () => {
  test('renders with label', () => {
    renderTaskInput({ label: 'Task Description' });

    const label = screen.getByText('Task Description');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
  });

  test('renders with placeholder', () => {
    const el = renderTaskInput({ placeholder: 'Enter task...' });
    expect(el).toHaveAttribute('placeholder', 'Enter task...');
  });

  test('renders without placeholder', () => {
    const el = renderTaskInput({ placeholder: undefined });
    expect(el).not.toHaveAttribute('placeholder');
  });

  test('renders with description', () => {
    renderTaskInput({ description: 'Helper text' });
    expect(screen.getByText('Helper text')).toBeInTheDocument();
  });

  test('displays default value', () => {
    const el = renderTaskInput({ defaultValue: 'Buy groceries' });
    expect(el).toHaveValue('Buy groceries');
  });

  test('renders submit button', () => {
    renderTaskInput({ submitLabel: 'Add Task' });
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });
});
```

---

### 2. accessibility - Доступность и ARIA

**Что тестируем**:

- ARIA attributes
- Semantic HTML
- Screen reader support
- Keyboard navigation
- Label associations

```typescript
describe('accessibility', () => {
  test('uses label as accessible name', () => {
    const el = renderTaskInput({ label: 'Task Title' });
    expect(el).toHaveAttribute('aria-label', 'Task Title');
  });

  test('is not invalid by default', () => {
    const el = renderTaskInput();
    expect(el).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('is marked as invalid when errors exist', () => {
    const el = renderTaskInput({ issues: createIssues('Required') });
    expect(el).toHaveAttribute('aria-invalid', 'true');
  });

  test('displays error message', () => {
    renderTaskInput({ issues: createIssues('This field is required') });

    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('This field is required');
  });

  test('links error via aria-describedby', () => {
    const el = renderTaskInput({ issues: createIssues('Error') });

    const error = screen.getByRole('alert');
    const errorId = error.getAttribute('id');

    expect(el).toHaveAttribute('aria-describedby', errorId);
  });

  test('submit button has accessible label', () => {
    renderTaskInput({ submitLabel: 'Create Task' });

    const button = screen.getByRole('button', { name: /create task/i });
    expect(button).toHaveAccessibleName();
  });
});
```

---

### 3. user interaction - Взаимодействие

**Что тестируем**:

- Ввод текста
- Клики
- Keyboard events
- Focus/blur
- Form submission

```typescript
describe('user interaction', () => {
  test('allows text input', async () => {
    const el = renderTaskInput();
    const user = userEvent.setup();

    await user.type(el, 'New task');
    expect(el).toHaveValue('New task');
  });

  test('allows multiline input', async () => {
    const el = renderTaskInput();
    const user = userEvent.setup();

    await user.type(el, 'Line 1{Enter}Line 2');
    expect(el).toHaveValue('Line 1\nLine 2');
  });

  test('updates value as user types', async () => {
    const el = renderTaskInput();
    const user = userEvent.setup();

    expect(el).toHaveValue('');

    await user.type(el, 'Hello');
    expect(el).toHaveValue('Hello');

    await user.type(el, ' World');
    expect(el).toHaveValue('Hello World');
  });

  test('clears value', async () => {
    const el = renderTaskInput({ defaultValue: 'Initial' });
    const user = userEvent.setup();

    await user.clear(el);
    expect(el).toHaveValue('');
  });

  test('cannot be edited when disabled', async () => {
    const el = renderTaskInput({
      disabled: true,
      defaultValue: 'Locked',
    });
    const user = userEvent.setup();

    await user.type(el, 'New text');
    expect(el).toHaveValue('Locked');
  });
});
```

---

### 4. state management - Управление состоянием

**Что тестируем**:

- Disabled state
- Readonly state
- Error state
- Loading state
- Validation state

```typescript
describe('state management', () => {
  test('is disabled when disabled prop is true', () => {
    const el = renderTaskInput({ disabled: true });
    expect(el).toBeDisabled();
  });

  test('is readonly when readOnly prop is true', () => {
    const el = renderTaskInput({ readOnly: true });
    expect(el).toHaveAttribute('readonly');
  });

  test('submit button is disabled when input is disabled', () => {
    renderTaskInput({ disabled: true });

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  test('handles no errors gracefully', () => {
    const el = renderTaskInput({ issues: undefined });

    expect(el).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('handles empty errors array', () => {
    const el = renderTaskInput({ issues: [] });

    expect(el).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('applies data-invalid to container when errors exist', () => {
    const { renderRes } = _renderTaskInput({
      issues: createIssues('Error'),
    });

    const field = renderRes.container.querySelector('[data-invalid]');
    expect(field).toHaveAttribute('data-invalid', 'true');
  });
});
```

---

### 5. edge cases - Граничные случаи

**Что тестируем**:

- Пустые значения
- Undefined/null
- Очень длинные строки
- Специальные символы
- Экстремальные сценарии

```typescript
describe('edge cases', () => {
  test('handles undefined props', () => {
    const el = renderTaskInput({
      label: undefined,
      placeholder: undefined,
      description: undefined,
      issues: undefined,
    });

    expect(el).toBeInTheDocument();
  });

  test('handles empty string values', () => {
    const el = renderTaskInput({
      label: '',
      placeholder: '',
      defaultValue: '',
    });

    expect(el).toBeInTheDocument();
    expect(el).toHaveValue('');
  });

  test('handles special characters', () => {
    const el = renderTaskInput();
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    fireEvent.change(el, { target: { value: specialChars } });
    expect(el).toHaveValue(specialChars);
  });

  test('handles very long text', async () => {
    const el = renderTaskInput();
    const user = userEvent.setup();
    const longText = 'A'.repeat(1000);

    await user.type(el, longText);
    expect(el).toHaveValue(longText);
  });

  test('handles rapid typing', async () => {
    const el = renderTaskInput();
    const user = userEvent.setup({ delay: 1 });

    await user.type(el, 'Fast typing test');
    expect(el).toHaveValue('Fast typing test');
  });

  test('displays multiple error messages', () => {
    const issues = [
      createIssue('Must be at least 3 characters'),
      createIssue('Cannot start with a number'),
    ];

    renderTaskInput({ issues });

    expect(screen.getByText('Must be at least 3 characters')).toBeInTheDocument();
    expect(screen.getByText('Cannot start with a number')).toBeInTheDocument();
  });
});
```

---

## 10. 🧪 Assertions - Проверки

### jest-dom Matchers

**Custom matchers** от `@testing-library/jest-dom`:

| Matcher                        | Что проверяет      | Пример                                             |
| ------------------------------ | ------------------ | -------------------------------------------------- |
| `toBeInTheDocument()`          | Элемент в DOM      | `expect(el).toBeInTheDocument()`                   |
| `toHaveValue(value)`           | Input value        | `expect(input).toHaveValue('Hello')`               |
| `toBeDisabled()`               | Disabled state     | `expect(button).toBeDisabled()`                    |
| `toBeEnabled()`                | Enabled state      | `expect(button).toBeEnabled()`                     |
| `toHaveAttribute(attr, value)` | HTML attribute     | `expect(el).toHaveAttribute('aria-label', 'Task')` |
| `toHaveTextContent(text)`      | Text content       | `expect(div).toHaveTextContent('Hello')`           |
| `toBeVisible()`                | Visibility         | `expect(el).toBeVisible()`                         |
| `toHaveAccessibleName(name)`   | Accessible name    | `expect(button).toHaveAccessibleName('Submit')`    |
| `toBeRequired()`               | Required input     | `expect(input).toBeRequired()`                     |
| `toBeValid()`                  | Valid form field   | `expect(input).toBeValid()`                        |
| `toBeInvalid()`                | Invalid form field | `expect(input).toBeInvalid()`                      |
| `toHaveClass(className)`       | CSS class          | `expect(div).toHaveClass('active')`                |
| `toHaveStyle(styles)`          | Inline styles      | `expect(div).toHaveStyle({ color: 'red' })`        |

---

### toBeInTheDocument()

**Проверка присутствия в DOM:**

```typescript
test('element exists', () => {
  render(<TaskInput label="Task" />);

  const label = screen.getByText('Task');
  expect(label).toBeInTheDocument();
});

test('element does not exist', () => {
  render(<TaskInput />);

  expect(screen.queryByText('Nonexistent')).not.toBeInTheDocument();
});
```

---

### toHaveValue()

**Проверка значения input/textarea:**

```typescript
test('has initial value', () => {
  const el = renderTaskInput({ defaultValue: 'Initial' });
  expect(el).toHaveValue('Initial');
});

test('has empty value', () => {
  const el = renderTaskInput();
  expect(el).toHaveValue('');
});

test('updates value', async () => {
  const el = renderTaskInput();
  const user = userEvent.setup();

  await user.type(el, 'New value');
  expect(el).toHaveValue('New value');
});
```

---

### toBeDisabled() / toBeEnabled()

**Проверка disabled state:**

```typescript
test('is disabled', () => {
  const el = renderTaskInput({ disabled: true });
  expect(el).toBeDisabled();
});

test('is enabled by default', () => {
  const el = renderTaskInput();
  expect(el).toBeEnabled();
});

test('button is disabled when input disabled', () => {
  renderTaskInput({ disabled: true });

  const button = screen.getByRole('button');
  expect(button).toBeDisabled();
});
```

---

### toHaveAttribute()

**Проверка HTML attributes:**

```typescript
test('has attribute', () => {
  const el = renderTaskInput({
    name: 'description',
    maxLength: 500,
  });

  expect(el).toHaveAttribute('name', 'description');
  expect(el).toHaveAttribute('maxLength', '500');
});

test('aria attributes', () => {
  const el = renderTaskInput({ label: 'Task' });

  expect(el).toHaveAttribute('aria-label', 'Task');
  expect(el).toHaveAttribute('aria-invalid', 'false');
});

test('does not have attribute', () => {
  const el = renderTaskInput({ placeholder: undefined });
  expect(el).not.toHaveAttribute('placeholder');
});
```

---

### toHaveTextContent()

**Проверка текстового содержимого:**

```typescript
test('has text', () => {
  renderTaskInput({ description: 'Helper text for the task' });

  const description = screen.getByText('Helper text for the task');
  expect(description).toHaveTextContent('Helper text');
});

test('error message text', () => {
  renderTaskInput({ issues: createIssues('Required field') });

  const error = screen.getByRole('alert');
  expect(error).toHaveTextContent('Required field');
});
```

---

### toHaveAccessibleName()

**Проверка accessible name:**

```typescript
test('button has accessible name', () => {
  renderTaskInput({ submitLabel: 'Create Task' });

  const button = screen.getByRole('button');
  expect(button).toHaveAccessibleName('Create Task');
});

test('input has accessible name from label', () => {
  const el = renderTaskInput({ label: 'Task Description' });
  expect(el).toHaveAccessibleName('Task Description');
});
```

---

### Negative Assertions

**Проверка отсутствия:**

```typescript
test('not in document', () => {
  render(<TaskInput />);
  expect(screen.queryByText('Nonexistent')).not.toBeInTheDocument();
});

test('not disabled', () => {
  const el = renderTaskInput();
  expect(el).not.toBeDisabled();
});

test('does not have attribute', () => {
  const el = renderTaskInput();
  expect(el).not.toHaveAttribute('readonly');
});

test('does not have class', () => {
  const el = renderTaskInput();
  expect(el).not.toHaveClass('error');
});
```

---

### expect.objectContaining()

**Частичное совпадение объектов:**

```typescript
test('calls with object containing specific fields', () => {
  const mockFn = vi.fn();

  mockFn({ id: 1, name: 'Task', extra: 'data' });

  // ✅ Проверяем только нужные поля
  expect(mockFn).toHaveBeenCalledWith(
    expect.objectContaining({
      id: 1,
      name: 'Task',
    })
  );
});
```

---

## 11. 📈 Coverage & Best Practices

### Coverage - Покрытие кода

**Coverage** показывает какой % кода покрыт тестами.

**Запуск coverage:**

```bash
npm run test:cov
```

**Результат:**

```
-------------------------------|---------|----------|---------|---------|
File                           | % Stmts | % Branch | % Funcs | % Lines |
-------------------------------|---------|----------|---------|---------|
 components/TaskInput          |   95.23 |    88.88 |     100 |   94.44 |
  index.tsx                    |   95.23 |    88.88 |     100 |   94.44 |
-------------------------------|---------|----------|---------|---------|
```

---

### Типы Coverage

| Метрика        | Что измеряет                    |
| -------------- | ------------------------------- |
| **Statements** | % выполненных строк кода        |
| **Branches**   | % покрытых if/else/switch веток |
| **Functions**  | % вызванных функций             |
| **Lines**      | % выполненных логических линий  |

---

### Целевое покрытие

**Рекомендации:**

- ✅ **80%+** - хороший уровень
- ✅ **90%+** - отличный уровень
- ❌ **100%** - не обязательно (diminishing returns)

**Что НЕ нужно покрывать:**

- Type definitions
- Constants
- Mock data
- Storybook stories
- Config files

---

### AAA Pattern

**Arrange-Act-Assert** - структура каждого теста:

```typescript
test('allows text input', async () => {
  // ━━━ ARRANGE - Подготовка ━━━
  const el = renderTaskInput();
  const user = userEvent.setup();

  // ━━━ ACT - Действие ━━━
  await user.type(el, 'Hello');

  // ━━━ ASSERT - Проверка ━━━
  expect(el).toHaveValue('Hello');
});
```

---

### One Assertion vs Multiple

**Два подхода:**

#### ✅ One assertion per test

```typescript
test('renders label', () => {
  renderTaskInput({ label: 'Task' });
  expect(screen.getByText('Task')).toBeInTheDocument();
});

test('label is semantic HTML', () => {
  renderTaskInput({ label: 'Task' });
  const label = screen.getByText('Task');
  expect(label.tagName).toBe('LABEL');
});
```

**Преимущества:**

- Понятные названия тестов
- Точная локализация ошибок
- Лучше для TDD

---

#### ✅ Multiple related assertions

```typescript
test('renders label with correct HTML', () => {
  renderTaskInput({ label: 'Task Description' });

  const label = screen.getByText('Task Description');
  expect(label).toBeInTheDocument();
  expect(label.tagName).toBe('LABEL');
});
```

**Преимущества:**

- Меньше дублирования setup
- Группировка связанных проверок
- Быстрее выполнение

---

### Best Practices

#### 1. Тестируй поведение, не implementation

```typescript
// ❌ ПЛОХО - implementation detail
test('calls handleChange', async () => {
  const spy = vi.spyOn(TaskInput.prototype, 'handleChange');
  // ...
  expect(spy).toHaveBeenCalled();
});

// ✅ ХОРОШО - пользовательское поведение
test('updates value when user types', async () => {
  const el = renderTaskInput();
  const user = userEvent.setup();

  await user.type(el, 'Hello');
  expect(el).toHaveValue('Hello');
});
```

---

#### 2. Используй userEvent вместо fireEvent

```typescript
// ❌ ПЛОХО - не реалистично
test('typing with fireEvent', () => {
  const el = renderTaskInput();
  fireEvent.change(el, { target: { value: 'Hello' } });
  expect(el).toHaveValue('Hello');
});

// ✅ ХОРОШО - как настоящий пользователь
test('typing with userEvent', async () => {
  const el = renderTaskInput();
  const user = userEvent.setup();

  await user.type(el, 'Hello');
  expect(el).toHaveValue('Hello');
});
```

---

#### 3. Queries by priority

```typescript
// ❌ ХУДШИЙ - testid
const el = screen.getByTestId('task-input');

// 😐 ПЛОХО - selector
const el = container.querySelector('textarea');

// 👌 НОРМАЛЬНО - placeholder
const el = screen.getByPlaceholderText('Enter task');

// ✅ ХОРОШО - label
const el = screen.getByLabelText('Task');

// 🥇 ЛУЧШИЙ - role
const el = screen.getByRole('textbox');
```

---

#### 4. Группируй с describe()

```typescript
// ✅ ХОРОШО - организованная структура
describe('<TaskInput />', () => {
  describe('rendering', () => {
    test('renders label', () => {
      /* ... */
    });
    test('renders placeholder', () => {
      /* ... */
    });
  });

  describe('accessibility', () => {
    test('has aria-label', () => {
      /* ... */
    });
    test('shows error role', () => {
      /* ... */
    });
  });
});
```

---

#### 5. Используй Helper Functions

```typescript
// ❌ ПЛОХО - дублирование
test('test 1', () => {
  render(<TaskInput label="Task" />);
  const input = screen.getByRole('textbox');
});

test('test 2', () => {
  render(<TaskInput label="Task" />);
  const input = screen.getByRole('textbox');
});

// ✅ ХОРОШО - переиспользование
const renderTaskInput = (props = {}) => {
  render(<TaskInput {...props} />);
  return screen.getByRole('textbox');
};

test('test 1', () => {
  const input = renderTaskInput({ label: 'Task' });
});

test('test 2', () => {
  const input = renderTaskInput({ label: 'Task' });
});
```

---

#### 6. Async/await для userEvent

```typescript
// ❌ НЕПРАВИЛЬНО - без await
test('wrong', () => {
  const user = userEvent.setup();
  user.type(input, 'Hello');
  expect(input).toHaveValue('Hello'); // ← Упадёт
});

// ✅ ПРАВИЛЬНО - с await
test('correct', async () => {
  const user = userEvent.setup();
  await user.type(input, 'Hello');
  expect(input).toHaveValue('Hello'); // ← Работает
});
```

---

#### 7. Проверяй Edge Cases

```typescript
describe('edge cases', () => {
  test('handles undefined props', () => {
    /* ... */
  });
  test('handles empty strings', () => {
    /* ... */
  });
  test('handles very long text', () => {
    /* ... */
  });
  test('handles special characters', () => {
    /* ... */
  });
  test('handles multiple errors', () => {
    /* ... */
  });
});
```

---

#### 8. Cleanup автоматический

```typescript
// ❌ НЕ НУЖНО - cleanup автоматический
afterEach(() => {
  cleanup(); // ← Лишнее, если настроен vitest.setup.ts
});

// ✅ Cleanup уже настроен в vitest.setup.ts
import { cleanup } from '@testing-library/react';
afterEach(() => {
  cleanup();
});
```

---

## 12. ✅ Best Practices Checklist

### Структура файла

- [ ] **Default export** отсутствует (только named exports)
- [ ] **Imports** сгруппированы: testing utils → types → component
- [ ] **describe** блоки для категорий (rendering, accessibility, interaction, etc)
- [ ] **Helper functions** в конце файла
- [ ] **Naming**: `ComponentName.spec.tsx` для unit тестов

---

### Queries

- [ ] **Priority order**: ByRole > ByLabelText > ByText > ByTestId
- [ ] **getBy\*** для элементов которые должны быть
- [ ] **queryBy\*** для проверки отсутствия (`.not.toBeInTheDocument()`)
- [ ] **findBy\*** для async элементов
- [ ] **screen** вместо destructuring (кроме container edge cases)
- [ ] **Regex** для case-insensitive поиска (`/text/i`)

---

### User Interaction

- [ ] **userEvent.setup()** вызывается перед использованием
- [ ] **await** для всех userEvent методов
- [ ] **userEvent** вместо fireEvent (кроме rare edge cases)
- [ ] **Realistic interactions**: type, click, clear
- [ ] **Special keys** через фигурные скобки (`{Enter}`, `{Backspace}`)

---

### Assertions

- [ ] **jest-dom matchers**: toBeInTheDocument, toHaveValue, toBeDisabled
- [ ] **Negative assertions**: `.not.toBeInTheDocument()`
- [ ] **One test = one behavior** (не обязательно one assertion)
- [ ] **Понятные error messages** из коробки

---

### Accessibility

- [ ] **ARIA attributes** тестируются (aria-label, aria-invalid, aria-describedby)
- [ ] **role="alert"** для ошибок
- [ ] **Semantic HTML** проверяется (LABEL, BUTTON, etc)
- [ ] **toHaveAccessibleName()** для интерактивных элементов
- [ ] **Label associations** (htmlFor/id)

---

### Mocking

- [ ] **vi.fn()** для spy functions
- [ ] **toHaveBeenCalled\*** assertions для mock functions
- [ ] **MSW** для HTTP mocking (если нужно)
- [ ] **Minimal mocking** - мокируй только внешние зависимости
- [ ] **cleanup mocks** в afterEach (vi.clearAllMocks)

---

### Organization

- [ ] **5 категорий**: rendering, accessibility, interaction, state, edge cases
- [ ] **AAA pattern**: Arrange → Act → Assert
- [ ] **Helper functions** для DRY
- [ ] **beforeEach/afterEach** для setup/cleanup
- [ ] **Logical grouping** с describe

---

### Coverage

- [ ] **80%+ coverage** для components
- [ ] **test:cov** проходит
- [ ] **Edge cases** покрыты
- [ ] **Не тестируем** types, mocks, stories, configs

---

### Performance

- [ ] **No unnecessary renders** между тестами (cleanup работает)
- [ ] **userEvent.setup({ delay: 1 })** для faster typing tests
- [ ] **Не злоупотребляй** findBy (используй только для async)

---

### Code Style

- [ ] **Naming**: describe('<ComponentName />'), test('behavior description')
- [ ] **Комментарии** только где нужно (код должен быть self-documenting)
- [ ] **TypeScript** строгая типизация
- [ ] **Prettier** formatting

---

## 13. 📦 Полный TaskInput.spec.tsx

**Файл**: `src/components/TaskInput/TaskInput.spec.tsx`

Полный пример с **340 строками** тестов с подробными комментариями:

```typescript
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 IMPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 1. Testing utilities от React Testing Library
import { fireEvent, render, screen } from '@testing-library/react';

// 2. User Event для реалистичной симуляции пользователя
import userEvent from '@testing-library/user-event';

// 3. Типы для Zod validation errors
import z from 'zod';

// 4. Компонент который тестируем
import { TaskInput, TaskInputProps } from './index';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧪 TESTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('<TaskInput />', () => {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. RENDERING - Рендеринг и Props
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('rendering', () => {
    test('renders with label', () => {
      // ARRANGE - подготовка
      const el = renderTaskInput({ label: 'Task Description' });

      // ASSERT - проверка
      const label = screen.getByText('Task Description');
      expect(label).toBeInTheDocument();
      expect(label.tagName).toBe('LABEL'); // ← Semantic HTML
      expect(el).toHaveAttribute('aria-label', 'Task Description');
    });

    test('renders with placeholder', () => {
      const el = renderTaskInput({ placeholder: 'Enter task details...' });
      expect(el).toHaveAttribute('placeholder', 'Enter task details...');
    });

    test('renders without placeholder', () => {
      const el = renderTaskInput({ placeholder: undefined });
      expect(el).not.toHaveAttribute('placeholder');
    });

    test('renders without label', () => {
      const el = renderTaskInput({ label: undefined });
      expect(el).not.toHaveAttribute('aria-labelledby');
    });

    test('renders with description', () => {
      renderTaskInput({ description: 'Helper text for the task' });
      expect(screen.getByText('Helper text for the task')).toBeInTheDocument();
    });

    test('displays default value', () => {
      const el = renderTaskInput({ defaultValue: 'Buy groceries' });
      expect(el).toHaveValue('Buy groceries');
    });

    test('renders submit button', () => {
      renderTaskInput({ submitLabel: 'Add Task' });
      expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
    });

    test('forwards HTML attributes', () => {
      // Проверяем что нестандартные props передаются textarea
      const el = renderTaskInput({
        name: 'task-description',
        maxLength: 500,
        autoComplete: 'off',
      });

      expect(el).toHaveAttribute('name', 'task-description');
      expect(el).toHaveAttribute('maxLength', '500');
      expect(el).toHaveAttribute('autocomplete', 'off');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. ACCESSIBILITY - Доступность
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('accessibility', () => {
    test('uses label as accessible name', () => {
      const el = renderTaskInput({ label: 'Task Title' });
      expect(el).toHaveAttribute('aria-label', 'Task Title');
    });

    test('uses placeholder as accessible name fallback', () => {
      // Когда нет label, используем placeholder
      const el = renderTaskInput({
        label: undefined,
        placeholder: 'Enter your task',
      });
      expect(el).toHaveAttribute('aria-label', 'Enter your task');
    });

    test('uses description as accessible name fallback', () => {
      // Когда нет ни label, ни placeholder
      const el = renderTaskInput({
        label: undefined,
        placeholder: undefined,
        description: 'Task details',
      });
      expect(el).toHaveAttribute('aria-label', 'Task details');
    });

    test('is not invalid by default', () => {
      const el = renderTaskInput();

      expect(el).toHaveAttribute('aria-invalid', 'false');
      expect(el).not.toHaveAttribute('aria-describedby');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    test('is marked as invalid when errors exist', () => {
      const el = renderTaskInput({ issues: createIssues('Task is required') });
      expect(el).toHaveAttribute('aria-invalid', 'true');
    });

    test('displays error message', () => {
      renderTaskInput({ issues: createIssues('This field is required') });

      // Error должен быть role="alert" для screen readers
      const error = screen.getByRole('alert');
      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent('This field is required');
    });

    test('links error message via aria-describedby', () => {
      const el = renderTaskInput({ issues: createIssues('Invalid input') });

      const error = screen.getByRole('alert');
      const errorId = error.getAttribute('id');

      expect(errorId).toBeTruthy();
      expect(el).toHaveAttribute('aria-describedby', errorId);
    });

    test('links description via aria-describedby', () => {
      const el = renderTaskInput({ description: 'Helper text' });

      const description = screen.getByText('Helper text');
      const descriptionId = description.getAttribute('id');

      expect(descriptionId).toBeTruthy();
      expect(el.getAttribute('aria-describedby')).toContain(descriptionId);
    });

    test('links both description and error via aria-describedby', () => {
      // aria-describedby может содержать несколько ID через пробел
      const el = renderTaskInput({
        description: 'Helper text',
        issues: createIssues('Error message'),
      });

      const description = screen.getByText('Helper text');
      const error = screen.getByRole('alert');
      const ariaDescribedBy = el.getAttribute('aria-describedby');

      expect(ariaDescribedBy).toContain(description.getAttribute('id'));
      expect(ariaDescribedBy).toContain(error.getAttribute('id'));
    });

    test('displays multiple error messages', () => {
      const multipleIssues = [
        createIssue('Must be at least 3 characters'),
        createIssue('Cannot start with a number'),
      ];

      renderTaskInput({ issues: multipleIssues });

      expect(screen.getByText('Must be at least 3 characters')).toBeInTheDocument();
      expect(screen.getByText('Cannot start with a number')).toBeInTheDocument();
    });

    test('submit button has accessible label', () => {
      renderTaskInput({ submitLabel: 'Create Task' });

      const button = screen.getByRole('button', { name: /create task/i });
      expect(button).toHaveAccessibleName();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. USER INTERACTION - Взаимодействие пользователя
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('user interaction', () => {
    test('allows text input', async () => {
      // ARRANGE
      const el = renderTaskInput();
      const user = userEvent.setup(); // ← Всегда setup() перед использованием

      // ACT - userEvent симулирует реальный ввод (keyDown, keyPress, input, keyUp)
      await user.type(el, 'New task');

      // ASSERT
      expect(el).toHaveValue('New task');
    });

    test('allows multiline input', async () => {
      const el = renderTaskInput();
      const user = userEvent.setup();

      // {Enter} создаёт новую строку
      await user.type(el, 'Line 1{Enter}Line 2');

      expect(el).toHaveValue('Line 1\nLine 2');
    });

    test('updates value as user types', async () => {
      const el = renderTaskInput();
      const user = userEvent.setup();

      expect(el).toHaveValue('');

      await user.type(el, 'Hello');
      expect(el).toHaveValue('Hello');

      await user.type(el, ' World');
      expect(el).toHaveValue('Hello World');
    });

    test('clears value', async () => {
      const el = renderTaskInput({ defaultValue: 'Initial' });
      const user = userEvent.setup();

      // clear() фокусирует, выделяет, удаляет текст
      await user.clear(el);

      expect(el).toHaveValue('');
    });

    test('cannot be edited when disabled', async () => {
      const el = renderTaskInput({
        disabled: true,
        defaultValue: 'Locked',
      });
      const user = userEvent.setup();

      // Попытка ввода не должна изменить значение
      await user.type(el, 'New text');

      expect(el).toHaveValue('Locked'); // ← Значение осталось прежним
    });

    test('cannot be edited when readonly', async () => {
      const el = renderTaskInput({
        readOnly: true,
        defaultValue: 'Read only',
      });
      const user = userEvent.setup();

      await user.type(el, 'New text');

      expect(el).toHaveValue('Read only');
    });

    test('allows editing when invalid', async () => {
      // Даже с ошибками можно вводить текст
      const el = renderTaskInput({ issues: createIssues('Error') });
      const user = userEvent.setup();

      await user.type(el, 'Fixed text');

      expect(el).toHaveValue('Fixed text');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. STATE MANAGEMENT - Управление состоянием
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('state management', () => {
    test('is disabled when disabled prop is true', () => {
      const el = renderTaskInput({ disabled: true });
      expect(el).toBeDisabled();
    });

    test('is readonly when readOnly prop is true', () => {
      const el = renderTaskInput({ readOnly: true });
      expect(el).toHaveAttribute('readonly');
    });

    test('submit button is disabled when input is disabled', () => {
      renderTaskInput({ disabled: true });

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    test('handles no errors gracefully', () => {
      const el = renderTaskInput({ issues: undefined });

      expect(el).toHaveAttribute('aria-invalid', 'false');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    test('handles empty errors array', () => {
      const el = renderTaskInput({ issues: [] });

      expect(el).toHaveAttribute('aria-invalid', 'false');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    test('applies data-invalid to container when errors exist', () => {
      // Используем _renderTaskInput для доступа к container
      const { renderRes } = _renderTaskInput({
        issues: createIssues('Error'),
      });

      const field = renderRes.container.querySelector('[data-invalid]');
      expect(field).toBeInTheDocument();
      expect(field).toHaveAttribute('data-invalid', 'true');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. EDGE CASES - Граничные случаи
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('edge cases', () => {
    test('handles undefined props', () => {
      // Все props undefined - должно работать корректно
      const el = renderTaskInput({
        label: undefined,
        placeholder: undefined,
        description: undefined,
        issues: undefined,
      });

      expect(el).toBeInTheDocument();
    });

    test('handles empty string values', () => {
      const el = renderTaskInput({
        label: '',
        placeholder: '',
        defaultValue: '',
      });

      expect(el).toBeInTheDocument();
      expect(el).toHaveValue('');
    });

    test('handles special characters', () => {
      const el = renderTaskInput();
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

      // fireEvent для быстрого изменения value (edge case)
      fireEvent.change(el, { target: { value: specialChars } });

      expect(el).toHaveValue(specialChars);
    });

    test('handles very long text', async () => {
      const el = renderTaskInput();
      const user = userEvent.setup();
      const longText = 'A'.repeat(1000);

      await user.type(el, longText);

      expect(el).toHaveValue(longText);
    });

    test('handles rapid typing', async () => {
      const el = renderTaskInput();

      // delay: 1ms для быстрого набора
      const user = userEvent.setup({ delay: 1 });

      await user.type(el, 'Fast typing test');

      expect(el).toHaveValue('Fast typing test');
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧩 HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Partial<T> делает все поля опциональными
type PropsPartial = Partial<TaskInputProps>;

/**
 * Factory function - создаёт React element с default props
 */
const makeTaskInput = (props: PropsPartial = {}) => {
  const defaultProps: TaskInputProps = {
    label: 'label',
    placeholder: 'placeholder',
    disabled: false,
    ...props, // ← Override defaults
  };

  return <TaskInput {...defaultProps} />;
};

/**
 * Advanced render - возвращает render result + textarea element
 * Используй когда нужен доступ к container
 */
const _renderTaskInput = (props: PropsPartial = {}) => {
  const renderRes = render(makeTaskInput(props));
  const renderTaskInput = renderRes.getByRole('textbox');
  return { renderRes, renderTaskInput };
};

/**
 * Main render helper - короткий синтаксис
 * Используй в 95% случаев
 */
const renderTaskInput = (props: PropsPartial = {}) =>
  _renderTaskInput(props).renderTaskInput;

/**
 * Создаёт одну Zod validation issue
 */
const createIssue = (message: string): z.core.$ZodIssue => ({
  code: 'custom' as const,
  path: ['description'],
  message,
});

/**
 * Создаёт массив Zod issues (для удобства)
 */
const createIssues = (message: string): z.core.$ZodIssue[] => [
  createIssue(message)
];
```

---

### Ключевые паттерны из примера

#### 1. **Структура с комментариями**

```typescript
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 IMPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Визуально разделяет секции файла.

---

#### 2. **5 категорий describe()**

```typescript
describe('<TaskInput />', () => {
  describe('rendering', () => {
    /* ... */
  });
  describe('accessibility', () => {
    /* ... */
  });
  describe('user interaction', () => {
    /* ... */
  });
  describe('state management', () => {
    /* ... */
  });
  describe('edge cases', () => {
    /* ... */
  });
});
```

Логическая группировка по функциям.

---

#### 3. **AAA в каждом тесте**

```typescript
test('allows text input', async () => {
  // ARRANGE - подготовка
  const el = renderTaskInput();
  const user = userEvent.setup();

  // ACT - действие
  await user.type(el, 'New task');

  // ASSERT - проверка
  expect(el).toHaveValue('New task');
});
```

---

#### 4. **Helper functions внизу**

```typescript
const renderTaskInput = (props = {}) => {
  /* ... */
};
const createIssue = (message: string) => {
  /* ... */
};
const createIssues = (message: string) => {
  /* ... */
};
```

DRY - Don't Repeat Yourself.

---

#### 5. **Комментарии в тестах**

```typescript
test('links both description and error via aria-describedby', () => {
  // aria-describedby может содержать несколько ID через пробел
  const el = renderTaskInput({
    description: 'Helper text',
    issues: createIssues('Error message'),
  });
  // ...
});
```

Объясняют **почему**, не **что**.

---

### Запуск тестов

```bash
# Запустить все тесты
npm test

# Только TaskInput тесты
npm test TaskInput.spec

# С coverage
npm run test:cov

# Watch mode
npm run test:watch
```

---

### Результат выполнения

```
 ✓ src/components/TaskInput/TaskInput.spec.tsx (37) 1243ms
   ✓ <TaskInput /> (37)
     ✓ rendering (8)
       ✓ renders with label
       ✓ renders with placeholder
       ✓ renders without placeholder
       ✓ renders without label
       ✓ renders with description
       ✓ displays default value
       ✓ renders submit button
       ✓ forwards HTML attributes
     ✓ accessibility (10)
       ✓ uses label as accessible name
       ✓ uses placeholder as accessible name fallback
       ✓ uses description as accessible name fallback
       ✓ is not invalid by default
       ✓ is marked as invalid when errors exist
       ✓ displays error message
       ✓ links error message via aria-describedby
       ✓ links description via aria-describedby
       ✓ links both description and error via aria-describedby
       ✓ displays multiple error messages
       ✓ submit button has accessible label
     ✓ user interaction (7)
       ✓ allows text input
       ✓ allows multiline input
       ✓ updates value as user types
       ✓ clears value
       ✓ cannot be edited when disabled
       ✓ cannot be edited when readonly
       ✓ allows editing when invalid
     ✓ state management (6)
       ✓ is disabled when disabled prop is true
       ✓ is readonly when readOnly prop is true
       ✓ submit button is disabled when input is disabled
       ✓ handles no errors gracefully
       ✓ handles empty errors array
       ✓ applies data-invalid to container when errors exist
     ✓ edge cases (6)
       ✓ handles undefined props
       ✓ handles empty string values
       ✓ handles special characters
       ✓ handles very long text
       ✓ handles rapid typing

 Test Files  1 passed (1)
      Tests  37 passed (37)
   Start at  10:15:23
   Duration  1.24s
```

---

### 🔗 Связь со Storybook

**Stories и Tests работают вместе:**

| Storybook Story    | Test Category      | Цель                    |
| ------------------ | ------------------ | ----------------------- |
| `Playground`       | -                  | Ручная разработка       |
| `Default`          | `rendering`        | Базовый рендеринг       |
| `WithErrorMessage` | `accessibility`    | Проверка aria-invalid   |
| `Disabled`         | `state management` | Disabled state          |
| -                  | `user interaction` | Автоматическая проверка |
| -                  | `edge cases`       | Граничные случаи        |

**Переиспользование mock data:**

```typescript
// __tests__/mocks/issues.ts
export const mockIssues: z.core.$ZodIssue[] = [
  { code: 'custom', path: ['description'], message: 'Required' }
];

// TaskInput.spec.tsx
import { mockIssues } from './__tests__/mocks/issues';
test('shows error', () => {
  render(<TaskInput issues={mockIssues} />);
});

// TaskInput.stories.tsx
import { mockIssues } from './__tests__/mocks/issues';
export const WithError: Story = {
  args: { issues: mockIssues }
};
```

---

## 🎓 Итоги

### Что вы изучили

✅ **Основы тестирования**:

- Unit vs Integration тесты
- Naming convention (`.spec.tsx` vs `.test.tsx`)
- Testing Pyramid

✅ **Vitest & RTL**:

- vitest.config.ts
- @testing-library/react
- @testing-library/user-event
- @testing-library/jest-dom

✅ **Queries**:

- getBy*, queryBy*, findBy\*
- Priority order (ByRole > ByLabel > ByText)
- screen vs container

✅ **User Event**:

- userEvent.setup()
- type(), click(), clear()
- Special keys ({Enter}, {Backspace})
- userEvent vs fireEvent

✅ **Helper Functions**:

- renderTaskInput()
- createIssues()
- DRY принцип
- Partial<Props>

✅ **Accessibility**:

- ARIA attributes
- Semantic HTML
- role="alert"
- toHaveAccessibleName()

✅ **Mocking**:

- vi.fn()
- vi.mock()
- toHaveBeenCalled\*
- MSW

✅ **Test Categories**:

- rendering
- accessibility
- user interaction
- state management
- edge cases

✅ **Best Practices**:

- AAA pattern
- One behavior per test
- userEvent > fireEvent
- Queries by priority
- Cleanup автоматический

---

### Следующие шаги

1. **Практика**: Напишите тесты для своих компонентов
2. **Coverage**: Достигните 80%+ покрытия
3. **E2E**: Изучите Playwright для end-to-end тестов
4. **Integration**: Напишите `.test.tsx` с реальными зависимостями
5. **CI/CD**: Настройте автоматический запуск тестов

---

### Полезные ссылки

- **Vitest**: https://vitest.dev
- **React Testing Library**: https://testing-library.com/react
- **User Event**: https://testing-library.com/docs/user-event/intro
- **jest-dom**: https://github.com/testing-library/jest-dom
- **MSW**: https://mswjs.io
- **Playwright**: https://playwright.dev

---

**Happy Testing! 🧪✨**
