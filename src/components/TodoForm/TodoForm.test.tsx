import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoForm } from '.';

const user = userEvent.setup();

describe('TodoForm Component integration', () => {
  test('render all form component', () => {
    const { input, btn } = renderForm();
    expect(input).toBeInTheDocument();
    expect(btn).toBeInTheDocument();
  });
  test('call the action whith the correct values', async () => {
    const { input, btn, action } = renderForm();
    await user.type(input, 'new task');
    await user.click(btn);
    expect(action).toHaveBeenCalledWith('new task');
  });
  test('trim whitespace from description before submitting', async () => {
    const { input, btn, action } = renderForm();
    await user.type(input, '   new task ');
    await user.click(btn);
    expect(action).toHaveBeenCalledWith('new task');
  });
  test('show validation error when submit empty form', async () => {
    const { btn } = renderForm();
    await user.click(btn);
    const error = await screen.findByRole('alert');
    expect(error).toBeInTheDocument();
    expect(error).toHaveTextContent('Task must not be empty!');
  });
  test('disable form elements when submitting', async () => {
    const { input, btn } = renderForm({ delay: 5 });
    await user.type(input, '   new task ');
    await user.click(btn);
    await waitFor(() => {
      expect(input).toBeDisabled();
      expect(btn).toBeDisabled();
    });
    await waitFor(() => {
      expect(input).toBeEnabled();
      expect(btn).toBeEnabled();
    });
  });
  test('change button text when submitting', async () => {
    const { input, btn } = renderForm({ delay: 5 });
    await user.type(input, '   new task ');
    expect(btn).toHaveTextContent('Create Task');
    await user.click(btn);
    await waitFor(() => expect(btn).toHaveTextContent('Creating Task...'));
    await waitFor(() => expect(btn).toHaveTextContent('Create Task'));
  });
  test('reset form on successful submission', async () => {
    const { input, btn } = renderForm();
    await user.type(input, 'new task');
    expect(input).toHaveValue('new task');
    await user.click(btn);
    expect(input).toHaveValue('');
  });

  test('display error message on failed submission', async () => {
    const { input, btn } = renderForm({ success: false });
    await user.type(input, 'new task');
    await user.click(btn);
    const error = await screen.findByRole('alert');
    expect(error).toHaveTextContent('Error creating todo');
    expect(input).toHaveAttribute('aria-describedby', error.id);
  });
  test('keep text in the input when action returns an error', async () => {
    const { input, btn } = renderForm({ success: false });
    await user.type(input, 'new task');
    await user.click(btn);
    expect(input).toHaveValue('new task');
  });
});

type RenderForm = {
  delay?: number;
  success?: boolean;
};

function renderForm({ delay = 0, success = true }: RenderForm = {}) {
  const result = success
    ? { success: true, todo: { id: 'id', description: 'desc', createdAt: 'data' } }
    : { success: false, errors: ['Error creating todo'] };
  // Render the TodoForm component with a mock action that simulates a delay
  // and returns the specified result.
  const actionNoDelay = vi.fn().mockResolvedValue(result);
  const actionDelay = vi.fn().mockImplementation(
    () =>
      new Promise((resolve) => {
        setTimeout(() => resolve(result), delay);
      })
  );
  const action = delay > 0 ? actionDelay : actionNoDelay;
  render(<TodoForm action={action} />);
  const input = screen.getByLabelText('Task');
  const btn = screen.getByRole('button');
  return { input, btn, action };
}
