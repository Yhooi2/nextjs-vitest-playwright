import { todoActionStoryMock } from '@/core/__tests__/mocks/todo-action-story';
import { mockTodos } from '@/core/__tests__/mocks/todos';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { TodoList } from '.';

const meta = {
  title: 'Design System/TodoList',
  component: TodoList,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    todos: { control: false },
  },
} satisfies Meta<typeof TodoList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    todos: mockTodos,
    action: todoActionStoryMock.delete.success,
  },
};
export const WhithError: Story = {
  args: {
    todos: mockTodos,
    action: todoActionStoryMock.delete.error,
  },
};
export const WhithDelay: Story = {
  args: {
    todos: mockTodos,
    action: todoActionStoryMock.delete.delayedSuccess,
  },
};
export const WhithDelayError: Story = {
  args: {
    todos: mockTodos,
    action: todoActionStoryMock.delete.delayedSuccess,
  },
};
