import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import z from 'zod';
import { TaskInput, TaskInputProps } from './index';

describe('<TaskInput />', () => {
  describe('rendering', () => {
    test('renders with label', () => {
      const el = renderTaskInput({ label: 'Task Description' });
      const label = screen.getByText('Task Description');

      expect(label).toBeInTheDocument();
      expect(label.tagName).toBe('LABEL');
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

  describe('accessibility', () => {
    test('uses label as accessible name', () => {
      const el = renderTaskInput({ label: 'Task Title' });
      expect(el).toHaveAttribute('aria-label', 'Task Title');
    });

    test('uses placeholder as accessible name fallback', () => {
      const el = renderTaskInput({
        label: undefined,
        placeholder: 'Enter your task',
      });
      expect(el).toHaveAttribute('aria-label', 'Enter your task');
    });

    test('uses description as accessible name fallback', () => {
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
      const el = renderTaskInput({ issues: createIssues('Error') });
      const user = userEvent.setup();

      await user.type(el, 'Fixed text');
      expect(el).toHaveValue('Fixed text');
    });
  });

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
      expect(field).toBeInTheDocument();
      expect(field).toHaveAttribute('data-invalid', 'true');
    });
  });

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

    test('handles special characters', async () => {
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
  });
});

// ============================================================================
// Helper functions
// ============================================================================

type PropsPartial = Partial<TaskInputProps>;

const makeTaskInput = (props: PropsPartial = {}) => {
  const defaultProps: TaskInputProps = {
    label: 'label',
    placeholder: 'placeholder',
    disabled: false,
    ...props,
  };

  return <TaskInput {...defaultProps} />;
};

const _renderTaskInput = (props: PropsPartial = {}) => {
  const renderRes = render(makeTaskInput(props));
  const renderTaskInput = renderRes.getByRole('textbox');
  return { renderRes, renderTaskInput };
};

const renderTaskInput = (props: PropsPartial = {}) => _renderTaskInput(props).renderTaskInput;

const createIssue = (message: string): z.core.$ZodIssue => ({
  code: 'custom' as const,
  path: ['description'],
  message,
});

const createIssues = (message: string): z.core.$ZodIssue[] => [createIssue(message)];
