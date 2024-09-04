import { PersistHandler } from "../persistence/handler";
import { LOG } from "../utils/functions";
import { StoreConfig, StateListener } from "../utils/types";
export class IgrisMaster<T> {
  protected listeners: Set<StateListener<T>>; // Set of store listeners
  public currentState: T; // Current actual value
  public persist: PersistHandler<T> | null = null;
  private fetchCurrentState: () => T;
  public getServerState: () => T;
  constructor(initialState: T, config?: StoreConfig<T>) {
    this.listeners = new Set<StateListener<T>>();
    this.currentState = initialState;
    this.getServerState = () => this.currentState;
    this.set = this.set.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.get = this.get.bind(this);
    this.fetchCurrentState = this.initializeValue;
    if (config?.persist) {
      if (config.name) {
        this.persist = config.persist(config.name, this);
      } else {
        LOG.error("Persist not configured");
      }
    }
  }

  /**
   * Updates the store's value with the provided update action.
   * @param updateAction - New value or function to update the current value.
   */

  set(updateAction: React.SetStateAction<T>) {
    this.currentState =
      typeof updateAction === "function"
        ? (updateAction as (prevState: T) => T)(this.fetchCurrentState())
        : updateAction;

    this.listeners.forEach((listener) => listener(this.currentState));
  }

  /**
   * Subscribes a listener to state changes in the store.
   * @param listener - Listener function to be subscribed.
   * @returns Function to unsubscribe the listener.
   */
  subscribe(listener: StateListener<T>): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Retrieves the current value of the store.
   * @returns Current value of the store.
   */
  get() {
    return this.fetchCurrentState();
  }

  /**
   * Initializes the store's current value from storage, if available.
   * Handles merging with initial value based on storage configuration.
   */
  private initializeValue = (): T => {
    if (this.persist && !this.persist.config.skipHydrate) {
      this.persist.hydrate();
    }

    // Define a function to fetch the current state
    this.fetchCurrentState = () => {
      return this.currentState as T;
    };

    return this.currentState as T;
  };
}
