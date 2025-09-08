import { sanitizeStr } from "./sanitize-str"

describe("sanitizeStr (unit)", () => {
    test("return void string when without prop", () => {
        // @ts-expect-error test function without props
        expect(sanitizeStr()).toBe("")
    });
    test("return any prop to empty string", () => {
        // @ts-expect-error test function uncorrect props
        expect(sanitizeStr(123)).toBe("");
    })
    test("check for trim", () => {
        expect(sanitizeStr("  test  ")).toBe("test");
    }) 
    test("check for normalize", () => {
        expect("e\u0301").not.toBe("é");
        expect(sanitizeStr("e\u0301")).toBe("é");
    })
})