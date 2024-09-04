import { IgrisMaster } from "../core/master";
import { PersistConfig, StorageProvider, PersistStorage } from "../utils/types";
import { PersistHandler } from "./handler";
import { Hydrator, setupHydrator, withHydrator } from "./hydration";

/**
 * Creates a persistence configuration for a store.
 *
 * @template T The type of the store's state
 * @param {Partial<IPersistConfig<T>>} persistConfig The persistence configuration
 * @returns {(storeName: string, store: IgrisMaster<T>) => PersistHandler<T>} A function that creates a PersistHandler
 */
const enablePersist =
  <T>(persistConfig: Partial<PersistConfig<T>> = {}) =>
  (storeName: string, store: IgrisMaster<T>): PersistHandler<T> =>
    new PersistHandler<T>(storeName, store, persistConfig);

// Re-exporting components and types
export {
  PersistHandler,
  Hydrator,
  withHydrator,
  setupHydrator,
  enablePersist,
  type PersistConfig,
  type StorageProvider,
  type PersistStorage,
};

// Default export for easier importing
export default {
  PersistHandler,
  Hydrator,
  withHydrator,
  setupHydrator,
  enablePersist,
};
