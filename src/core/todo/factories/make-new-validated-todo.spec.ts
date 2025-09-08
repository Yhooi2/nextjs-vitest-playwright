import * as sanitizeStrSpy from '@/utils/sanitize-str';
import * as validateTodoDescriptionSpy from '../schemas/validate-todo-description';
import { makeNewValidatedTodo } from './make-new-validated-todo';

describe('makeNewValidatedTodo (unit)', () => {
  const description = 'test';

  test('check call sanitizeStr using mock', () => {
    // Arrange
    const spy = vi.spyOn(sanitizeStrSpy, 'sanitizeStr').mockReturnValue(description);

    // Act
    makeNewValidatedTodo(description);

    // Assert
    expect(spy).toHaveBeenCalledExactlyOnceWith(description);
  });

  test('check call validateTodoDescription using mock', () => {
    const spy = vi
      .spyOn(validateTodoDescriptionSpy, 'validateTodoDescription')
      .mockReturnValue({ seccess: true, errors: [] });

    makeNewValidatedTodo(description);
    expect(spy).toHaveBeenCalledExactlyOnceWith(description);
  });
});
