import ReactExports from "react";
import { IgrisState } from "../core/state";
import { AnyType, StateHook, StoreHook } from "../utils/types";
import useSyncExternalStoreExports from "use-sync-external-store/shim/with-selector.js";
const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports;
const { useDebugValue, useCallback, useEffect, useRef } = ReactExports;
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

type SetStateCallback<T> = (state: T) => void | (() => void);

export const useAState = <T,>(
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
