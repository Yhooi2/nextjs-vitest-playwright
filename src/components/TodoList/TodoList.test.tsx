import { mockTodos } from '@/core/__tests__/mocks/todos';
import { Todo, TodoPresenter } from '@/core/todo/schemas/todo.contract';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toaster } from 'sonner';
import { TodoList } from '.';

function getToastByType(type: 'success' | 'error' | 'info' | 'warning') {
  return document.querySelector(`[data-sonner-toast][data-type="${type}"]`);
}

const user = userEvent.setup();
describe('<TodoList /> (integration)', () => {
  describe('Rendering', () => {
    test('render list, and TODO list items', async () => {
      const { todos } = renderList();
      const list = screen.getByRole('list');
      const listitems = screen.getAllByRole('listitem');
      expect(list).toHaveAttribute('aria-labelledby');
      expect(listitems).toHaveLength(todos.length);
    });
    test('render each TODO item with description and delete button', async () => {
      const { todos } = renderList();
      const listitems = screen.getAllByRole('listitem');
      listitems.forEach((item, index) => {
        expect(within(item).getByText(todos[index].description)).toBeInTheDocument();
        const deleteButton = within(item).getByRole('button', {
          name: `Delete task: ${todos[index].description}`,
        });
        expect(deleteButton).toBeInTheDocument();
      });
    });

    test('not render the list of items without TODOs', async () => {
      renderList({ todos: [] });
      const list = screen.queryByRole('list');
      expect(list).not.toBeInTheDocument();
    });
    test('render the empty state when there are no TODOs', async () => {
      renderList({ todos: [] });
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Action', () => {
    test('call action after clicking delete', async () => {
      const { action } = renderList();
      const items = screen.getAllByRole('listitem');
      await user.click(within(items[0]).getByRole('button'));
      expect(action).toHaveBeenCalledOnce();
    });

    test('call action for each list item', async () => {
      const { action, todos } = renderList();
      const listitems = screen.getAllByRole('listitem');

      for (const item of listitems) {
        await user.click(within(item).getByRole('button'));
      }
      expect(action).toHaveBeenCalledTimes(todos.length);
    });
  });
  describe('Notfications', () => {
    test('show undo toast success when deleting a TODO', async () => {
      renderList();
      const items = screen.getAllByRole('listitem');
      await user.click(within(items[0]).getByRole('button'));
      expect(getToastByType('success')).toBeInTheDocument();
    });

    test('notify the user if there is an error when deleting the TODO', async () => {
      renderList({ success: false });
      const items = screen.getAllByRole('listitem');
      await user.click(within(items[0]).getByRole('button'));
      expect(getToastByType('error')).toBeInTheDocument();
    });
  });
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
      <TodoList action={action} todos={todos} />
      <Toaster />
    </>
  );
  return { action, renderResult, todos };
}
