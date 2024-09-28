import { describe, it, expect, vi } from "vitest";
import { IgrisMaster } from "../../../src/core/master";
import { PersistHandler } from "../../../src/persistence/handler";
import { enablePersist } from "../../../src/persistence/index";

describe("enablePersist", () => {
  it("should create a PersistHandler with the correct parameters", () => {
    // Arrange
    const storeName = "testStore";
    const initialState = { key: "value" };
    const mockStore = new IgrisMaster(initialState);
    const persistConfig = {
      debounceTime: 1000,
      version: 1,
      migrate: vi.fn(),
    };

    // Act
    const createPersistHandler = enablePersist(persistConfig);
    const persistHandler = createPersistHandler(storeName, mockStore);

    // Assert
    expect(persistHandler).toBeInstanceOf(PersistHandler);
    expect(persistHandler["key"]).toBe(storeName);
    expect(persistHandler["store"]).toBe(mockStore);
    expect(persistHandler.config).toEqual(
      expect.objectContaining(persistConfig)
    );
  });

  it("should use default configuration if none is provided", () => {
    // Arrange
    const storeName = "testStore";
    const initialState = { key: "value" };
    const mockStore = new IgrisMaster(initialState);

    // Act
    const createPersistHandler = enablePersist();
    const persistHandler = createPersistHandler(
      storeName,
      mockStore as IgrisMaster<unknown>
    );

    // Assert
    expect(persistHandler).toBeInstanceOf(PersistHandler);
    expect(persistHandler["key"]).toBe(storeName);
    expect(persistHandler["store"]).toBe(mockStore);
    expect(persistHandler.config).toEqual({
      debounceTime: 100,
      partial: expect.any(Function),
      skipHydrate: false,
    });
  });
});
