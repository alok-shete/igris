import { describe, it, expect, vi, beforeEach } from "vitest";
import { IgrisMaster } from "../../../src/core/master";
import { LOG } from "../../../src/utils/functions";
import { AnyType } from "../../../src/utils/types";

// Mock dependencies
vi.mock("../../../src/utils/functions", () => ({
  LOG: {
    error: vi.fn(),
  },
}));

describe("IgrisMaster", () => {
  let store: IgrisMaster<number>;

  beforeEach(() => {
    store = new IgrisMaster<number>(0);
  });

  it("should return server state", () => {
    expect(store.getServerState()).toBe(0);
  });

  it("should initialize with the given initial state", () => {
    expect(store.get()).toBe(0);
  });

  it("should update state with a new value", () => {
    store.set(5);
    expect(store.get()).toBe(5);
  });

  it("should update state with a function", () => {
    store.set((prev) => prev + 1);
    expect(store.get()).toBe(1);
  });

  it("should notify subscribers when state changes", () => {
    const listener = vi.fn();
    store.subscribe(listener);

    store.set(10);
    expect(listener).toHaveBeenCalledWith(10);
  });

  it("should allow unsubscribing", () => {
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.set(15);
    expect(listener).not.toHaveBeenCalled();
  });

  it("should initialize persist handler when config is provided", () => {
    const mockPersist = vi.fn().mockReturnValue({});
    const storeWithPersist = new IgrisMaster<number>(0, {
      persist: mockPersist,
      name: "testStore",
    });

    expect(mockPersist).toHaveBeenCalledWith("testStore", expect.any(Object));
    expect(storeWithPersist.persist).toBeDefined();
  });

  it("should log error when persist is configured without a name", () => {
    const mockPersist = vi.fn();
    new IgrisMaster<number>(0, { persist: mockPersist } as AnyType);

    expect(LOG.error).toHaveBeenCalledWith("Persist not configured");
  });

  it("should hydrate from persist handler if available", () => {
    const mockHydrate = vi.fn();
    const mockPersist = vi
      .fn()
      .mockReturnValue({ hydrate: mockHydrate, config: {} });

    const instance = new IgrisMaster<number>(0, {
      persist: mockPersist,
      name: "testStore",
    });

    instance.get();
    expect(mockHydrate).toHaveBeenCalledTimes(1);
  });

  it("should not hydrate if skipHydrate is true in persist config", () => {
    const mockHydrate = vi.fn();
    const mockPersist = vi.fn().mockReturnValue({
      hydrate: mockHydrate,
      config: { skipHydrate: true },
    });

    new IgrisMaster<number>(0, {
      persist: mockPersist,
      name: "testStore",
    });

    expect(mockHydrate).not.toHaveBeenCalled();
  });
});
