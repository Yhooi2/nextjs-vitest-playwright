import { revalidatePath } from 'next/cache';
import { InvalidTodo, ValidTodo } from '../schemas/todo.contract';
import * as CreateTodoUseCaseMod from '../usecases/create-todo.usecase';
import { createTodoAction } from './create-todo.action';

vi.mock('next/cache', () => {
  return {
    revalidatePath: vi.fn(),
  };
});

function makeMoks() {
  const successResult = {
    success: true,
    todo: { id: 'id', description: 'test', createdAt: 'createdAt' },
  } as ValidTodo;

  const errorsResult = {
    success: false,
    errors: ['error', 'any'],
  } as InvalidTodo;

  const createTodoUseCaseSpy = vi
    .spyOn(CreateTodoUseCaseMod, 'CreateTodoUseCase')
    .mockResolvedValue(successResult);

  const revalidatePathSpy = vi.mocked(revalidatePath);

  return { createTodoUseCaseSpy, revalidatePathSpy, successResult, errorsResult };
}

describe('createTodoAction (unit)', () => {
  const description = 'test description';

  test('calls createTodoUseCase', async () => {
    const { createTodoUseCaseSpy } = makeMoks();
    await createTodoAction(description);
    expect(createTodoUseCaseSpy).toHaveBeenCalledWith(description);
  });
  test('calls revalidatePath when creation succeeds', async () => {
    const { revalidatePathSpy } = makeMoks();
    await createTodoAction(description);
    expect(revalidatePathSpy).toHaveBeenCalledWith('/');
  });
  test('returns success flag and created todo when creation succeeds', async () => {
    const { successResult } = makeMoks();
    const result = await createTodoAction(description);
    expect(result).toStrictEqual(successResult);
  });

  test('does not call revalidatePath when creation fails', async () => {
    const { revalidatePathSpy, createTodoUseCaseSpy, errorsResult } = makeMoks();

    createTodoUseCaseSpy.mockResolvedValue(errorsResult);
    await createTodoAction(description);
    expect(revalidatePathSpy).not.toHaveBeenCalled();
  });

  test('returns error(s) when creation fails', async () => {
    const { createTodoUseCaseSpy, errorsResult } = makeMoks();

    createTodoUseCaseSpy.mockResolvedValue(errorsResult);
    const result = await createTodoAction(description);

    expect(result).toStrictEqual(errorsResult);
  });
});
