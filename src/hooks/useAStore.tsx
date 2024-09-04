import ReactExports from "react";
import { IgrisStore } from "../core/store";
import { AnyType, StoreHook } from "../utils/types";
import useSyncExternalStoreExports from "use-sync-external-store/shim/with-selector.js";
const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports;
const { useDebugValue } = ReactExports;
/**
 * Custom hook for integrating a store with React components.
 *
 * This hook allows React components to subscribe to a store and automatically update
 * when the store state changes. It also provides support for selecting specific parts
 * of the store state and actions using a selector function.
 *
 * @param store - The store instance to integrate with the component.
 * @param selector - Optional selector function to derive a subset of state and actions.
 * @returns The selected state or the entire store state and actions based on the provided selector.
 *
 * @template T - Type of the store's state.
 * @template R - Type of the store's actions.
 * @template S - Type of the selected state.
 *
 * @example
 * ```tsx
 * // Using the hook with a store instance
 * const Component = () => {
 *   const selectedState = useAStore(store);
 *   // Use selectedState in the component
 * };
 * ```
 */

export const useAStore = <
  T extends Record<AnyType, AnyType> = Record<AnyType, AnyType>,
  R extends Record<AnyType, AnyType> = Record<AnyType, AnyType>,
  S = T & R,
>(
  store: IgrisStore<T, R> | StoreHook<T, R>,
  selector: (state: T & R) => S = (state) => state
): S => {
  function getStateWithSelector(state: T) {
    return selector({ ...state, ...store.actions });
  }

  const selectedState = useSyncExternalStoreWithSelector(
    store.subscribe,
    store.get,
    store.getServerState,
    getStateWithSelector,
    undefined
  );

  useDebugValue(selectedState);

  return selectedState;
};
