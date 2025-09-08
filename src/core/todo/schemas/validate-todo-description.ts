import { sanitizeStr } from "@/utils/sanitize-str"
import { ValidateTodoDescription } from "./todo.contract";



export function validateTodoDescription(discription: string): ValidateTodoDescription {
    const error = new Array<string>;
    if (discription.length <= 3) {
        error.push("string less 4 chars need more")
    }
    if (discription.length > 255) {
        error.push("string more 255 chars need less")
    }

    return { seccess: error.length === 0, error }
} 