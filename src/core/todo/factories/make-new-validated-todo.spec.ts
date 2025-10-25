import { makeMocks } from '@/core/__tests__/utils/make-test-todo-factories';
import { makeNewValidatedTodo } from './make-new-validated-todo';

describe('makeNewValidatedTodo (unit)', () => {
  test('check call sanitizeStr using mock', () => {
    const { description, sanitizeStrSpy } = makeMocks();
    makeNewValidatedTodo(description);
    expect(sanitizeStrSpy).toHaveBeenCalledExactlyOnceWith(description);
  });

  test('check call validateTodoDescription using mock', () => {
    const { description, sanitizeStrSpy, validateTodoDescriptionSpy } = makeMocks();
    const sanitizeStrReturn = 'return sanitizeStr';
    sanitizeStrSpy.mockReturnValue(sanitizeStrReturn);

    makeNewValidatedTodo(description);
    expect(validateTodoDescriptionSpy).toHaveBeenCalledExactlyOnceWith(sanitizeStrReturn);
  });

  test('check call makeNewTodo using mock', () => {
    const { description, makeNewTodoSpy } = makeMocks();
    makeNewValidatedTodo(description);
    expect(makeNewTodoSpy).toHaveBeenCalledExactlyOnceWith(description);
  });

  test('check valid return makeNewValidatedTodo', () => {
    const { todo, description } = makeMocks();

    const result = makeNewValidatedTodo(description);
    expect(result).toStrictEqual({
      success: true,
      todo: todo,
    });
  });
  test('check return error', () => {
    const errorReturn = { success: false, errors: ['any', 'error'] };
    const { description, validateTodoDescriptionSpy } = makeMocks();
    validateTodoDescriptionSpy.mockReturnValue(errorReturn);
    const result = makeNewValidatedTodo(description);
    expect(result).toStrictEqual(errorReturn);
  });
});
