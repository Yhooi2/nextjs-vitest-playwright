export type Todo = {
    id: string;
    description: string;
    createdAt: string;
}

export type InvalidTodo = {
    seccess: false;
    error: string[];
}
export type ValidTodo = {
    seccess: true;
    date: Todo;
}
export type MakeValidateTodo = InvalidTodo | ValidTodo;


export type ValidateTodoDescription = {
    seccess: boolean;
    error: string[];
}
