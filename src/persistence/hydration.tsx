import React, {
  forwardRef,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
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
  return () => {
    const results = stores.map((store) => {
      if (store.persist?.config.storage == undefined) {
        if (store.persist && config?.storage) {
          store.persist.config.storage = config.storage;
        } else {
          return;
        }
      }
      store.get();
      return store.persist?.hydrate();
    });
    if (results.some((result) => result instanceof Promise)) {
      return runImmediately(async () => {
        await Promise.all(results);
      });
    }

    return;
  };
};

export const Hydrator: React.FC<HydratorProps> = (props) => {
  const promiseRef = useRef<void | Promise<void> | null>(undefined);
  const hydrationStateRef = useRef({ isHydrated: false });

  const isHydrated = useSyncExternalStoreWithSelector(
    (onStoreChange) => {
      if (!hydrationStateRef.current.isHydrated) {
        Promise.resolve(promiseRef.current).then(() => {
          hydrationStateRef.current.isHydrated = true;
          onStoreChange();
        });
      }
      return () => {};
    },
    () => {
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
    },
    () => hydrationStateRef.current.isHydrated,
    (state) => state
  );
  if (!isHydrated) {
    return <>{props.loadingComponent ?? null}</>;
  }

  return <>{props.children}</>;
};

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
