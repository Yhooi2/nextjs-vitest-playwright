import * as sanitizeStrMod from '@/utils/sanitize-str';
import * as validateTodoDescriptionMod from '../schemas/validate-todo-description';
import * as makeNewTodoMod from './make-new-todo';
import { makeNewValidatedTodo } from './make-new-validated-todo';

function makeMocks(description = 'test') {
  const returnValidateTodo = { seccess: true, errors: [] };

  const todo = {
    id: expect.any(String),
    description,
    createdAt: expect.any(String),
  };

  const sanitizeStrSpy = vi.spyOn(sanitizeStrMod, 'sanitizeStr').mockReturnValue(description);

  const validateTodoDescriptionSpy = vi
    .spyOn(validateTodoDescriptionMod, 'validateTodoDescription')
    .mockReturnValue(returnValidateTodo);

  const makeNewTodoSpy = vi.spyOn(makeNewTodoMod, 'makeNewTodo').mockReturnValue(todo);

  return {
    description,
    sanitizeStrSpy,
    returnValidateTodo,
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
      seccess: true,
      data: todo,
    });
  });
  test('check return error', () => {
    const errorReturn = { seccess: false, errors: ['any', 'error'] };
    const { description, validateTodoDescriptionSpy } = makeMocks();
    validateTodoDescriptionSpy.mockReturnValue(errorReturn);
    const result = makeNewValidatedTodo(description);
    expect(result).toStrictEqual(errorReturn);
  });
});
