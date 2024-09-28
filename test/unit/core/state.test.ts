import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react-hooks";
import { IgrisState, createState, useAState } from "../../../src/core/state";
import { AnyType } from "../../../src/utils/types";
import { enablePersist } from "../../../src/persistence";

describe("IgrisState", () => {
  it("should initialize with initial state", () => {
    // Arrange
    const initialState = { count: 0, text: "Initial Text" };

    // Act
    const state = new IgrisState(initialState);

    // Assert
    expect(state.get()).toEqual(initialState);
  });

  it("should initialize with configuration", () => {
    // Arrange
    const initialState = { count: 0, text: "Initial Text" };
    const config = { persist: enablePersist(), name: "testKey" };
    // Act
    const state = new IgrisState(initialState, config);
    // Assert
    expect(state.persist?.["key"]).toBe("testKey");
  });

  it("should set default merge function if none provided", () => {
    // Arrange
    const initialState = { count: 0 };
    const config = { persist: enablePersist(), name: "testKey" };

    // Act
    const state = new IgrisState(initialState, config as AnyType);

    // Assert
    expect(state.persist?.config.merge).toBeDefined();
    expect(typeof state.persist?.config.merge).toBe("function");

    // Arrange new state for merge function test
    const currentState = { count: 1, name: "test" };
    const storeState = { count: 2 };

    // Act
    const mergedState = state.persist?.config.merge?.(currentState, storeState);

    // Assert
    expect(mergedState).toEqual({ count: 2, name: "test" });
  });

  it("should set default merge function if none provided - ", () => {
    // Arrange
    const initialState = "new";
    const config = { persist: enablePersist(), name: "testKey" };

    // Act
    const state = new IgrisState(initialState, config as AnyType);

    // Assert
    expect(state.persist?.config.merge).toBeDefined();
    expect(typeof state.persist?.config.merge).toBe("function");

    // Arrange new state for merge function test
    const currentState = "new";
    const storeState = "store";

    // Act
    const mergedState = state.persist?.config.merge?.(currentState, storeState);

    // Assert
    expect(mergedState).toEqual(storeState);
  });
});

describe("createState", () => {
  it("should create a state hook with initial state", () => {
    const useAppState = createState({ count: 0 });
    expect(useAppState).toBeDefined();
    expect(useAppState.get()).toEqual({ count: 0 });
  });

  it("should update state when using the created hook", () => {
    const useAppState = createState({ count: 0 });
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current[1]({ count: 5 });
    });

    expect(result.current[0]).toEqual({ count: 5 });
  });

  it("should allow subscribing to state changes", () => {
    const useAppState = createState({ count: 0 });
    const listener = vi.fn();
    const unsubscribe = useAppState.subscribe(listener);

    act(() => {
      useAppState.set({ count: 5 });
    });

    expect(listener).toHaveBeenCalledWith({ count: 5 });

    unsubscribe();

    act(() => {
      useAppState.set({ count: 10 });
    });

    // Listener should not be called after unsubscribing
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe("useAState", () => {
  it("should return current state and setter function", () => {
    const state = new IgrisState({ count: 0 });
    const { result } = renderHook(() => useAState(state));

    expect(result.current[0]).toEqual({ count: 0 });
    expect(typeof result.current[1]).toBe("function");
  });

  it("should update state when setter is called", () => {
    const state = new IgrisState({ count: 0 });
    const { result } = renderHook(() => useAState(state));

    act(() => {
      result.current[1]({ count: 5 });
    });

    expect(result.current[0]).toEqual({ count: 5 });
  });

  it("should call callback after state update", () => {
    const state = new IgrisState({ count: 0 });
    const { result } = renderHook(() => useAState(state));
    const callback = vi.fn();

    act(() => {
      result.current[1]({ count: 5 }, callback);
    });

    expect(callback).toHaveBeenCalledWith({ count: 5 });
  });

  it("should work with functional updates", () => {
    const state = new IgrisState({ count: 0 });
    const { result } = renderHook(() => useAState(state));

    act(() => {
      result.current[1]((prevState) => ({ count: prevState.count + 1 }));
    });

    expect(result.current[0]).toEqual({ count: 1 });
  });
});
