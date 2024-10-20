---
sidebar_position: 1
---

# createStore

`createStore` is an advanced state management function in Igris that combines state and actions into a single hook. It provides a powerful way to manage complex state logic with associated actions, supporting features like state selection, persistence, and server-side rendering.

## Basic Usage

### Creating a Store

```typescript
import { createStore } from "igris";

const useCounter = createStore({ count: 0 }, ({ set, get }) => ({
  increment: () => set({ count: get().count + 1 }),
  decrement: () => set({ count: get().count - 1 }),
}));
```

### Using in Components

```typescript
function Counter() {
  const { count, increment, decrement } = useCounter();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
```

## API Reference

### `createStore<T, R>`

Creates a store hook with state and actions.

#### Parameters

- `initialState: T` - Initial state object (must be key-value pairs)
- `callback: (methods: StoreMethods<T>) => R` - Function that returns action methods
- `config?: StoreConfig` - Optional configuration object

#### Returns: `StoreHook<T, R>`

### `StoreHook<T, R>` Interface

```typescript
interface StoreHook<T, R> {
  // Hook usage
  <S = T & R>(): S;
  <S = T & R>(selector: (state: T & R) => S): S;

  // Utility methods
  get: () => T;
  getServerState: () => T;
  actions: R;
  subscribe: (listener: StateListener<T>) => () => void;
  set: (updateAction: React.SetStateAction<T>) => void;
  persist: PersistHandler<T> | null;
}
```

### Store Methods

#### Inside Components

```typescript
// Full state and actions
const store = useCounter();

// Select specific state
const count = useCounter((state) => state.count);

// Select specific actions
const { increment } = useCounter((state) => ({
  increment: state.increment,
}));
```

#### Outside Components

```typescript
// Get current state
const state = useCounter.get();

// Access actions
const { increment } = useCounter.actions;

// Subscribe to changes
const unsubscribe = useCounter.subscribe((newState) => {
  console.log("State changed:", newState);
});
```

## Advanced Usage

### Complex Store Example

```typescript
interface TodoState {
  items: { id: number; text: string; completed: boolean }[];
  filter: "all" | "active" | "completed";
}
interface TodoActions {
  addTodo: (text: string) => void;
  toggleTodo: (id: number) => void;
  setFilter: (filter: TodoState["filter"]) => void;
  getFilteredTodos(): TodoState["items"];
}

const useTodoStore = createStore(
  {
    items: [],
    filter: "all" as const,
  } as TodoState,
  ({ set, get }) => ({
    addTodo: (text: string) =>
      set((state) => ({
        ...state,
        items: [
          ...state.items,
          {
            id: Date.now(),
            text,
            completed: false,
          },
        ],
      })),

    toggleTodo: (id: number) =>
      set((state) => ({
        ...state,
        items: state.items.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item
        ),
      })),

    setFilter: (filter: TodoState["filter"]) => set({ ...get(), filter }),

    getFilteredTodos() {
      const state = get();
      switch (state.filter) {
        case "active":
          return state.items.filter((item) => !item.completed);
        case "completed":
          return state.items.filter((item) => item.completed);
        default:
          return state.items;
      }
    },
  })
);
```

### Using with TypeScript

```typescript
interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const useAuth = createStore<AuthState, AuthActions>(
  {
    user: null,
    isLoading: false,
    error: null,
  },
  ({ set, get }) => ({
    async login(credentials) {
      set({ ...get(), isLoading: true, error: null });
      try {
        const user = await apiLogin(credentials);
        set({ ...get(), user, isLoading: false });
      } catch (error) {
        set({ ...get(), error: error.message, isLoading: false });
      }
    },

    logout() {
      set({ ...get(), user: null });
    },

    clearError() {
      set({ ...get(), error: null });
    },
  })
);

```

### With Persistence

```typescript
import { enablePersist } from "igris/persistence";

const usePersistedStore = createStore(
  { theme: "light", settings: {} },
  ({ set }) => ({
    toggleTheme: () =>
      set((state) => ({
        ...state,
        theme: state.theme === "light" ? "dark" : "light",
      })),
  }),
  {
    name: "app-settings",
    persist: enablePersist(),
  }
);
```

### Selective Re-rendering

```typescript
function ThemeDisplay() {
  // Only re-renders when theme changes
  const theme = usePersistedStore((state) => state.theme);
  return <div>Current theme: {theme}</div>;
}

function ThemeToggle() {
  // Only re-renders when toggleTheme changes
  const { toggleTheme } = usePersistedStore((state) => ({
    toggleTheme: state.toggleTheme,
  }));
  return <button onClick={toggleTheme}>Toggle Theme</button>;
}
```
