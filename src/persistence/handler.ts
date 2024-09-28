import { IgrisMaster } from "../core/master";
import {
  LOG,
  UninitializedStorage,
  createJSONStorage,
  isPromise,
  runImmediately,
  shallowMerge,
} from "../utils/functions";
import {
  AnyType,
  PersistConfig,
  PersistStorage,
  StorageValue,
  PartiallyRequired,
} from "../utils/types";

export class PersistHandler<T> {
  private readonly key: string;
  private timeoutId: NodeJS.Timeout | undefined;
  private readonly store: IgrisMaster<T>;
  private storage: PersistStorage = new UninitializedStorage();
  private unsubscribeStore = () => {};

  config: PartiallyRequired<
    PersistConfig<T>,
    "debounceTime" | "partial" | "skipHydrate"
  >;

  /**
   * Constructs a new instance of the PersistHandler.
   * @param key - The key associated with the stored data.
   */
  constructor(
    storeName: string,
    store: IgrisMaster<T>,
    persisConfig: PersistConfig<T>
  ) {
    this.key = storeName;
    this.store = store;

    this.config = {
      skipHydrate: false,
      debounceTime: 100,
      partial: (data) => data,
      ...persisConfig,
    };
  }

  private initializeStorage(): void {
    const defaultStorage = () => localStorage;
    const storage = createJSONStorage(this.config.storage || defaultStorage);
    if (storage) {
      this.storage = storage;
    }
  }

  private subscribeStore = () => {
    this.unsubscribeStore();
    this.unsubscribeStore = this.store.subscribe((data) => {
      this.setItem(data);
    });
  };

  public hydrate(): void | Promise<void> {
    this.initializeStorage();
    const storedValue = this.getItem();

    if (isPromise(storedValue)) {
      const hydratePromise = runImmediately(async () => {
        const resolvedValue = await storedValue;
        this.store.set(resolvedValue as T);
      });
      this.hydrate = () => hydratePromise;
    } else {
      this.store.set(storedValue as T);
      this.hydrate = () => undefined;
    }
    this.subscribeStore();
    return this.hydrate();
  }

  /**
   * Retrieves the stored data associated with the key.
   * @returns The stored data or an empty object if data is not found.
   * @template T - The type of the stored data.
   */
  public getItem() {
    const storedData = this.storage.getItem<StorageValue<T>>(this.key) ?? null;

    if (isPromise(storedData)) {
      return runImmediately(async () => {
        try {
          return this.processStoredData(await storedData);
        } catch (error) {
          LOG.error("Error retrieving stored data:", error);
          return null;
        }
      });
    } else {
      return this.processStoredData(storedData);
    }
  }

  private processStoredData(data: StorageValue<T> | null): T | undefined {
    if (!data) return this.store.currentState;

    const { value, version } = data;
    let processedData = value as T;

    if (this.config.version !== version && this.config.migrate) {
      processedData = this.config.migrate(value, version) as T;
    }

    const mergeFunction = this.config.merge ?? shallowMerge;
    return mergeFunction(
      this.store.currentState as AnyType,
      processedData as AnyType
    ) as T; //TODO - need validate this type
  }

  /**
   * Sets the stored data associated with the key with a debounce mechanism.
   * @param data - The data to be stored.
   * @template T - The type of the data to be stored.
   */
  public setItem<T>(data: T) {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      const version = this.config.version;
      const partialData = this.config.partial(data as AnyType);

      try {
        this.storage.setItem(this.key, {
          value: partialData,
          version: version,
        });
      } catch (error) {
        LOG.error("Error setting item", error);
      }
    }, this.config.debounceTime);
  }
}
