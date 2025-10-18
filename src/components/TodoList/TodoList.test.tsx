import { mockTodos } from '@/core/__tests__/mocks/todos';
import { Todo, TodoPresenter } from '@/core/todo/schemas/todo.contract';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toaster } from 'sonner';
import { TodoList } from '.';

const DELETE_DELAY = 5100;

const user = userEvent.setup();
describe('<TodoList /> (integration)', () => {
  describe('Rendering', () => {
    test('should render list, and TODO list items', async () => {
      const { todos } = renderList();
      const list = screen.getByRole('list');
      const listitems = screen.getAllByRole('listitem');
      expect(list).toHaveAttribute('aria-labelledby');
      expect(listitems).toHaveLength(todos.length);
    });

    test('should not render the list of items without TODOs', async () => {
      renderList({ todos: [] });
      const list = screen.queryByRole('list');
      expect(list).not.toBeInTheDocument();
    });
  });
  describe('Optimistic Updates', () => {
    test('should hide item immediately after clicking delete', async () => {
      const { todos } = renderList();
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(todos.length);

      expect(items[0]).toBeInTheDocument();
      await user.click(within(items[0]).getByRole('button'));

      expect(items[0]).not.toBeInTheDocument();
    });
  });

  test('should call the correct action for each list item', async () => {
    const { action, todos } = renderList();
    const listitems = screen.getAllByRole('listitem');
    vi.useFakeTimers();

    listitems.forEach(async (item) => {
      await user.click(within(item).getByRole('button'));
    });
    await vi.advanceTimersByTimeAsync(DELETE_DELAY);
    expect(action).toHaveBeenCalledTimes(todos.length);
    vi.useRealTimers();
  });
  test('should hide item while sending the action', async () => {
    renderList();
    expect(screen.queryByText('Task deleted')).not.toBeInTheDocument();

    //Delete
    await user.click(screen.getAllByRole('button')[0]);

    // Verify toast appeared
    expect(await screen.findByText('Task deleted')).toBeInTheDocument();
  });

  test('should disable the list buttons while sending the action', async () => {});

  test('should notify the user if there is an error when deleting the TODO', async () => {});

  test('should not call the action if the ID is invalid, empty, or formed only with spaces', async () => {});
});

type RenderListProps = {
  delay?: number;
  success?: boolean;
  todos?: Todo[];
};

function renderList({ delay = 0, success = true, todos = mockTodos }: RenderListProps = {}) {
  const result: TodoPresenter = success
    ? { success: true, todo: { id: 'id', description: 'description', createdAt: 'date' } as Todo }
    : { success: false, errors: ['Error deleting todo'] };

  const actionNoDelay = vi.fn().mockResolvedValue(result);
  const actionDelay = vi
    .fn()
    .mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(result), delay)));

  const action = delay > 0 ? actionDelay : actionNoDelay;

  const renderResult = render(
    <>
      <TodoList action={action} todos={todos} /> <Toaster />
    </>
  );
  return { action, renderResult, todos };
}
