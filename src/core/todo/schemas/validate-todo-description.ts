import { sanitizeStr } from "@/utils/sanitize-str"
import { ValidateTodoDescription } from "./todo.contract";



export function validateTodoDescription(discription: string): ValidateTodoDescription {
    const errors = new Array<string>;
    if (discription.length <= 3) {
        errors.push("string less 4 chars need more")
    }
    if (discription.length > 255) {
        errors.push("string more 255 chars need less")
    }

    return { seccess: errors.length === 0, errors }
} 