// TodoForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { TodoForm } from '.';
import { TodoPresenter } from '@/core/todo/schemas/todo.contract';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('TodoForm Component integration', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render all form elements', () => {
      const { input, btn } = renderForm();

      expect(input).toBeInTheDocument();
      expect(btn).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Add new task... (⌘K to focus)');
    });

    test('should auto-focus input on mount', () => {
      const { input } = renderForm();

      expect(input).toHaveFocus();
    });
  });

  describe('Form submission', () => {
    test('should call action with correct values', async () => {
      const { input, btn, action } = renderForm();

      await user.type(input, 'new task');
      await user.click(btn);

      await waitFor(() => {
        expect(action).toHaveBeenCalledTimes(1);
      });

      expect(action).toHaveBeenCalledWith('new task');
    });

    test('should trim whitespace before submitting', async () => {
      const { input, btn, action } = renderForm();

      await user.type(input, '  new task  ');
      await user.click(btn);

      await waitFor(() => {
        expect(action).toHaveBeenCalledWith('new task');
      });
    });

    test('should sanitize input', async () => {
      const { input, btn, action } = renderForm();

      await user.type(input, '  task  ');
      await user.click(btn);

      expect(action).toHaveBeenCalled();
      expect(action).toBeCalledWith('task');
    });

    test('should reset form on successful submission', async () => {
      const { input, btn } = renderForm();

      await user.type(input, 'new task');
      expect(input).toHaveValue('new task');

      await user.click(btn);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    test('should call onSuccess callback after successful submission', async () => {
      const onSuccess = vi.fn();
      const { input, btn } = renderForm({ onSuccess });

      await user.type(input, 'new task');
      await user.click(btn);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith('new task');
      });
    });

    test('should show success toast after successful submission', async () => {
      const { input, btn } = renderForm();

      await user.type(input, 'new task');
      await user.click(btn);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Task created', {
          description: 'new task',
        });
      });
    });
  });

  describe('Validation', () => {
    test('should show error when submitting empty form', async () => {
      const { btn } = renderForm();

      await user.click(btn);

      const error = await screen.findByRole('alert');
      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent('Task must not be empty!');
    });

    test('should show error for whitespace-only input', async () => {
      const { input, btn } = renderForm();

      await user.type(input, '   ');
      await user.click(btn);

      const error = await screen.findByRole('alert');
      expect(error).toHaveTextContent('Task must not be empty!');
    });

    test('should show error when input exceeds 200 characters', async () => {
      const { input, btn } = renderForm();
      const longText = 'a'.repeat(201);

      await user.type(input, longText);
      await user.click(btn);

      const error = await screen.findByRole('alert');
      expect(error).toHaveTextContent('Task must not be more 200 letters!');
    });

    test('should accept input with exactly 200 characters', async () => {
      const { input, btn, action } = renderForm();
      const exactText = 'a'.repeat(200);

      await user.type(input, exactText);
      await user.click(btn);

      await waitFor(() => {
        expect(action).toHaveBeenCalledWith(exactText);
      });
    });
  });

  describe('Loading state', () => {
    test('should disable form elements when submitting', async () => {
      const { input, btn } = renderForm({ delay: 100 });

      await user.type(input, 'new task');
      await user.click(btn);

      await waitFor(() => {
        expect(input).toBeDisabled();
        expect(btn).toBeDisabled();
      });
    });

    test('should enable form elements after submission completes', async () => {
      const { input, btn } = renderForm({ delay: 100 });

      await user.type(input, 'new task');
      await user.click(btn);

      await waitFor(() => {
        expect(input).toBeDisabled();
      });

      await waitFor(
        () => {
          expect(input).toBeEnabled();
          expect(btn).toBeEnabled();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Error handling', () => {
    test('should display server error message on failed submission', async () => {
      const { input, btn } = renderForm({ success: false });

      await user.type(input, 'new task');
      await user.click(btn);

      const error = await screen.findByRole('alert');
      expect(error).toHaveTextContent('Error creating todo');
    });

    test('should show error toast on failed submission', async () => {
      const { input, btn } = renderForm({ success: false });

      await user.type(input, 'new task');
      await user.click(btn);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to create task', {
          description: 'Error creating todo',
        });
      });
    });

    test('should keep text in input when action returns error', async () => {
      const { input, btn } = renderForm({ success: false });

      await user.type(input, 'new task');
      await user.click(btn);

      await screen.findByRole('alert');
      expect(input).toHaveValue('new task');
    });

    test('should link error message to input via aria-describedby', async () => {
      const { input, btn } = renderForm({ success: false });

      await user.type(input, 'new task');
      await user.click(btn);

      const error = await screen.findByRole('alert');
      expect(input).toHaveAttribute('aria-describedby', expect.stringContaining(error.id));
    });

    test('should not call onSuccess callback on failed submission', async () => {
      const onSuccess = vi.fn();
      const { input, btn } = renderForm({ success: false, onSuccess });

      await user.type(input, 'new task');
      await user.click(btn);

      await screen.findByRole('alert');
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard shortcuts', () => {
    test('should focus input when Cmd+K is pressed', async () => {
      const { input } = renderForm();

      input.blur();
      expect(input).not.toHaveFocus();

      await user.keyboard('{Meta>}k{/Meta}');

      expect(input).toHaveFocus();
    });

    test('should focus input when Ctrl+K is pressed', async () => {
      const { input } = renderForm();

      input.blur();
      expect(input).not.toHaveFocus();

      await user.keyboard('{Control>}k{/Control}');

      expect(input).toHaveFocus();
    });

    test('should prevent default behavior for Cmd+K', async () => {
      renderForm();

      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
        bubbles: true,
        cancelable: true,
      });

      const spy = vi.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Optimistic updates', () => {
    test('should show optimistic todo before server response', async () => {
      const { input, btn } = renderForm({ delay: 100 });

      await user.type(input, 'new task');
      await user.click(btn);

      await waitFor(() => {
        expect(input).toBeDisabled();
      });
    });
  });
});

type RenderForm = {
  delay?: number;
  success?: boolean;
  onSuccess?: (description: string) => void;
};

function renderForm({ delay = 0, success = true, onSuccess }: RenderForm = {}) {
  const result:TodoPresenter = success
    ? { success: true, todo: { id: 'id', description: 'desc', createdAt: 'data' } }
    : { success: false, errors: ['Error creating todo'] };

  const actionNoDelay = vi.fn().mockResolvedValue(result);
  const actionDelay = vi.fn().mockImplementation(
    () =>
      new Promise((resolve) => {
        setTimeout(() => resolve(result), delay);
      })
  );

  const action = delay > 0 ? actionDelay : actionNoDelay;

  render(<TodoForm action={action} todos={[]} onSuccess={onSuccess} />);

  const input = screen.getByRole('textbox', { name: /new task/i });
  const btn = screen.getByRole('button', { name: /create task/i });

  return { input, btn, action };
}
