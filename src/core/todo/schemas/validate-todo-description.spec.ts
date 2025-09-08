import { validateTodoDescription } from "./validate-todo-description";

describe("validateTodoDescription (unit)", () => {
    test("return invalid when string less 4 chars", () => {
        const result = validateTodoDescription("123");
        expect(result.error).toStrictEqual(["string less 4 chars need more"]);
        expect(result.seccess).toBe(false);
    })
    test("return invalid when string more 255 chars", () => {
        const result = validateTodoDescription("1".repeat(256));
        expect(result.error).toStrictEqual(["string more 255 chars need less"]);
        expect(result.seccess).toBe(false);
    })
    test("return valid when string is 4 chars", () => {
        const result = validateTodoDescription("1234");
        expect(result.error).toStrictEqual([]);
        expect(result.seccess).toBe(true); 
    })
})