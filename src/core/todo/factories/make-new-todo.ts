import { Todo } from "./schemas/todo.contract"

function makeNewTodo(description: string): Todo {
    return (
       {
        id: crypto.randomUUID(),
        description,
        createdAt: new Date().toISOString(),
        
       }
    )
}

export default makeNewTodo
