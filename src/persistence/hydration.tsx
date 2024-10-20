import React, {
  forwardRef,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
  useCallback,
  useMemo,
  useRef,
} from "react";

import {
  AnyType,
  HydratorOption,
  HydratorProps,
  StateHook,
  StorageProvider,
  StoreHook,
  WrappedComponentType,
} from "../utils/types";
import { getDisplayName, runImmediately } from "../utils/functions";

import useSyncExternalStoreExports from "use-sync-external-store/shim/with-selector.js";
const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports;

export const setupHydrator = (
  stores: (StateHook<AnyType> | StoreHook<AnyType, AnyType>)[],
  config?: {
    storage?: StorageProvider | undefined;
  }
): (() => void | Promise<void>) => {
  // Create optimized hydration function
  return () => {
    const hydrationPromises: (Promise<void> | void)[] = [];

    // Use for...of loop for better performance with early exits
    for (const store of stores) {
      // Skip if store doesn't need hydration
      if (!store.persist) continue;

      // Configure storage if needed
      if (store.persist.config.storage === undefined && config?.storage) {
        store.persist.config.storage = config.storage;
      }

      // Track hydration result
      const hydrationPromise = store.persist.hydrate();
      if (hydrationPromise instanceof Promise) {
        hydrationPromises.push(hydrationPromise);
      }
    }

    // Return early if no async operations
    if (!hydrationPromises.length) return;

    // Handle async hydration
    return runImmediately(async () => {
      await Promise.all(hydrationPromises);
    });
  };
};

export const Hydrator: React.FC<HydratorProps> = React.memo((props) => {
  const promiseRef = useRef<void | Promise<void> | null>(undefined);
  const hydrationStateRef = useRef({ isHydrated: false });

  const subscribe = useCallback((onStoreChange: () => void) => {
    if (!hydrationStateRef.current.isHydrated) {
      Promise.resolve(promiseRef.current).then(() => {
        hydrationStateRef.current.isHydrated = true;
        onStoreChange();
      });
    }
    return () => {};
  }, []);

  const getSnapshot = useCallback(() => {
    if (promiseRef.current === undefined) {
      if (props.handler) {
        promiseRef.current = props.handler() ?? null;
      } else {
        promiseRef.current =
          runImmediately(setupHydrator(props.stores, props.config)) ?? null;
      }

      if (!(promiseRef.current instanceof Promise)) {
        hydrationStateRef.current.isHydrated = true;
      }
    }

    return hydrationStateRef.current.isHydrated;
  }, [props.handler, props.stores, props.config]);

  const isHydrated = useSyncExternalStoreWithSelector(
    subscribe,
    getSnapshot,
    getSnapshot,
    (state) => state
  );

  return useMemo(() => {
    if (!isHydrated) {
      return props.loadingComponent ?? null;
    }
    return props.children;
  }, [isHydrated, props.loadingComponent, props.children]);
});

export const withHydrator = <P extends Record<string, any>, Ref = unknown>(
  WrappedComponent: WrappedComponentType<React.PropsWithoutRef<P>, Ref>,
  hydratorProps: HydratorOption
): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<Ref>> => {
  const EnhancedComponent = forwardRef<Ref, P>((props, ref) => {
    return (
      <Hydrator {...hydratorProps}>
        <WrappedComponent {...props} ref={ref} />
      </Hydrator>
    );
  });

  EnhancedComponent.displayName = `withHydrator(${getDisplayName(WrappedComponent)})`;

  return EnhancedComponent;
};
