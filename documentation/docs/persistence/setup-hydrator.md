---
sidebar_position: 2
---
# setupHydrator

`setupHydrator` is a utility function in Igris that manages the hydration process for persisted stores and states. It's particularly useful when dealing with asynchronous storage solutions or when you need to coordinate the hydration of multiple stores before rendering your application.

## Basic Usage

### Creating a Hydrator

```typescript
import { setupHydrator } from "igris/persistence";
import { usePersistedStore, usePersistedState } from "./stores";

const hydrator = setupHydrator([
  usePersistedStore,
  usePersistedState
]);
```

### Using in Application Root

```typescript
function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await hydrator();
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return null;
  }

  return <Main />;
}
```

## API Reference

### `setupHydrator`

Creates a hydration function for multiple persisted stores and states.

#### Parameters

- `stores: (StateHook<AnyType> | StoreHook<AnyType, AnyType>)[]` - Array of persisted stores and states to hydrate
- `config?: HydratorConfig` - Optional configuration object

#### Returns: `() => void | Promise<void>`

### `HydratorConfig` Interface

```typescript
interface HydratorConfig {
  storage?: StorageProvider;
}
```

## Advanced Usage

### Custom Storage Provider

```typescript
const hydrator = setupHydrator(
  [usePersistedStore, usePersistedState],
  {
    storage: sessionStorage
  }
);
```

### With Async Storage

```typescript
const customAsyncStorage = {
  getItem: async (key: string) => {
    // Async storage implementation
    return await fetchFromDatabase(key);
  },
  setItem: async (key: string, value: string) => {
    // Async storage implementation
    await saveToDatabase(key, value);
  }
};

const hydrator = setupHydrator(
  [usePersistedStore, usePersistedState],
  {
    storage: customAsyncStorage
  }
);
```

## Important Notes

1. The default storage configuration in `setupHydrator` only applies if storage was not configured during `enablePersist()`.
2. Storage priority:
   - Storage defined in `enablePersist()` takes precedence
   - Storage defined in `setupHydrator` config is used as fallback
   - `localStorage` is used if no storage is specified

3. When using async storage:
   - Initial state values are used until hydration completes
   - Hydration process is managed automatically
   - Loading states can be managed at the application level

## Example with Multiple Stores

```typescript
// Define stores with persistence
const useThemeStore = createStore(
  { theme: 'light' },
  ({ set }) => ({
    toggleTheme: () => set(state => ({
      theme: state.theme === 'light' ? 'dark' : 'light'
    }))
  }),
  {
    name: "theme",
    persist: enablePersist()
  }
);

const useSettingsState = createState(
  { notifications: true },
  {
    name: "settings",
    persist: enablePersist()
  }
);

// Setup hydration
const hydrator = setupHydrator([
  useThemeStore,
  useSettingsState
]);

// Root component with hydration
function App() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      await hydrator();
      setIsHydrated(true);
    })();
  }, []);

  if (!isHydrated) {
    return <LoadingSpinner />;
  }

  return <MainApp />;
}
```



