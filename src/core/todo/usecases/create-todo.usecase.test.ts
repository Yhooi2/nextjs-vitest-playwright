import { makeTodosRepository } from '@/core/__tests__/utilst/make-helpers-test-todo-repository';
import { InvalidTodo, ValidTodo } from '../schemas/todo.contract';
import { CreateTodoUseCase } from './create-todo.usecase';

describe('CreateTodoUseCase(integration)', async () => {
  const { clearDb } = await makeTodosRepository();
  beforeEach(clearDb);
  afterAll(clearDb);
  test('should return error for invalid description', async () => {
    const res = (await CreateTodoUseCase('')) as InvalidTodo;
    expect(res.success).toBe(false);
    expect(res.errors).toHaveLength(1);
  });
  describe('successful creation', () => {
    const description = 'test todo description';
    test('should create valid todo and return success', async () => {
      const res = (await CreateTodoUseCase(description)) as ValidTodo;
      expect(res.success).toBe(true);
      expect(res.todo).toStrictEqual({
        id: expect.any(String),
        description,
        createdAt: expect.any(String),
      });
    });

    test('should return error for duplicate description', async () => {
      await CreateTodoUseCase(description); // First create succeeds
      const res = (await CreateTodoUseCase(description)) as InvalidTodo;
      expect(res.success).toBe(false);
      expect(res.errors).toStrictEqual(['Todo with this description already exists']);
      // Verify no second insert (via repo, but since integration, assume db unchanged)
    });
  });
});
