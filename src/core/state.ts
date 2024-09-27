import { useDebugValue, useCallback, useEffect, useRef } from "react";
import useSyncExternalStoreExports from "use-sync-external-store/shim/with-selector.js";
import { isObject, shallowMerge } from "../utils/functions";
import {
  AnyType,
  SetStateCallback,
  StateHook,
  StoreConfig,
  StoreHook,
} from "../utils/types";
import { IgrisMaster } from "./master";

const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports;

/**
 * Represents a state management class extending IgrisMaster.
 *
 * This class inherits methods for updating state, subscribing to state changes,
 * and optionally persisting state data to storage with debounce functionality.
 *
 * @template T - Type of the state managed by IgrisState.
 */
export class IgrisState<T> extends IgrisMaster<T> {
  /**
   * Constructs an instance of IgrisState.
   *
   * @param initialState - The initial state managed by IgrisState.
   * @param config - Optional configuration for persistence and other settings.
   */
  constructor(initialState: T, config?: StoreConfig<T>) {
    super(initialState, config);
    if (this.persist?.config && !this.persist.config.merge) {
      this.persist.config.merge = (currentState, storeState) => {
        if (isObject(storeState) && isObject(currentState)) {
          return shallowMerge(currentState as AnyType, storeState as Object);
        } else {
          return storeState;
        }
      };
    }
  }
}
/**
 * Creates a state hook with the provided initial state and optional persistence configuration.
 *
 * This function initializes a state hook with the specified initial state and optional
 * persistence configuration. It returns the state hook, which allows components to subscribe
 * to state updates and manage state actions.
 *
 * @param initialState - The initial state of the store.
 * @param config - Optional configuration for persistence.
 * @returns The created state hook.
 *
 * @template T - Type of the store's state.
 *
 * @example
 * ```typescript
 * // Define the initial state type
 * interface AppState {
 *   count: number;
 *   text: string;
 * }
 *
 * // Create a state hook using createState
 * const useAppState: IStateHook<AppState> = createState({
 *   count: 0,
 *   text: "Initial Text",
 * });
 *
 * // Example component using the created state hook
 * const ExampleComponent: React.FC = () => {
 *   // Destructure the state and setter function from the hook
 *   const [{ count, text }, setState] = useAppState();
 *
 *   // Example handler to update state
 *   const incrementCount = () => {
 *     setState((prevState) => ({
 *       ...prevState,
 *       count: prevState.count + 1,
 *     }));
 *   };
 *
 *   return (
 *     <div>
 *       <p>Count: {count}</p>
 *       <p>Text: {text}</p>
 *       <button onClick={incrementCount}>Increment Count</button>
 *     </div>
 *   );
 * };
 * ```
 */

export const createState = <T>(
  initialState: T,
  config?: StoreConfig<T>
): StateHook<T> => {
  const state = new IgrisState(initialState, config);
  const hook = () => useAState(state);
  hook.subscribe = state.subscribe;
  hook.persist = state.persist;
  hook.get = state.get;
  hook.set = state.set;
  hook.getServerState = state.getServerState;
  return hook as StateHook<T>;
};

/**
 * Custom React hook for managing state updates and subscriptions.
 * @param state - State object or hook implementing state management interface.
 * @returns A tuple containing the selected state and a setter function.
 *
 * @template T - Type of the state managed by IgrisState, IStateHook, or IStoreHook.
 *
 *   @example
 * ```tsx
 * // Using the hook with a store instance
 * const Component = () => {
 *   const [selectedState, setState] = useAState(state);
 *   // Use selectedState and setState in the component
 * };
 * ```
 */

export const useAState = <T>(
  state: IgrisState<T> | StateHook<T> | StoreHook<T, AnyType>
): [T, (value: React.SetStateAction<T>, cb?: SetStateCallback<T>) => void] => {
  const cbQueueRef = useRef<SetStateCallback<T>[]>([]);
  const selectedState = useSyncExternalStoreWithSelector(
    state.subscribe,
    state.get,
    state.getServerState,
    (state) => state
  );
  useDebugValue(selectedState);

  const setStateAndCallback = useCallback(
    (value: React.SetStateAction<T>, cb?: SetStateCallback<T>) => {
      if (cb) {
        cbQueueRef.current.push(cb);
      }
      state.set(value);
    },
    [state]
  );

  useEffect(() => {
    if (cbQueueRef.current.length > 0) {
      const queue = [...cbQueueRef.current];
      cbQueueRef.current.length = 0;
      for (const fn of queue) {
        if (typeof fn === "function") {
          fn(selectedState);
        }
      }
    }
  }, [selectedState]);

  return [selectedState, setStateAndCallback];
};
