import { useAStore } from "../hooks/useAStore";
import {
  AnyType,
  ActionsCallback,
  StoreConfig,
  StoreHook,
} from "../utils/types";
import { IgrisMaster } from "./master";

/**
 * Represents a value management store with actions and optional persistence.
 *
 * This class manages the application value, provides methods for updating the value,
 * and supports subscribing to value changes. It can also persist value data to storage
 * with optional debounce functionality.
 *
 * @template T - Type of the store's value.
 * @template R - Type of the store's actions.
 */
export class IgrisStore<
  T extends Record<AnyType, AnyType> = Record<AnyType, AnyType>,
  R extends Record<AnyType, AnyType> = Record<AnyType, AnyType>,
> extends IgrisMaster<T> {
  actions: R; // Actions available in the store

  /**
   * Constructs a new instance of the IgrisStore.
   * @param initialState - The initial value of the store.
   * @param callback - Callback function to generate actions based on store methods.
   * @param config - Optional configuration for persistence.
   */
  constructor(
    initialState: T,
    callback: ActionsCallback<T, R>,
    config?: StoreConfig<T>
  ) {
    super(initialState, config);
    // Generate actions using the provided callback function
    this.actions = callback({
      get: this.get.bind(this),
      set: this.set.bind(this),
      subscribe: this.subscribe.bind(this),
    });
  }
}

/**
 * Creates a store hook with the provided initial state, callback, and configuration.
 *
 * This function initializes a new instance of IgrisStore with the specified initial state,
 * callback function to generate actions, and optional configuration for persistence. It returns
 * a store hook that integrates with React components and allows selecting specific parts of
 * state and actions using a selector function.
 *
 * @param initialState - The initial state of the store.
 * @param callback - Callback function to generate actions based on store methods.
 * @param config - Optional configuration for persistence.
 * @returns The created store hook.
 *
 * @template T - Type of the store's state.
 * @template R - Type of the store's actions.
 *
 * @example
 * ```typescript
 * // Define the state type for the store
 * interface AppState {
 *   count: number;
 * }
 *
 * // Define the actions type for the store
 * interface AppActions {
 *   increment: () => void;
 * }
 *
 * // Create a store hook using createStore
 * const useAppState = createStore<AppState, AppActions>(
 *   { count: 0 },
 *   ({set, get}) => ({
 *     increment: () => set((prevState) => ({ ...prevState, count: prevState.count + 1 })),
 *   }),
 *   { name: "AppState", persist: { enable: true } }
 * );
 *
 * // Example component using the created store hook
 * const ExampleComponent: React.FC = () => {
 *   // Destructure the state and actions from the hook
 *   const { count, increment } = useAppState();
 *
 *   return (
 *     <div>
 *       <p>Count: {count}</p>
 *       <button onClick={increment}>Increment Count</button>
 *     </div>
 *   );
 * };
 * ```
 */
export const createStore = <
  T extends Record<AnyType, AnyType>,
  R extends Record<AnyType, AnyType>,
>(
  initialState: T,
  callback: ActionsCallback<T, R>,
  config?: StoreConfig<T>
): StoreHook<T, R> => {
  const store = new IgrisStore(initialState, callback, config);
  const hook = (selector: <S>(state: T & R) => S) => useAStore(store, selector);
  hook.persist = store.persist;
  hook.actions = store.actions;
  hook.subscribe = store.subscribe;
  hook.get = store.get;
  hook.set = store.set;
  hook.getServerState = store.getServerState;
  return hook as StoreHook<T, R>;
};