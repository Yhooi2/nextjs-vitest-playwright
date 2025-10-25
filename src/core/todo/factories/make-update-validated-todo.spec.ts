import { makeMocks } from '@/core/__tests__/utils/make-test-todo-factories';
import { ValidUpdateTodo } from '../schemas/todo.contract';
import { makeUpdateValidatedTodo } from './make-update-validated-todo';

describe('makeUpdateValidatedTodo (unit)', () => {
  test('calls sanitizeStr when updating todo', () => {
    const { sanitizeStrSpy, todo } = makeMocks();
    makeUpdateValidatedTodo(todo);
    expect(sanitizeStrSpy).toHaveBeenCalledWith(todo.description);
  });
  test('calls validateTodoDescription when updateTodo includes description', () => {
    const { validateTodoDescriptionSpy, todo } = makeMocks();
    makeUpdateValidatedTodo(todo);
    expect(validateTodoDescriptionSpy).toHaveBeenCalledWith(todo.description);
  });
  test('does not call sanitizeStr when updateTodo has no description', () => {
    const { sanitizeStrSpy, todo } = makeMocks();
    const updateTodo = { id: todo.id };
    makeUpdateValidatedTodo(updateTodo);
    expect(sanitizeStrSpy).not.toHaveBeenCalled();
  });
  test('does not call validateTodoDescription when updateTodo has no description', () => {
    const { validateTodoDescriptionSpy, todo } = makeMocks();
    const updateTodo = { id: todo.id };
    makeUpdateValidatedTodo(updateTodo);
    expect(validateTodoDescriptionSpy).not.toHaveBeenCalled();
  });
  test('returns success with sanitized and valid todo when description is valid', () => {
    const { todo } = makeMocks();
    todo.deletedAt = new Date().toISOString();
    const result = makeUpdateValidatedTodo(todo) as ValidUpdateTodo;
    expect(result.success).toBe(true);
    expect(result.todo).toStrictEqual({
      description: todo.description,
      deletedAt: todo.deletedAt,
    });
  });
  test('returns error when description is invalid', () => {
    const { todo, validateTodoDescriptionSpy } = makeMocks();
    const resultError = { success: false, errors: ['test'] };
    validateTodoDescriptionSpy.mockReturnValue(resultError);
    expect(makeUpdateValidatedTodo(todo)).toStrictEqual(resultError);
  });
});
