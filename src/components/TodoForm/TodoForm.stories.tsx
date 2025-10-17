import { type CreateTodoAction } from '@/core/todo/actions/todo.action.types';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import { TodoForm } from '.';

const meta = {
  title: 'Disign Sistem/TodoForm',
  component: TodoForm,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof TodoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    action: fn(async (desc: string) => ({
      success: true,
      todo: { id: 'id', description: 'desc', createdAt: 'data' },
    })) as CreateTodoAction,
  },
};

export const WhithError: Story = {
  args: {
    action: fn(async (desc: string) => ({
      success: false,
      errors: ['Error creating todo'],
    })) as CreateTodoAction,
  },
};
