export type Todo = {
    id: string;
    description: string;
    createdAt: string;
}

export type InvalidTodo = {
    seccess: false;
    errors: string[];
}
export type ValidTodo = {
    seccess: true;
    data: Todo;
}
export type MakeValidateTodo = InvalidTodo | ValidTodo;


export type ValidateTodoDescription = {
    seccess: boolean;
    errors: string[];
}
