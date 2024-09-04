import {
  AnyType,
  PersistStorage,
  ActualStorage,
  StorageProvider,
  WrappedComponentType,
} from "./types";

/**
 * Checks if a given function name starts with a specified string.
 */
export const checkStartString = (functionName: string, startString: string) =>
  functionName.startsWith(startString);

/**
 * Determines whether a given value is a Promise.
 */
export const isPromise = <T>(value: unknown): value is Promise<T> =>
  value instanceof Promise;

/**
 * Checks if a given value is an array.
 */
export const isArray = <T>(value: T) => Array.isArray(value);

/**
 * Checks if a given item is a non-null object (excluding arrays).
 */
export const isObject = <T>(item: T) =>
  (item && typeof item === "object" && !Array.isArray(item)) || false;

/**
 * Performs a shallow merge of multiple objects into a single object.
 * @param objects - Objects to merge.
 * @returns A new object with properties from all input objects shallow merged.
 */
export const shallowMerge = <T extends object = Record<string, AnyType>>(
  ...objects: T[]
) => objects.reduce((prev, cur) => ({ ...prev, ...cur }), {} as T);

/**
 * Deep merges multiple objects into a single target object.
 * @param target - The target object to merge into.
 * @param sources - Objects to merge into the target.
 * @returns A new object with properties from all input objects deeply merged.
 */
export const deepMerge = <T extends object = Record<string, AnyType>>(
  target: T,
  ...sources: object[]
): T => {
  const merge = (target: AnyType, source: AnyType): AnyType => {
    Object.keys(source).forEach((key) => {
      const targetValue = target[key];
      const sourceValue = source[key];

      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        target[key] = targetValue.concat(sourceValue);
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        target[key] = merge({ ...targetValue }, sourceValue);
      } else {
        target[key] = sourceValue;
      }
    });

    return target;
  };
  return sources.reduce((prev, cur) => merge(prev, cur), target) as T;
};

/**
 * Utility class for conditional logging based on environment.
 */
export class LOG {
  private static wrapConsoleForNonProd<T>(fun: T) {
    return process.env.NODE_ENV !== "production" ? fun : () => {};
  }
  static get debug() {
    return LOG.wrapConsoleForNonProd(console.log);
  }
  static get warn() {
    return LOG.wrapConsoleForNonProd(console.warn);
  }
  static get error() {
    return console.error;
  }
  static get info() {
    return LOG.wrapConsoleForNonProd(console.info);
  }
}

export class UninitializedStorage implements PersistStorage {
  private logWarningAndReturn =
    <T>(source: string, defaultValue: T) =>
    (): T => {
      LOG.warn(
        `Attempted to access storage before initialization, method : ${source}`
      );
      return defaultValue;
    };

  getKeys = this.logWarningAndReturn("getKeys", []);
  getItem = this.logWarningAndReturn("getItem", null);
  setItem = this.logWarningAndReturn("setItem", undefined);
  removeItem = this.logWarningAndReturn("removeItem", undefined);
}

export function createJSONStorage(
  storageProvider: StorageProvider
): PersistStorage | undefined {
  let storageInstance: ActualStorage;

  try {
    storageInstance =
      typeof storageProvider === "function"
        ? storageProvider()
        : storageProvider;
  } catch {
    return undefined;
  }

  const parseJSON = (str: string | null) => {
    if (str === null) return null;
    try {
      return JSON.parse(str);
    } catch {
      //TODO - need to add log
      return null;
    }
  };

  const jsonPersistStorage: PersistStorage = {
    getItem: (key) => {
      const item = storageInstance.getItem(key);
      return isPromise(item)
        ? runImmediately(async () => parseJSON(await item))
        : parseJSON(item);
    },

    setItem: async (key, value) => {
      const stringifiedValue = JSON.stringify(value);
      const setItemResult = storageInstance.setItem(key, stringifiedValue);
      if (isPromise(setItemResult)) {
        await setItemResult;
      }
    },

    removeItem: async (key) => {
      const removeItemResult = storageInstance.removeItem(key);
      if (isPromise(removeItemResult)) {
        await removeItemResult;
      }
    },
  };

  return jsonPersistStorage;
}

export const runImmediately = <T>(callback: () => T): T => callback();

export function getDisplayName(
  WrappedComponent: WrappedComponentType<any, any>
) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}
