import {makeNewTodo} from "./make-new-todo";

describe('makeNewTodo (unit)', () => {
    // AAA - Arrange, Act, Assert 

    it('return valide a new todo', () => {
        // Arrange
        const description = 'Buy groceries';
        const expectTodo = {
            id: expect.any(String),
            description,
            createdAt: expect.any(String),
        };        

        // Act
        const todo = makeNewTodo(description);

        // Assert
        expect(todo.description).toBe(expectTodo.description);
        expect(todo).toStrictEqual(expectTodo);
    });
});