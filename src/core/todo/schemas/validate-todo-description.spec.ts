import { validateTodoDescription } from './validate-todo-description';

describe('validateTodoDescription (unit)', () => {
  test('return invalid when string less 4 chars', () => {
    const result = validateTodoDescription('123');
    expect(result.errors).toStrictEqual(['string less 4 chars need more']);
    expect(result.success).toBe(false);
  });
  test('return invalid when string more 255 chars', () => {
    const result = validateTodoDescription('1'.repeat(256));
    expect(result.errors).toStrictEqual(['string more 255 chars need less']);
    expect(result.success).toBe(false);
  });
  test('return valid when string is 4 chars', () => {
    const result = validateTodoDescription('1234');
    expect(result.errors).toStrictEqual([]);
    expect(result.success).toBe(true);
  });
});
