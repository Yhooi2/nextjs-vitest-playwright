import { makeHelpersTodoRepository } from '@/core/__tests__/utilst/make-helpers-test-todo-repository';

describe('DrizzleTodoRepository CRUD tests (integrations)', async () => {
  const { repository, clearDb, insertTodos, todo, successResult } =
    await makeHelpersTodoRepository();
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
      const todos = await insertTodos();
      expect(await repository.findAll()).toStrictEqual(todos);
    });
  });
  describe('create tests', () => {
    test('When one todo is created, func and findAll returns it', async () => {
      const result = await repository.create(todo);
      expect(result).toStrictEqual(successResult);
      const finded = await repository.findAll();
      expect(finded).toHaveLength(1);
      expect(finded).toStrictEqual([todo]);
    });

    test("When creating 2 todos with the same ID or description, an error is returned ans didn't create", async () => {
      const res1 = await repository.create(todo);
      expect(res1).toStrictEqual(successResult);
      const res2 = await repository.create(todo);
      expect(res2).toStrictEqual({ success: false, errors: ['Todo with this ID already exists'] });
      expect(await repository.findAll()).toHaveLength(1);
    });
  });

  describe('delete test', async () => {
    test('When the only todo is deleted, return success and findAll returns an empty array', async () => {
      await repository.create(todo);
      const res = await repository.delete(todo.id);
      expect(res).toStrictEqual(successResult);
      expect(await repository.findAll()).toHaveLength(0);
    });

    test('Deleting a todo with a non-existent ID returns an error', async () => {
      const res = await repository.delete('any id');
      expect(res).toStrictEqual({ success: false, errors: ['Todo with this ID does not exist'] });
    });
  });
});
