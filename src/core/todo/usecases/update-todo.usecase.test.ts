import { makeTodosRepository } from '@/core/__tests__/utils/make-helpers-test-todo-repository';
import { InvalidTodo } from '../schemas/todo.contract';
import { updateTodoUseCase } from './update-todo.usecase';

describe('UpdateTodoUseCase(integration)', async () => {
  const { clearDb } = await makeTodosRepository();
  beforeEach(clearDb);
  afterAll(clearDb);

  test('returns an error when ID is invalid', async () => {
    const result = await updateTodoUseCase('', {});
    console.log(result);
    expect(result).toStrictEqual({
      success: false,
      errors: ['Todo with this ID does not exist'],
    });
  });
  test('returns success when ID is valid and self delete the todo', async () => {
    const todoId = await getTodoId();
    const deletedAt = new Date().toISOString();
    const returnTest = await updateTodoUseCase(todoId, { deletedAt });
    expect(returnTest.success).toBe(true);
  });

  test('returns an error when trying to update a non-existent todo (ID)', async () => {
    expect(await updateTodoUseCase('non-existent-id', {})).toStrictEqual({
      success: false,
      errors: ['Todo with this ID does not exist'],
    });
  });
  test('should return error for invalid description', async () => {
    const todoId = await getTodoId();
    const res = (await updateTodoUseCase(todoId, { description: '' })) as InvalidTodo;
    expect(res.success).toBe(false);
    expect(res.errors).toHaveLength(1);
  });
});

async function getTodoId() {
  const { todos, insertTodoDb } = await makeTodosRepository();
  await insertTodoDb().values(todos);
  return todos[0].id;
}
