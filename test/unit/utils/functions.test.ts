import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  isPromise,
  isArray,
  isObject,
  shallowMerge,
  deepMerge,
  LOG,
  UninitializedStorage,
  createJSONStorage,
  runImmediately,
  getDisplayName,
} from "../../../src/utils/functions";

describe("Utility Functions", () => {
  describe("isPromise", () => {
    it("should return true for promises", () => {
      expect(isPromise(Promise.resolve())).toBe(true);
    });

    it("should return false for non-promises", () => {
      expect(isPromise({})).toBe(false);
      expect(isPromise([])).toBe(false);
      expect(isPromise(42)).toBe(false);
    });
  });

  describe("isArray", () => {
    it("should return true for arrays", () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
    });

    it("should return false for non-arrays", () => {
      expect(isArray({})).toBe(false);
      expect(isArray("string")).toBe(false);
      expect(isArray(42)).toBe(false);
    });
  });

  describe("isObject", () => {
    it("should return true for objects", () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
    });

    it("should return false for non-objects", () => {
      expect(isObject([])).toBe(false);
      expect(isObject("string")).toBe(false);
      expect(isObject(42)).toBe(false);
    });
  });

  describe("shallowMerge", () => {
    it("should merge objects shallowly", () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 3, c: 4 };
      expect(shallowMerge(obj1, obj2)).toEqual({ a: 1, b: 3, c: 4 });
    });

    it("should merge single object shallowly", () => {
      const obj1 = { a: 1, b: 2 };
      expect(shallowMerge(obj1)).toEqual({ a: 1, b: 2 });
    });
  });

  describe("deepMerge", () => {
    it("should merge objects deeply", () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { b: { d: 3 }, e: 4 };
      expect(deepMerge(obj1, obj2)).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 });
    });

    it("should concatenate arrays", () => {
      const obj1 = { a: [1, 2] };
      const obj2 = { a: [3, 4] };
      expect(deepMerge(obj1, obj2)).toEqual({ a: [1, 2, 3, 4] });
    });
  });
});

describe("LOG", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  it("should log in non-production environment", () => {
    process.env.NODE_ENV = "development";
    LOG.debug("test");
    expect(console.log).toHaveBeenCalledWith("test");
  });

  it("should log in non-production environment", () => {
    process.env.NODE_ENV = "development";
    LOG.info("test");
    expect(console.info).toHaveBeenCalledWith("test");
  });

  it("should not log in production environment", () => {
    process.env.NODE_ENV = "production";
    LOG.debug("test");
    expect(console.log).not.toHaveBeenCalled();
  });

  it("should always log errors", () => {
    process.env.NODE_ENV = "production";
    LOG.error("test error");
    expect(console.error).toHaveBeenCalledWith("test error");
  });
});

describe("UninitializedStorage", () => {
  let storage: UninitializedStorage;

  beforeEach(() => {
    storage = new UninitializedStorage();
    vi.spyOn(LOG, "warn").mockImplementation(() => {});
  });

  it("should log warnings and return default values", () => {
    expect(storage.getKeys()).toEqual([]);
    expect(storage.getItem()).toBeNull();
    expect(storage.setItem()).toBeUndefined();
    expect(storage.removeItem()).toBeUndefined();
    expect(LOG.warn).toHaveBeenCalledTimes(4);
  });
});

describe("createJSONStorage", () => {
  it("should create a JSON storage with synchronous provider", () => {
    const mockStorage = {
      getItem: vi.fn().mockReturnValue('{"key":"value"}'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    const jsonStorage = createJSONStorage(mockStorage);

    expect(jsonStorage?.getItem("key")).toEqual({ key: "value" });
    jsonStorage?.setItem("key", { foo: "bar" });
    expect(mockStorage.setItem).toHaveBeenCalledWith("key", '{"foo":"bar"}');
    jsonStorage?.removeItem("key");
    expect(mockStorage.removeItem).toHaveBeenCalledWith("key");
  });

  it("should create a JSON storage with asynchronous provider", async () => {
    const mockStorage = {
      getItem: vi.fn().mockResolvedValue('{"key":"value"}'),
      setItem: vi.fn().mockResolvedValue(undefined),
      removeItem: vi.fn().mockResolvedValue(undefined),
    };
    const jsonStorage = createJSONStorage(() => mockStorage);

    expect(await jsonStorage?.getItem("key")).toEqual({ key: "value" });
    await jsonStorage?.setItem("key", { foo: "bar" });
    expect(mockStorage.setItem).toHaveBeenCalledWith("key", '{"foo":"bar"}');
    await jsonStorage?.removeItem("key");
    expect(mockStorage.removeItem).toHaveBeenCalledWith("key");
  });

  it("should return undefined if storageProvider throws an error", () => {
    const faultyProvider = () => {
      throw new Error("Error");
    };
    const jsonStorage = createJSONStorage(faultyProvider);
    expect(jsonStorage).toBeUndefined();
  });

  it("should handle null values in getItem", () => {
    const mockStorage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    const jsonStorage = createJSONStorage(mockStorage);

    expect(jsonStorage?.getItem("key")).toBeNull();
  });

  it("should handle JSON parsing errors in getItem", () => {
    const mockStorage = {
      getItem: vi.fn().mockReturnValue("invalid JSON"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    const jsonStorage = createJSONStorage(mockStorage);

    expect(jsonStorage?.getItem("key")).toBeNull();
  });

  it("should handle JSON.stringify errors in setItem", async () => {
    const mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn().mockResolvedValue(undefined),
      removeItem: vi.fn(),
    };
    const circularObj = {};
    circularObj["circularRef"] = circularObj;
    const jsonStorage = createJSONStorage(mockStorage);

    await expect(jsonStorage?.setItem("key", circularObj)).rejects.toThrow(
      TypeError
    );
  });

  it("should handle synchronous removeItem", () => {
    const mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn().mockReturnValue(undefined),
    };
    const jsonStorage = createJSONStorage(mockStorage);

    jsonStorage?.removeItem("key");
    expect(mockStorage.removeItem).toHaveBeenCalledWith("key");
  });

  it("should handle asynchronous removeItem", async () => {
    const mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn().mockResolvedValue(undefined),
    };
    const jsonStorage = createJSONStorage(mockStorage);

    await jsonStorage?.removeItem("key");
    expect(mockStorage.removeItem).toHaveBeenCalledWith("key");
  });

  it("should handle a provider that is not a function", () => {
    const mockStorage = {
      getItem: vi.fn().mockReturnValue('{"key":"value"}'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    const jsonStorage = createJSONStorage(mockStorage);

    expect(jsonStorage?.getItem("key")).toEqual({ key: "value" });
  });
});

describe("runImmediately", () => {
  it("should run the callback immediately", () => {
    const callback = vi.fn().mockReturnValue(42);
    expect(runImmediately(callback)).toBe(42);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe("getDisplayName", () => {
  it("should return the display name of a component", () => {
    const Component = () => null;
    Component.displayName = "MyComponent";
    expect(getDisplayName(Component)).toBe("MyComponent");
  });

  it("should return the name of a component if display name is not set", () => {
    const Component = () => null;
    expect(getDisplayName(Component)).toBe("Component");
  });

  it('should return "Component" if neither display name nor name is set', () => {
    const Component = () => null;
    Object.defineProperty(Component, "name", { value: undefined });
    expect(getDisplayName(Component)).toBe("Component");
  });
});
