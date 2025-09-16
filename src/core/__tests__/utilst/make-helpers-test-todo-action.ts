import { InvalidTodo, ValidTodo } from '@/core/todo/schemas/todo.contract';
import * as createTodoUseCaseMod from '@/core/todo/usecases/create-todo.usecase';
import * as deleteTodoUseCaseMod from '@/core/todo/usecases/delete-todo.usecase';
import { revalidatePath } from 'next/cache';

vi.mock('next/cache', () => {
  return {
    revalidatePath: vi.fn(),
  };
});

export function makeTestTodoAction() {
  const successResult = {
    success: true,
    todo: { id: 'id', description: 'test', createdAt: 'createdAt' },
  } as ValidTodo;

  const errorsResult = {
    success: false,
    errors: ['error', 'any'],
  } as InvalidTodo;

  const createTodoUseCaseSpy = vi
    .spyOn(createTodoUseCaseMod, 'createTodoUseCase')
    .mockResolvedValue(successResult);

  const deleteTodoUseCaseSpy = vi
    .spyOn(deleteTodoUseCaseMod, 'deleteTodoUseCase')
    .mockResolvedValue(successResult);

  const revalidatePathSpy = vi.mocked(revalidatePath);

  return {
    createTodoUseCaseSpy,
    deleteTodoUseCaseSpy,
    revalidatePathSpy,
    successResult,
    errorsResult,
  };
}
