import { CreateTodoAction, DeleteTodoAction } from '@/core/todo/actions/todo.action.types';
import { fn } from 'storybook/internal/test';

export const todoActionStoryMock = {
  create: {
    success: fn<CreateTodoAction>(async (desc: string) => ({
      success: true,
      todo: { id: 'id', description: desc, createdAt: 'data' },
    })),
    error: fn<CreateTodoAction>(async (desc: string) => ({
      success: false,
      errors: [`Error creating todo: ${desc}`],
    })),
  },
  delete: {
    success: fn<DeleteTodoAction>(async (id: string) => ({
      success: true,
      todo: { id, description: 'Mock deleted todo', createdAt: new Date().toISOString() },
    })),
    error: fn<DeleteTodoAction>(async (id: string) => ({
      success: false,
      errors: [`Error deleting todo with id: ${id}`],
    })),
    delayedSuccess: fn<DeleteTodoAction>(async (id: string) => {
      await new Promise((r) => setTimeout(r, 1000));
      return {
        success: true,
        todo: { id, description: 'Mock deleted todo', createdAt: new Date().toISOString() },
      };
    }),
    delayedError: fn<DeleteTodoAction>(async (id: string) => {
      await new Promise((r) => setTimeout(r, 1000));
      return { success: false, errors: [`Error deleting todo with id: ${id}`] };
    }),
  },
};
