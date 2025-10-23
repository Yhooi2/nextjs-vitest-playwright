import { todoActionStoryMock } from '@/core/__tests__/mocks/todo-action-story';
import { mockTodos } from '@/core/__tests__/mocks/todos';
import type { Todo } from '@/core/todo/schemas/todo.contract';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { TodoList } from '.';

const meta: Meta<typeof TodoList> = {
  title: 'Design System/TodoList',
  component: TodoList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    todos: {
      description: 'Array of todo items to display',
      control: 'object',
    },
    action: {
      description: 'Delete action function',
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// =====================================
// HELPER FUNCTIONS
// =====================================

function generateTodos(count: number): Todo[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `todo-${Date.now()}-${i}`,
    description: `Task #${i + 1}`,
    createdAt: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
  }));
}

const singleTodo: Todo[] = [mockTodos[0]];
const manyTodos = generateTodos(20);

// =====================================
// STATE VARIATIONS
// =====================================

/**
 * Empty state - shows message when list is empty.
 * Critical for first-time user experience.
 */
export const Empty: Story = {
  args: {
    todos: [],
    action: todoActionStoryMock.delete.success,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const emptyMessage = canvas.getByRole('status');
    expect(emptyMessage).toHaveTextContent(/no tasks yet/i);
  },
};

/**
 * Single item - checks layout and plural forms.
 */
export const SingleTodo: Story = {
  args: {
    todos: singleTodo,
    action: todoActionStoryMock.delete.success,
  },
};

/**
 * Default state - 3 tasks (like in production).
 * Main story for designers.
 */
export const Default: Story = {
  args: {
    todos: mockTodos,
    action: todoActionStoryMock.delete.success,
  },
};

/**
 * Many items - performance and scroll test.
 */
export const ManyTodos: Story = {
  args: {
    todos: manyTodos,
    action: todoActionStoryMock.delete.success,
  },
  parameters: {
    layout: 'padded',
  },
};

// =====================================
// ERROR HANDLING
// =====================================

/**
 * Error on delete - shows error toast.
 */
export const WithError: Story = {
  args: {
    todos: mockTodos,
    action: todoActionStoryMock.delete.error,
  },
};

/**
 * Delay on delete - demonstrates optimistic update.
 */
export const WithDelay: Story = {
  args: {
    todos: mockTodos,
    action: todoActionStoryMock.delete.delayedSuccess,
  },
};

/**
 * Delay + error - demonstrates recovery after error.
 * Item will return after 1 second.
 */
export const WithDelayError: Story = {
  args: {
    todos: mockTodos,
    action: todoActionStoryMock.delete.delayedError,
  },
};

// =====================================
// INTERACTIVE TESTS
// =====================================

/**
 * Interactive test - automatically deletes first task.
 */
export const Interactive: Story = {
  args: {
    todos: mockTodos,
    action: todoActionStoryMock.delete.success,
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step('Initial state: 3 tasks', async () => {
      expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    });

    await step('Click Delete on first task', async () => {
      const deleteBtn = canvas.getAllByRole('button', { name: /delete/i })[0];
      await userEvent.click(deleteBtn);
    });

    await step('Task deleted', async () => {
      await waitFor(() => {
        expect(canvas.queryAllByRole('listitem')).toHaveLength(2);
      });
    });

    await step('Action was called with correct ID', async () => {
      expect(args.action).toHaveBeenCalledWith('1746472743268');
    });
  },
};

/**
 * Delete all tasks - transition to Empty State.
 */
export const DeleteAll: Story = {
  args: {
    todos: mockTodos,
    action: todoActionStoryMock.delete.success,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Delete all 3 tasks', async () => {
      for (let i = 0; i < 3; i++) {
        const deleteBtn = canvas.getAllByRole('button', { name: /delete/i })[0];
        await userEvent.click(deleteBtn);
        await waitFor(() => {
          expect(canvas.queryAllByRole('listitem')).toHaveLength(2 - i);
        });
      }
    });

    await step('Check Empty State', async () => {
      const emptyMessage = canvas.getByRole('status');
      expect(emptyMessage).toHaveTextContent(/no tasks yet/i);
    });
  },
};

/**
 * Test optimistic updates with delay.
 */
export const OptimisticUpdate: Story = {
  args: {
    todos: mockTodos,
    action: todoActionStoryMock.delete.delayedSuccess,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Before click: 3 tasks', async () => {
      expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    });

    await step('Click Delete', async () => {
      const deleteBtn = canvas.getAllByRole('button', { name: /delete/i })[0];
      await userEvent.click(deleteBtn);
    });

    await step('INSTANTLY disappeared (optimistic)', async () => {
      expect(canvas.queryAllByRole('listitem')).toHaveLength(2);
    });

    await step('Wait 1 sec (server response)', async () => {
      await new Promise((r) => setTimeout(r, 1100));
    });

    await step('Still 2 tasks (success confirmed)', async () => {
      expect(canvas.queryAllByRole('listitem')).toHaveLength(2);
    });
  },
};

/**
 * Accessibility - check ARIA attributes.
 */
export const Accessibility: Story = {
  args: {
    todos: mockTodos,
    action: todoActionStoryMock.delete.success,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Check role="list" and aria-label', async () => {
      const list = canvas.getByRole('list');
      expect(list).toHaveAttribute('aria-label', 'Todo list');
    });

    await step('Check role="listitem" for all items', async () => {
      const listItems = canvas.getAllByRole('listitem');
      expect(listItems).toHaveLength(3);
    });

    await step('Check aria-label for Delete buttons', async () => {
      const deleteButtons = canvas.getAllByRole('button', { name: /delete task:/i });
      expect(deleteButtons).toHaveLength(3);
      expect(deleteButtons[0]).toHaveAccessibleName('Delete task: Make coffee');
    });
  },
};
