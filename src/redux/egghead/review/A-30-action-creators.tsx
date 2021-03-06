import React from 'react';
import ReactDOM from 'react-dom';
import { connect, DispatchProp, Provider, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { combineReducers, createStore, Dispatch, Reducer } from 'redux';

import { Todo as ITodo, AddTodoAction, TodoAction, VisibilityFilterAction } from './types';

// -- ACTION CREATORS -- //
let nextTodoId = 0;
const addTodo = (text: string) => ({ type: 'ADD_TODO', id: nextTodoId++, text }); // eslint-disable-line

const setVisibilityFilter = (filter: string) => ({ type: 'SET_VISIBILITY_FILTER', filter });

const toggleTodo = (id: number) => ({ type: 'TOGGLE_TODO', id });

// -- REDUCERS -- //
const todoReducer: Reducer<ITodo|undefined, TodoAction> = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: (action as AddTodoAction).text,
        completed: false,
      };
    case 'TOGGLE_TODO':
      if (!state || state.id !== action.id) return state;
      return { ...state, completed: !state.completed };
    default:
      return state;
  }
};

const todosReducer: Reducer<ITodo[], TodoAction> = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        todoReducer(undefined, action) as ITodo,
      ];
    case 'TOGGLE_TODO':
      return state.map((todo) => todoReducer(todo, action) as ITodo);

    default:
      return state;
  }
};

const visibilityReducer: Reducer<string, VisibilityFilterAction> = (state = 'SHOW_ALL', action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
};

const todoApp = combineReducers({
  todos: todosReducer,
  visibilityFilter: visibilityReducer,
});

const getVisibleTodos = (todos: ITodo[], filter: string) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos;
    case 'SHOW_ACTIVE':
      return todos.filter((todo) => !todo.completed);
    case 'SHOW_COMPLETED':
      return todos.filter((todo) => todo.completed);
    default:
      return todos;
  }
};

// -- PRESENTATIONAL COMPONENTS -- //
interface LinkProps {
  active: boolean;
  children: string;
  onClick: () => void;
}

const Link: React.FC<LinkProps> = ({ active, children, onClick }: LinkProps) => {
  if (active) return (<span>{children}</span>);
  return (
    <a
      href="#"
      onClick={(event) => {
        event.preventDefault();
        onClick();
      }}
    >
      {children}
    </a>
  );
};

const Footer: React.FC<{}> = () => (
  <p>
    Show:
    {' '}<FilterLink filter="SHOW_ALL">All</FilterLink>
    {' '}<FilterLink filter="SHOW_ACTIVE">Active</FilterLink>
    {' '}<FilterLink filter="SHOW_COMPLETED">Completed</FilterLink>
  </p>
);

interface TodoProps {
  completed: boolean;
  onClick: () => void;
  text: string;
}

const Todo: React.FC<TodoProps> = ({ completed, onClick, text }: TodoProps) => (
  <li
    onClick={onClick}
    style={{ textDecoration: completed ? 'line-through' : 'none' }}
  >
    {text}
  </li>
);

interface TodoListProps {
  onTodoClick: (todoId: number) => void;
  todos: ITodo[];
}

const TodoList: React.FC<TodoListProps> = ({ onTodoClick, todos }: TodoListProps) => (
  <ul>
    {todos.map((todo) => <Todo key={todo.id} onClick={() => onTodoClick(todo.id)} {...todo} />)}
  </ul>
);

// -- CONTAINER COMPONENTS -- //
const AddTodo: React.FC<{ dispatch: Dispatch }> = ({ dispatch }: DispatchProp) => {
  let input: HTMLInputElement;
  return (
    <div>
      <input ref={(node) => input = node!} />
      <button onClick={() => {
        dispatch(addTodo(input.value));
        input.value = ''; // clear input field
      }}>
        Add Todo
      </button>
    </div>
  );
};
const AddTodoConnected = connect()(AddTodo); // Returns just 'dispatch' as an injected prop

interface AppState {
  todos: ITodo[];
  visibilityFilter: string;
}

interface OwnFilterLinkProps { filter: string }
interface FilterLinkStateProps { active: boolean }
interface FilterLinkDispatchProps { onClick: () => void }
const mapStateToLinkProps: MapStateToProps<FilterLinkStateProps, OwnFilterLinkProps, AppState> = (state, ownProps) => ({
  active: ownProps.filter === state.visibilityFilter,
});
const mapDispatchToLinkProps: MapDispatchToProps<FilterLinkDispatchProps, OwnFilterLinkProps> = (dispatch, ownProps) => ({
  onClick() { dispatch(setVisibilityFilter(ownProps.filter)); },
});
const FilterLink = connect(mapStateToLinkProps, mapDispatchToLinkProps)(Link);

interface VisibleTodoListStateProps { todos: ITodo[] }
interface VisibleTodoListDispatchProps { onTodoClick: (todoId: number) => void }
const mapStateToTodoListProps: MapStateToProps<VisibleTodoListStateProps, {}, AppState> = (state) => ({
  todos: getVisibleTodos(state.todos, state.visibilityFilter),
});
const mapDispatchToTodoListProps: MapDispatchToProps<VisibleTodoListDispatchProps, {}> = (dispatch) => ({
  onTodoClick(id) { dispatch(toggleTodo(id)); },
});
const VisibleTodoList = connect(mapStateToTodoListProps, mapDispatchToTodoListProps)(TodoList);

const TodoApp: React.FC<{}> = () => (
  <div>
    <AddTodoConnected />
    <VisibleTodoList />
    <Footer />
  </div>
);

ReactDOM.render(
  <Provider store={createStore(todoApp)}>
    <TodoApp />
  </Provider>,
  document.getElementById('root')
); // Initial render
