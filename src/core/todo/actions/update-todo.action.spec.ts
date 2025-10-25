import { makeTestTodoAction } from '@/core/__tests__/utils/make-test-todo-action';
import { updateTodoAction } from './update-todo.action';

describe('UpdateTodoAction (Unit)', () => {
  const todo = { deletedAt: new Date().toISOString() };
  const id = 'fakeId';
  test('calls updateTodoAction', async () => {
    const { updateTodoUseCaseSpy } = makeTestTodoAction();
    await updateTodoAction(id, todo);
    expect(updateTodoUseCaseSpy).toHaveBeenCalledExactlyOnceWith(id, todo);
  });
  test('return succes ', async () => {
    const { successResult } = makeTestTodoAction();
    const updateResult = await updateTodoAction(id, todo);
    expect(updateResult).toStrictEqual(successResult);
  });
  test('revalidatePath whith props "/" when success update', async () => {
    const { revalidatePathSpy } = makeTestTodoAction();
    await updateTodoAction(id, todo);
    expect(revalidatePathSpy).toHaveBeenCalledExactlyOnceWith('/');
  });
  test('return error when error update', async () => {
    const { errorsResult, updateTodoUseCaseSpy } = makeTestTodoAction();
    updateTodoUseCaseSpy.mockResolvedValue(errorsResult);
    const result = await updateTodoAction(id, todo);
    expect(result).toStrictEqual(errorsResult);
  });
  test('not revalidatePath when error update', async () => {
    const { revalidatePathSpy, errorsResult, updateTodoUseCaseSpy } = makeTestTodoAction();
    updateTodoUseCaseSpy.mockResolvedValue(errorsResult);
    await updateTodoAction(id, todo);
    expect(revalidatePathSpy).not.toHaveBeenCalled();
  });
});
