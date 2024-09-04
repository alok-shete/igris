import { useAStore } from "./hooks/useAStore";
import { useAState } from "./hooks/useAState";
import { IgrisStore, createStore } from "./core/store";
import { IgrisState, createState } from "./core/state";
import { withConnect } from "./hoc/withConnect";
import { deepMerge, shallowMerge } from "./utils/functions";
import {
  StateListener,
  PersistConfig,
  StoreConfig,
  ActualStorage,
  WithConnectProps,
  ActionsCallback,
  ActionsCallbackOptions,
  StateHook,
  StoreHook,
} from "./utils/types";

/**
 * Igris library main object containing all exported functionalities.
 */
const Igris = {
  useAStore,
  useAState,
  IgrisStore,
  IgrisState,
  createStore,
  createState,
  deepMerge,
  shallowMerge,
  withConnect,
} as const;

// Named exports for individual components and functions
export {
  useAStore,
  useAState,
  createStore,
  createState,
  IgrisState,
  IgrisStore,
  shallowMerge,
  deepMerge,
  withConnect,
};

// Type exports
export type {
  StateListener,
  PersistConfig,
  StoreConfig,
  ActualStorage,
  WithConnectProps,
  ActionsCallback,
  ActionsCallbackOptions,
  StateHook,
  StoreHook,
};

// Default export
export default Igris;
