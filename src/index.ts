import { IgrisStore, createStore, useAStore } from "./core/store";
import { IgrisState, createState, useAState } from "./core/state";
import { withConnect } from "./core/withConnect";
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
