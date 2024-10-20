---
sidebar_position: 4
---
# withHydrator

`withHydrator` is a Higher-Order Component (HOC) in Igris that wraps components with hydration capabilities. It provides the same functionality as the `Hydrator` component but in a HOC pattern, making it ideal for component-level hydration management.

## Basic Usage

### Basic Component Wrapping

```typescript
import { withHydrator } from "igris/persistence";

const Main = () => {
  return <div>Main Content</div>;
};

const Loading = () => {
  return <div>Loading...</div>;
};

export const MainWithHydrator = withHydrator(Main, {
  stores: [usePersistedStore, usePersistedState],
  loadingComponent: <Loading />
});
```

### With Custom Storage Configuration

```typescript
export const MainWithHydrator = withHydrator(Main, {
  stores: [usePersistedStore, usePersistedState],
  config: {
    storage: sessionStorage
  },
  loadingComponent: <Loading />
});
```

## API Reference

### Type Definition

```typescript
function withHydrator<P extends Record<string, any>, Ref = unknown>(
  WrappedComponent: WrappedComponentType<React.PropsWithoutRef<P>, Ref>,
  hydratorProps: HydratorOption
): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<Ref>>
```

### Parameters

#### `WrappedComponent`
The component to wrap with hydration capabilities.

#### `hydratorProps: HydratorOption`

```typescript
type HydratorOption =
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
```

## Advanced Usage

### With Pre-configured Handler

```typescript
const hydrator = setupHydrator([usePersistedStore, usePersistedState]);

export const MainWithHydrator = withHydrator(Main, {
  handler: hydrator,
  loadingComponent: <Loading />
});
```

### With Ref Forwarding

```typescript
interface MainProps {
  title: string;
}

const Main = forwardRef<HTMLDivElement, MainProps>((props, ref) => {
  return <div ref={ref}>{props.title}</div>;
});

export const MainWithHydrator = withHydrator(Main, {
  stores: [usePersistedStore, usePersistedState],
  loadingComponent: <Loading />
});

// Usage
function App() {
  const mainRef = useRef<HTMLDivElement>(null);
  return <MainWithHydrator ref={mainRef} title="Hello" />;
}
```

### With Custom Loading States

```typescript
const LoadingStates = {
  Initial: () => <div>Initializing...</div>,
  Loading: () => <div>Loading State...</div>,
  Error: ({ error }: { error: Error }) => <div>Error: {error.message}</div>
};

export const MainWithHydrator = withHydrator(Main, {
  stores: [usePersistedStore, usePersistedState],
  loadingComponent: <LoadingStates.Loading />
});
```

## Important Notes

1. Props Handling:
   - All props passed to the wrapped component are forwarded through the HOC
   - Refs are properly forwarded using React's `forwardRef`

2. Configuration Options:
   - Must use either `stores` or `handler`, not both
   - Storage configuration is optional
   - Loading component is optional

3. Component Lifecycle:
   - Hydration starts when the component mounts
   - Loading component is shown during hydration
   - Wrapped component renders after successful hydration

## Examples

### Basic Implementation

```typescript
// Component definition
const ProfileComponent = ({ userId }: { userId: string }) => {
  return <div>User Profile: {userId}</div>;
};

// Wrap with hydration
export const HydratedProfile = withHydrator(ProfileComponent, {
  stores: [useUserStore, usePreferencesStore],
  loadingComponent: <ProfileSkeleton />
});

// Usage
function App() {
  return <HydratedProfile userId="123" />;
}
```

### With TypeScript and Custom Props

```typescript
interface DashboardProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

const Dashboard = ({ theme, onThemeChange }: DashboardProps) => {
  return (
    <div>
      <button onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  );
};

export const HydratedDashboard = withHydrator(Dashboard, {
  stores: [useThemeStore, useSettingsStore],
  config: {
    storage: sessionStorage
  },
  loadingComponent: <DashboardSkeleton />
});
```