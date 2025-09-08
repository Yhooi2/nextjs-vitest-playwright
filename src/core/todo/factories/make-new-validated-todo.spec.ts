import { makeNewValidatedTodo } from "./make-new-validated-todo";

describe("makeNewValidatedTodo (unit)", () => {
    test("return invalid when string less 4 chars", () => {
        const result = makeNewValidatedTodo("123");
        expect(result.seccess).toBe(false);
    })
})