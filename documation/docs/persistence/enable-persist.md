---
sidebar_position: 1
---

# enablePersist

The enablePersist module in Igris enables state persistence across page reloads and browser sessions. It provides flexible configuration options for storage management, migration, and state merging strategies.

## Basic Usage

### Enabling Persistence

```typescript
import { createStore } from "igris";
import { enablePersist } from "igris/persistence";

const useStore = createStore(
  { theme: "light" },
  ({ set }) => ({
    toggleTheme: () => set(state => ({
      theme: state.theme === "light" ? "dark" : "light"
    }))
  }),
  {
    name: "app-settings",
    persist: enablePersist()
  }
);
```

## Configuration Options

### `PersistConfig` Interface

```typescript
interface PersistConfig<T> {
  // Debounce time in milliseconds (default: 100ms)
  debounceTime?: number;
  
  // Version number for migrations
  version?: number;
  
  // Migration function
  migrate?: (
    storedValue: DeepPartial<T> | T,
    version?: number
  ) => DeepPartial<T>;
  
  // Partial state selector
  partial?: (state: T) => Partial<T> | T;
  
  // State merge strategy
  merge?: (
    initialValue: T,
    storedValue: DeepPartial<T>
  ) => DeepPartial<T>;
  
  // Custom storage provider
  storage?: StorageProvider;
  
  // Skip hydration
  skipHydrate?: boolean;
}
```

### Storage Provider Types

```typescript
type StorageProvider = ActualStorage | (() => ActualStorage);

interface ActualStorage {
  getItem: (name: string) => Promise<string | null> | string | null;
  setItem: (name: string, value: string) => Promise<void> | void;
  removeItem: (name: string) => Promise<void> | void;
}
```

## Advanced Usage

### Custom Storage Provider

```typescript
const usePersistedStore = createStore(
  initialState,
  actions,
  {
    name: "my-store",
    persist: enablePersist({
      // For client-side frameworks
      storage: localStorage
      
      // For server-side rendering frameworks
      storage: () => localStorage
      
      // Custom storage implementation
      storage: {
        getItem: async (key) => { /* ... */ },
        setItem: async (key, value) => { /* ... */ },
        removeItem: async (key) => { /* ... */ }
      }
    })
  }
);
```

### State Migration

```typescript
const useStore = createStore(
  initialState,
  actions,
  {
    name: "versioned-store",
    persist: enablePersist({
      version: 2,
      migrate: (stored, version) => {
        if (version === 1) {
          // Migrate from v1 to v2
          return {
            ...stored,
            newField: 'default'
          };
        }
        return stored;
      }
    })
  }
);
```

### Partial Persistence

```typescript
const useStore = createStore(
  {
    user: { name: '', settings: {} },
    temporaryData: {}
  },
  actions,
  {
    name: "partial-store",
    persist: enablePersist({
      // Only persist user data
      partial: (state) => ({
        user: state.user
      })
    })
  }
);
```

### Custom Merge Strategy

```typescript
const useStore = createStore(
  initialState,
  actions,
  {
    name: "merge-store",
    persist: enablePersist({
      merge: (initial, stored) => ({
        ...initial,
        ...stored,
        // Custom merge logic
        settings: {
          ...initial.settings,
          ...stored.settings
        }
      })
    })
  }
);
```

### Debounced Persistence

```typescript
const useStore = createStore(
  initialState,
  actions,
  {
    name: "debounced-store",
    persist: enablePersist({
      // Save state changes after 500ms of inactivity
      debounceTime: 500
    })
  }
);
```

### Server-Side Rendering

```typescript
const useStore = createStore(
  initialState,
  actions,
  {
    name: "ssr-store",
    persist: enablePersist({
      // Use function to ensure localStorage is only accessed client-side
      storage: () => localStorage,
      // Skip initial hydration if needed
      skipHydrate: true
    })
  }
);
```

## Best Practices

1. **Storage Selection**
   - Use `localStorage` for long-term persistence
   - Use `sessionStorage` for session-only persistence
   - Implement custom storage for special needs (e.g., encrypted storage)

2. **Version Management**
   - Always include a version when using migrations
   - Implement migrations for backward compatibility
   - Test migration paths thoroughly

3. **Performance Optimization**
   - Use `partial` to persist only necessary data
   - Adjust `debounceTime` based on update frequency
   - Consider `skipHydrate` for SSR applications

4. **Security Considerations**
   - Don't persist sensitive information in localStorage
   - Consider implementing encryption for sensitive data
   - Validate stored data before using it