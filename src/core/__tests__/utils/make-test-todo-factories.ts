import * as makeNewTodoMod from '@/core/todo/factories/make-new-todo';
import { Todo } from '@/core/todo/schemas/todo.contract';
import * as validateTodoDescriptionMod from '@/core/todo/schemas/validate-todo-description';
import * as sanitizeStrMod from '@/utils/sanitize-str';

export function makeMocks(description = 'test') {
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
