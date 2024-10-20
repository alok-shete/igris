---
sidebar_position: 2
---

# createState

`createState` is a powerful function in Igris that creates a versatile state hook. It enables state management both within and outside React components, offering features like optional persistence, server-side rendering support, and advanced update patterns.

## Basic Usage

### Creating a State Hook

```typescript
import { createState } from "igris";

const useCounter = createState(0);
```

### Using in a Component

```typescript
function Counter() {
  const [count, setCount] = useCounter();
  
  return (
    <button onClick={() => setCount(prev => prev + 1)}>
      Count: {count}
    </button>
  );
}
```

## API Reference

### `createState<T>`

Creates a state hook with the provided initial state and optional configuration.

#### Parameters
- `initialState: T` - The initial state value
- `config?: StateConfig` - Optional configuration object

#### Returns: `StateHook<T>`

### `StateHook<T>` Interface

```typescript
interface StateHook<T> {
  // Hook usage
  <S = T>(): [S, (value: React.SetStateAction<T>, cb?: SetStateCallback<T>) => void];
  
  // Utility methods
  get: () => T;
  getServerState: () => T;
  subscribe: (listener: StateListener<T>) => () => void;
  set: (updateAction: React.SetStateAction<T>) => void;
  persist: PersistHandler<T> | null;
}
```

#### Methods

##### `get()`
Returns the current state value.
```typescript
const currentState = useMyState.get();
```

##### `set(updateAction)`
Updates the state value.
```typescript
useMyState.set(newValue);
// or
useMyState.set(prev => computeNewValue(prev));
```

##### `subscribe(listener)`
Subscribes to state changes.
```typescript
const unsubscribe = useMyState.subscribe((newState) => {
  console.log('State changed:', newState);
});
```

##### `getServerState()`
Gets the state value on the server side.
```typescript
const serverState = useMyState.getServerState();
```

## Advanced Usage

### Complex State Structures

```typescript
interface UserState {
  name: string;
  age: number;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

const initialUserState: UserState = {
  name: '',
  age: 0,
  preferences: {
    theme: 'light',
    notifications: true,
  },
};

const useUserState = createState<UserState>(initialUserState);

function UserProfile() {
  const [user, setUser] = useUserState();

  const updateTheme = (theme: 'light' | 'dark') => {
    setUser(prev => ({
      ...prev,
      preferences: { ...prev.preferences, theme },
    }));
  };

  // ... rest of the component
}
```

### State Persistence

```typescript
import { enablePersist } from "igris/persistence";

const usePersistedState = createState(
  { count: 0, lastUpdated: null },
  {
    name: "persistedCounter",
    persist: enablePersist()
  }
);
```

### Global State Access and Updates

```typescript
// In a non-React file or outside of components
import { useGlobalState } from './state';

// Get current state
const currentState = useGlobalState.get();

// Update state
useGlobalState.set(newState);

// Subscribe to changes
const unsubscribe = useGlobalState.subscribe((newState) => {
  console.log('Global state updated:', newState);
});

// Don't forget to unsubscribe when no longer needed
unsubscribe();
```