import { CreateTodoAction, DeleteTodoAction } from '@/core/todo/actions/todo.action.types';
import { fn } from 'storybook/internal/test';

export const todoActionStoryMock = {
  create: {
    success: fn(async (desc: string) => ({
      success: true,
      todo: { id: 'id', description: desc, createdAt: 'data' },
    })) as CreateTodoAction,
    error: fn(async (desc: string) => ({
      success: false,
      errors: [`Error creating todo: ${desc}`],
    })) as CreateTodoAction,
  },
  delete: {
    success: fn(async (desc: string) => ({
      success: true,
      todo: { id: 'id', description: desc, createdAt: 'data' },
    })) as DeleteTodoAction,
    error: fn(async (desc: string) => ({
      success: false,
      errors: [`Error deleting todo: ${desc}`],
    })) as DeleteTodoAction,
    delayedSuccess: fn(async (desc: string) => {
      await new Promise((r) => setTimeout(r, 1000));
      return { success: true, todo: { id: 'id', description: desc, createdAt: 'data' } };
    }) as DeleteTodoAction,
    delayedError: fn(async (desc: string) => {
      await new Promise((r) => setTimeout(r, 1000));
      return { success: false, errors: [`Error deleting todo: ${desc}`] };
    }) as DeleteTodoAction,
  },
};
