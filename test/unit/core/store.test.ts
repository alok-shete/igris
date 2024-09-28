import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react-hooks";
import { IgrisStore, createStore } from "../../../src/core/store";

// Mock the use-sync-external-store module

describe("IgrisStore", () => {
  it("should initialize with the given initial state", () => {
    const initialState = { count: 0 };
    const store = new IgrisStore(initialState, () => ({}));
    expect(store.get()).toEqual(initialState);
  });

  it("should update state using set method", () => {
    const store = new IgrisStore({ count: 0 }, () => ({}));
    store.set({ count: 5 });
    expect(store.get()).toEqual({ count: 5 });
  });

  it("should create actions using the callback", () => {
    const store = new IgrisStore({ count: 0 }, ({ set }) => ({
      increment: () => set((state) => ({ count: state.count + 1 })),
    }));
    expect(store.actions.increment).toBeDefined();
    store.actions.increment();
    expect(store.get()).toEqual({ count: 1 });
  });
});

describe("createStore", () => {
  it("should create a store hook with initial state and actions", () => {
    const useStore = createStore({ count: 0 }, ({ set }) => ({
      increment: () => set((state) => ({ count: state.count + 1 })),
    }));

    expect(useStore).toBeDefined();
    expect(useStore.actions.increment).toBeDefined();
  });

  it("should update state when using the created hook", () => {
    const useStore = createStore({ count: 0 }, ({ set }) => ({
      increment: () => set((state) => ({ count: state.count + 1 })),
    }));

    const { result } = renderHook(() => useStore());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it("should allow selecting specific parts of state", () => {
    const useStore = createStore({ count: 0, name: "test" }, ({ set }) => ({
      increment: () => set((state) => ({ ...state, count: state.count + 1 })),
    }));

    const { result } = renderHook(() =>
      useStore((state) => ({ count: state.count }))
    );

    expect(result.current).toEqual({ count: 0 });
    expect(result.current["name"]).toBeUndefined();
  });

  it("should subscribe to state changes", () => {
    const useStore = createStore({ count: 0 }, ({ set }) => ({
      increment: () => set((state) => ({ count: state.count + 1 })),
    }));

    const listener = vi.fn();
    const unsubscribe = useStore.subscribe(listener);

    act(() => {
      useStore.actions.increment();
    });

    expect(listener).toHaveBeenCalledWith({ count: 1 });

    unsubscribe();

    act(() => {
      useStore.actions.increment();
    });

    // Listener should not be called after unsubscribing
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should work with getServerState", () => {
    const useStore = createStore({ count: 0 }, ({ set }) => ({
      increment: () => set((state) => ({ count: state.count + 1 })),
    }));

    expect(useStore.getServerState()).toEqual({ count: 0 });

    act(() => {
      useStore.actions.increment();
    });

    expect(useStore.getServerState()).toEqual({ count: 1 });
  });
});
