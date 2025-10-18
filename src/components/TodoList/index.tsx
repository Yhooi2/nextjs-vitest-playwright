import { DeleteTodoAction } from '@/core/todo/actions/todo.action.types';
import { Todo } from '@/core/todo/schemas/todo.contract';
import { useTodoDelete } from '@/hooks/useTodoDelete';
import { useId } from 'react';
import { Button } from '../ui/Button';
import { Item, ItemActions, ItemContent, ItemGroup, ItemTitle } from '../ui/item';

export type TodoListProps = {
  todos: Todo[];
  action: DeleteTodoAction;
};

type TodoListItemsProps = {
  todos: Todo[];
  headingId: string;
  handleTodoDelete: (todo: Todo) => void;
};

export function TodoList({ action, todos }: TodoListProps) {
  const id = useId();
  const headingId = `heading-${id}`;
  const { handleTodoDelete, optimisticTodos } = useTodoDelete({ action, todos });
  return (
    <TodoListItems
      handleTodoDelete={handleTodoDelete}
      headingId={headingId}
      todos={optimisticTodos}
    />
  );
}

function TodoListItems({ todos, headingId, handleTodoDelete }: TodoListItemsProps) {
  const hasTodos = todos.length > 0;
  if (!hasTodos) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p>No tasks found</p>
      </div>
    );
  }
  return (
    <ItemGroup aria-labelledby={headingId} className="flex flex-col min-w-xs max-w-sm gap-4">
      {todos.map((todo) => (
        //TODO variants for storybook
        <Item variant="muted" key={todo.id}>
          <ItemContent>
            <ItemTitle className="line-clamp-2">{todo.description}</ItemTitle>
          </ItemContent>
          <ItemActions>
            <Button
              variant="outline"
              size="sm"
              aria-label={`Delete task: ${todo.description}`}
              onClick={() => handleTodoDelete(todo)}
            >
              Close
            </Button>
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  );
}
