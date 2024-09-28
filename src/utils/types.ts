/**
 * Represents any type.
 */

import { ComponentType, ForwardRefExoticComponent, RefAttributes } from "react";
import { IgrisMaster } from "../core/master";
import { PersistHandler } from "../persistence/handler";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyType = any;

/**
 * Defines the signature of a listener function for Igris state updates.
 * The listener function receives the updated state of type T as its only parameter
 * and does not return a value.
 *
 * @template T - The type of the state that the listener function receives.
 */
export type StateListener<T> = (state: T) => void;

/**
 * Defines the configuration options for an Igris store.
 * The configuration can either include persistence settings or omit them.
 *
 * @template T - The type of the state that the store will manage.
 */
export type StoreConfig<T> =
  | {
      /**
       * Optional persistence configuration. If omitted, persistence is not enabled.
       */
      persist?: undefined;

      /**
       * Optional name of the store. Can be used for identification purposes.
       */
      name?: string;
    }
  | {
      /**
       * Persistence configuration. When provided, the store state will be persisted.
       */
      persist: (storeName: string, store: IgrisMaster<T>) => PersistHandler<T>;

      /**
       * Name of the store. Must be provided if persistence is enabled.
       */
      name: string;
    };

export interface PersistConfig<T> {
  /**
   * Optional debounce time in milliseconds for reducing the frequency of state persistence.
   * Default is 100ms.
   */
  debounceTime?: number;

  /**
   * Optional version number for migration.
   */
  version?: number;

  /**
   * Function to migrate the persisted state to the current state type.
   * @param storedValue - The persisted state to migrate.
   * @param version - The version number for migration (if provided).
   * @returns The migrated state.
   */
  migrate?: (
    storedValue: DeepPartial<T> | T,
    version?: number
  ) => DeepPartial<T>;

  /**
   * Function to create a partial state from the current state.
   * @param state - The current state.
   * @returns The partial state.
   */
  partial?: (state: T) => Partial<T> | T;

  /**
   * Function to merge the initial state and the persisted state.
   * @param initialValue - The initial state.
   * @param storedValue - The persisted state.
   * @returns The merged state.
   */
  merge?: (initialValue: T, storedValue: DeepPartial<T>) => DeepPartial<T>;
  storage?: StorageProvider;
  skipHydrate?: boolean;
}

export type StorageProvider = ActualStorage | (() => ActualStorage);

/**
 * Interface for asynchronous storage operations.
 */
export type ActualStorage = {
  /**
   * Retrieves the value associated with the given key from the storage asynchronously.
   */
  getItem: (name: string) => Promise<string | null> | string | null;

  /**
   * Sets the value for the given key in the storage asynchronously.
   */
  setItem: (name: string, value: string) => Promise<void> | void;

  /**
   * Removes the value associated with the given key from the storage asynchronously.
   */
  removeItem: (name: string) => Promise<void> | void;
} & Record<string, AnyType>;

export type StorageValue<S = AnyType> = {
  value: S;
  version?: number;
};
export type PersistStorage = {
  getItem: <S = AnyType>(name: string) => S | null | Promise<S | null>;
  setItem: <S = AnyType>(name: string, value: S) => unknown | Promise<unknown>;
  removeItem: (name: string) => unknown | Promise<unknown>;
} & Record<string, AnyType>;

export type ActionsCallbackOptions<T> = {
  set: (update: ((currentState: T) => T) | T) => void;
  get: () => T;
  subscribe: (listener: StateListener<T>) => () => void;
};

/**
 * Type definition for a callback function used in Igris stores.
 *
 * @template T - The type of the state managed by the store, defaults to a record of any type.
 * @template R - The type of the returned value from the callback, defaults to a record of any type.
 */
export type ActionsCallback<
  T extends Record<string, AnyType> = Record<string, AnyType>,
  R extends Record<string, AnyType> = Record<string, AnyType>,
> = (store: ActionsCallbackOptions<T>) => R;

/**
 * Defines the available features for development tools.
 */
export type DevToolsFeatures = {
  /**
   * Whether the pause feature is enabled.
   */
  pause?: boolean;

  /**
   * Whether the lock feature is enabled.
   */
  lock?: boolean;

  /**
   * Whether the persist feature is enabled.
   */
  persist?: boolean;

  /**
   * Whether the export feature is enabled.
   */
  export?: boolean;

  /**
   * A string representing the import feature. This can specify the format or the source of the import.
   */
  import?: string;

  /**
   * Whether the jump feature is enabled.
   */
  jump?: boolean;

  /**
   * Whether the skip feature is enabled.
   */
  skip?: boolean;

  /**
   * Whether the reorder feature is enabled.
   */
  reorder?: boolean;

  /**
   * Whether the dispatch feature is enabled.
   */
  dispatch?: boolean;
};

/**
 * Makes a subset of properties from type T required while leaving the rest optional.
 * @template T - The base type.
 * @template K - The keys of T to be made required.
 */
export type PartiallyRequired<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

/**
 * Defines a hook interface for managing state and actions in Igris stores.
 * @template T - The type of the state managed by the store.
 * @template R - The type of actions available in the store.
 */

export type StoreHook<T, R> = {
  /**
   * Hook function overload: returns a merged type of T & R.
   */
  <S = T & R>(): S;

  /**
   * Hook function overload: accepts a selector function and returns its selected result type.
   * @param selector - Selector function to derive a subset of state.
   * @returns The selected state derived by the selector function.
   */
  <S = T & R>(selector: (state: T & R) => S): S;

  /**
   * Returns the current state managed by the store.
   * @returns The current state.
   */
  get: () => T;
  getServerState: () => T;
  /**
   * Provides access to the actions available in the store.
   */
  actions: R;
  /**
   * Subscribes a listener function to state changes in the store.
   * @param listener - Listener function to be called on state changes.
   * @returns A function to unsubscribe the listener.
   */
  subscribe(listener: StateListener<T>): () => void;
  /**
   * Sets the state of the store using a React SetStateAction.
   * @param updateAction - Action to update the state.
   */
  set(updateAction: React.SetStateAction<T>): void;
  persist: PersistHandler<T> | null;
};

/**
 * Defines a hook interface for managing state in Igris.
 * @template T - The type of the state managed by the hook.
 */
export type StateHook<T> = {
  /**
   * Hook function overload: returns a tuple containing state `S` and a dispatch function to update the state.
   */
  <S = T>(): [S, React.Dispatch<React.SetStateAction<T>>];
  /**
   * Returns the current state managed by the hook.
   * @returns The current state.
   */
  get: () => T;
  getServerState: () => T;
  /**
   * Subscribes a listener function to state changes.
   * @param listener - Listener function to be called on state changes.
   * @returns A function to unsubscribe the listener.
   */
  subscribe(listener: StateListener<T>): () => void;
  /**
   * Sets the state using a React SetStateAction.
   * @param updateAction - Action to update the state.
   */
  set(updateAction: React.SetStateAction<T>): void;
  persist: PersistHandler<T> | null;
};

/**
 * Represents the props type after enhancing a component with state props using a state mapping function.
 * @template T Original props type of the component.
 * @template R State mapping function type that maps props to state props.
 */
export type WithConnectProps<
  T extends Record<string, AnyType>,
  R extends (props: AnyType) => AnyType,
> = Omit<T, keyof ReturnType<R>> & ReturnType<R>;

export type DeepPartial<T> =
  T extends Record<string, any>
    ? {
        [K in keyof T]?: DeepPartial<T[K]>;
      }
    : T;

export type WrappedComponentType<P extends Record<string, any>, Ref = never> =
  | ComponentType<P>
  | ForwardRefExoticComponent<P & RefAttributes<Ref>>;

export type HydratorOption =
  | {
      handler: () => void | Promise<void>;
      stores?: never;
      config?: never;
    }
  | {
      handler?: never;
      stores: (StateHook<AnyType> | StoreHook<AnyType, AnyType>)[];
      config?: Partial<{
        storage: StorageProvider;
      }>;
    };

export type HydratorProps = HydratorOption & {
  loadingComponent?: React.ReactNode | React.ReactNode[];
  children: React.ReactNode | React.ReactNode[];
};

export type SetupHydratorFunction = (
  stores: (StateHook<AnyType> | StoreHook<AnyType, AnyType>)[],
  config?: {
    storage?: StorageProvider | undefined;
  }
) => () => void | Promise<void>;

export type SetStateCallback<T> = (state: T) => void | (() => void);
