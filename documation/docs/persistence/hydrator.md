---
sidebar_position: 3
---

# Hydrator

The `Hydrator` component in Igris is a wrapper component that manages the hydration process for persisted stores and states. It provides a declarative way to handle hydration with loading states and ensures your application only renders after data is properly hydrated.

## Basic Usage

### Using with Stores Directly

```typescript
import { Hydrator } from "igris/persistence";

function App() {
  return (
    <Hydrator stores={[usePersistedStore, usePersistedState]}>
      <Main />
    </Hydrator>
  );
}
```

### Using with Pre-configured Hydrator

```typescript
import { Hydrator, setupHydrator } from "igris/persistence";

const hydrator = setupHydrator([usePersistedStore, usePersistedState], {
  storage: sessionStorage
});

function App() {
  return (
    <Hydrator handler={hydrator}>
      <Main />
    </Hydrator>
  );
}
```

## API Reference

### `Hydrator` Props

The `Hydrator` component accepts two different prop configurations:

#### Configuration with Stores

```typescript
interface HydratorStoresConfig {
  stores: (StateHook<AnyType> | StoreHook<AnyType, AnyType>)[];
  config?: {
    storage?: StorageProvider;
  };
  loadingComponent?: React.ReactNode | React.ReactNode[];
  children: React.ReactNode | React.ReactNode[];
}
```

#### Configuration with Handler

```typescript
interface HydratorHandlerConfig {
  handler: () => void | Promise<void>;
  loadingComponent?: React.ReactNode | React.ReactNode[];
  children: React.ReactNode | React.ReactNode[];
}
```

## Advanced Usage

### Custom Loading Component

```typescript
function App() {
  return (
    <Hydrator 
      stores={[usePersistedStore, usePersistedState]}
      loadingComponent={<CustomLoadingSpinner />}
    >
      <Main />
    </Hydrator>
  );
}
```

### With Custom Storage

```typescript
function App() {
  return (
    <Hydrator 
      stores={[usePersistedStore, usePersistedState]}
      config={{
        storage: sessionStorage
      }}
    >
      <Main />
    </Hydrator>
  );
}
```

### With Pre-configured Handler and Loading State

```typescript
const hydrator = setupHydrator([usePersistedStore, usePersistedState]);

function App() {
  return (
    <Hydrator 
      handler={hydrator}
      loadingComponent={
        <div className="loading-state">
          <Spinner />
          <p>Loading application state...</p>
        </div>
      }
    >
      <Main />
    </Hydrator>
  );
}
```

## TypeScript Interface

```typescript
export type HydratorOption =
  | {
      handler: () => void | Promise<void>;
      stores?: never;
      config?: never;
      loadingComponent?: React.ReactNode | React.ReactNode[];
    }
  | {
      handler?: never;
      stores: (StateHook<AnyType> | StoreHook<AnyType, AnyType>)[];
      config?: Partial<{
        storage: StorageProvider;
      }>;
      loadingComponent?: React.ReactNode | React.ReactNode[];
    };

export type HydratorProps = HydratorOption & {
  children: React.ReactNode | React.ReactNode[];
};
```

## Important Notes

1. The `Hydrator` component must be used at the root level of your application, above any components that use persisted stores or states.

2. You must use either the `stores` prop or the `handler` prop, but not both:
   - Use `stores` for direct configuration
   - Use `handler` when you have a pre-configured hydrator from `setupHydrator`

3. The `loadingComponent` prop is optional:
   - If not provided, nothing will be rendered during hydration
   - Can be any valid React node or array of nodes

4. The component automatically manages the hydration lifecycle:
   - Initiates hydration on mount
   - Renders loading component during hydration
   - Renders children only after successful hydration

## Example with Multiple Configuration Options

```typescript
import { Hydrator, setupHydrator } from "igris/persistence";
import { usePersistedStore, usePersistedState } from "./stores";

// Option 1: Direct configuration
function App1() {
  return (
    <Hydrator 
      stores={[usePersistedStore, usePersistedState]}
      config={{ storage: sessionStorage }}
      loadingComponent={<LoadingScreen />}
    >
      <Main />
    </Hydrator>
  );
}

// Option 2: Pre-configured handler
const hydrator = setupHydrator([usePersistedStore, usePersistedState], {
  storage: sessionStorage
});

function App2() {
  return (
    <Hydrator 
      handler={hydrator}
      loadingComponent={<LoadingScreen />}
    >
      <Main />
    </Hydrator>
  );
}
```