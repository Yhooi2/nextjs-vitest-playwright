import { makeTestTodoAction } from '@/core/__tests__/utils/make-helpers-test-todo-action';
import { deleteTodoAction } from './delete-todo-action';

describe('deleteTodoAction (Unit)', async () => {
  const fakeId = 'fakeId';
  test('calls deleteTodoUseCase', async () => {
    const { deleteTodoUseCaseSpy } = makeTestTodoAction();
    await deleteTodoAction(fakeId);
    expect(deleteTodoUseCaseSpy).toHaveBeenCalledExactlyOnceWith(fakeId);
  });
  test('calls revalidatePath whith props "/" when success delete', async () => {
    const { revalidatePathSpy } = makeTestTodoAction();
    await deleteTodoAction(fakeId);
    expect(revalidatePathSpy).toHaveBeenCalledExactlyOnceWith('/');
  });
  test('return success and deleted todo when success delete', async () => {
    const { successResult } = makeTestTodoAction();
    const deleteResult = await deleteTodoAction(fakeId);
    expect(deleteResult).toStrictEqual(successResult);
  });
  test('return false and arr errors when delete fails', async () => {
    const { errorsResult, deleteTodoUseCaseSpy } = makeTestTodoAction();
    deleteTodoUseCaseSpy.mockResolvedValue(errorsResult);
    const deleteResult = await deleteTodoAction(fakeId);
    expect(deleteResult).toStrictEqual(errorsResult);
  });
  test('does not calls revalidatePath when delete false at all', async () => {
    const { errorsResult, deleteTodoUseCaseSpy, revalidatePathSpy } = makeTestTodoAction();
    deleteTodoUseCaseSpy.mockResolvedValue(errorsResult);
    await deleteTodoAction(fakeId);
    expect(revalidatePathSpy).not.toBeCalled();
  });
});
