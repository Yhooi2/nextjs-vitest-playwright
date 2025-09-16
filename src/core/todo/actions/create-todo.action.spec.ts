import { makeTestTodoAction } from '@/core/__tests__/utilst/make-helpers-test-todo-action';
import { createTodoAction } from './create-todo.action';

describe('createTodoAction (Unit)', () => {
  const description = 'test description';

  test('calls createTodoUseCase', async () => {
    const { createTodoUseCaseSpy } = makeTestTodoAction();
    await createTodoAction(description);
    expect(createTodoUseCaseSpy).toHaveBeenCalledWith(description);
  });
  test('calls revalidatePath when creation succeeds', async () => {
    const { revalidatePathSpy } = makeTestTodoAction();
    await createTodoAction(description);
    expect(revalidatePathSpy).toHaveBeenCalledWith('/');
  });
  test('returns success flag and created todo when creation succeeds', async () => {
    const { successResult } = makeTestTodoAction();
    const result = await createTodoAction(description);
    expect(result).toStrictEqual(successResult);
  });

  test('does not call revalidatePath when creation fails', async () => {
    const { revalidatePathSpy, createTodoUseCaseSpy, errorsResult } = makeTestTodoAction();

    createTodoUseCaseSpy.mockResolvedValue(errorsResult);
    await createTodoAction(description);
    expect(revalidatePathSpy).not.toHaveBeenCalled();
  });

  test('returns error(s) when creation fails', async () => {
    const { createTodoUseCaseSpy, errorsResult } = makeTestTodoAction();

    createTodoUseCaseSpy.mockResolvedValue(errorsResult);
    const result = await createTodoAction(description);

    expect(result).toStrictEqual(errorsResult);
  });
});
