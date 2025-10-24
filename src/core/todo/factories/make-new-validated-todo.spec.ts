import * as sanitizeStrMod from '@/utils/sanitize-str';
import { Todo } from '../schemas/todo.contract';
import * as validateTodoDescriptionMod from '../schemas/validate-todo-description';
import * as makeNewTodoMod from './make-new-todo';
import { makeNewValidatedTodo } from './make-new-validated-todo';

function makeMocks(description = 'test') {
  const validationResult = { success: true, errors: [] };

  const todo: Todo = {
    id: expect.any(String),
    description,
    createdAt: expect.any(String),
    deletedAt: null,
  };

  const sanitizeStrSpy = vi.spyOn(sanitizeStrMod, 'sanitizeStr').mockReturnValue(description);

  const validateTodoDescriptionSpy = vi
    .spyOn(validateTodoDescriptionMod, 'validateTodoDescription')
    .mockReturnValue(validationResult);

  const makeNewTodoSpy = vi.spyOn(makeNewTodoMod, 'makeNewTodo').mockReturnValue(todo);

  return {
    description,
    sanitizeStrSpy,
    validationResult,
    validateTodoDescriptionSpy,
    todo,
    makeNewTodoSpy,
  };
}

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
