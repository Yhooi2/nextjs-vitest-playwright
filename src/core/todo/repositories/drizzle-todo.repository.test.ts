import {
  insertTestTodos,
  makeTodosRepository,
} from '@/core/__tests__/utils/make-helpers-test-todo-repository';

describe('DrizzleTodoRepository CRUD tests (integrations)', async () => {
  const { clearDb, repository, todos } = await makeTodosRepository();
  const successResult = { success: true, todo: todos[0] };
  beforeEach(async () => {
    await clearDb();
  });
  afterAll(async () => {
    await clearDb();
  });
  describe('findAll tests', () => {
    test('When no todos exist, findAll returns an empty array', async () => {
      const result = await repository.findAll();
      expect(result).toStrictEqual([]);
      expect(result).toHaveLength(0);
    });

    test('findAll returns todos in descending order', async () => {
      await insertTestTodos();
      expect(await repository.findAll()).toStrictEqual(
        todos.toSorted((a, b) => Number(b.createdAt) - Number(a.createdAt))
      );
    });
  });
  describe('create tests', () => {
    test('When one todo is created, func and findAll returns it', async () => {
      const result = await repository.create(todos[0]);
      expect(result).toStrictEqual(successResult);
      const finded = await repository.findAll();
      expect(finded).toHaveLength(1);
      expect(finded).toStrictEqual([todos[0]]);
    });

    test("When creating 2 todos with the same ID or description, an error is returned ans didn't create", async () => {
      const todo = { ...todos[0] };
      const res1 = await repository.create(todo);
      expect(res1).toStrictEqual(successResult);
      todo.description = 'any another';
      const res2 = await repository.create(todo);
      expect(res2).toStrictEqual({ success: false, errors: ['Todo with this ID already exists'] });
      todo.id = 'any another id';
      todo.description = todos[0].description;
      const res3 = await repository.create(todo);
      expect(res3).toStrictEqual({
        success: false,
        errors: ['Todo with this description already exists'],
      });

      expect(await repository.findAll()).toHaveLength(1);
    });
  });

  describe('delete test', async () => {
    test('When the only todo is deleted, return success and findAll returns an empty array', async () => {
      await repository.create(todos[0]);
      const res = await repository.delete(todos[0].id);
      expect(res).toStrictEqual(successResult);
      expect(await repository.findAll()).toHaveLength(0);
    });

    test('Deleting a todo with a non-existent ID returns an error', async () => {
      const res = await repository.delete('any id');
      expect(res).toStrictEqual({ success: false, errors: ['Todo with this ID does not exist'] });
    });
  });
});
