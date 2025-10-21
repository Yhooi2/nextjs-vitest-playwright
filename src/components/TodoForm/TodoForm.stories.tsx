// TodoForm.stories.tsx
import { todoActionStoryMock } from '@/core/__tests__/mocks/todo-action-story';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { TodoForm } from '.';

const meta = {
  title: 'Design System/TodoForm',
  component: TodoForm,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof TodoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    action: todoActionStoryMock.create.success,
    todos: [],
  },
};

export const WithError: Story = {
  args: {
    action: todoActionStoryMock.create.error,
    todos: [],
  },
};
