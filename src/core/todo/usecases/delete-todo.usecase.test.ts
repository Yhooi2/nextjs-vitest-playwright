import { makeTodosRepository } from '@/core/__tests__/utils/make-helpers-test-todo-repository';
import { deleteTodoUseCase } from './delete-todo.usecase';

describe('DeleteTodoUseCase (integration)', async () => {
  const { clearDb } = await makeTodosRepository();
  beforeEach(clearDb);
  afterAll(clearDb);

  test('returns an error when ID is invalid', async () => {
    expect(await deleteTodoUseCase('')).toStrictEqual({ success: false, errors: ['Invalid ID'] });
  });
  test('returns success when ID is valid and deletes the todo', async () => {
    const { todos, insertTodoDb } = await makeTodosRepository();
    await insertTodoDb().values(todos);
    const returnTest = await deleteTodoUseCase(todos[0].id);
    expect(returnTest).toStrictEqual({ success: true, todo: todos[0] });
  });
  test('returns an error when trying to delete a non-existent todo (ID)', async () => {
    expect(await deleteTodoUseCase('non-existent-id')).toStrictEqual({
      success: false,
      errors: ['Todo with this ID does not exist'],
    });
  });
});
