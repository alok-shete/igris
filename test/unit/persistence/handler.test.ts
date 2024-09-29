import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { PersistHandler } from "../../../src/persistence/handler";
import { IgrisMaster } from "../../../src/core/master";
import * as utils from "../../../src/utils/functions";

// Mock dependencies
vi.mock("../../../src/core/master");
vi.mock("../../../src/utils/functions", async () => {
  const actual = await vi.importActual("../../../src/utils/functions");
  return {
    ...actual,
    LOG: {
      error: vi.fn(),
    },
    createJSONStorage: vi.fn(),
    isPromise: vi.fn(),
    runImmediately: vi.fn(),
  };
});

describe("PersistHandler", () => {
  const storeMock = {
    subscribe: vi.fn(),
    set: vi.fn(),
    currentState: {},
  } as unknown as IgrisMaster<unknown>;

  const mockStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
  };

  const config = {
    storage: vi.fn(),
    version: 1,
    migrate: vi.fn(),
    merge: vi.fn(),
  };

  const partialConfig = {
    debounceTime: 100,
    partial: expect.any(Function),
    skipHydrate: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (utils.createJSONStorage as Mock).mockImplementation((fn) => {
      return fn() ?? mockStorage;
    });
    config.merge.mockImplementation(utils.shallowMerge);
  });

  it("initializes with default config", () => {
    const handler = new PersistHandler("testKey", storeMock, config);
    expect(handler.config).toEqual(expect.objectContaining(partialConfig));
  });

  it("initializes storage correctly", () => {
    const handler = new PersistHandler("testKey", storeMock, config);
    handler["initializeStorage"]();
    expect(utils.createJSONStorage).toHaveBeenCalled();
    expect(handler["storage"]).toEqual(mockStorage);
  });

  it("initializes storage correctly with default storage(localStorage)", () => {
    const config = {
      version: 1,
      migrate: vi.fn(),
      merge: vi.fn(),
    };
    const handler = new PersistHandler("testKey", storeMock, config);
    handler["initializeStorage"]();
    expect(utils.createJSONStorage).toHaveBeenCalled();
    expect(handler["storage"]).not.toEqual(mockStorage);
  });

  it("subscribes to store changes", () => {
    const handler = new PersistHandler("testKey", storeMock, config);
    handler["subscribeStore"]();
    expect(storeMock.subscribe).toHaveBeenCalled();
  });

  it("handles getItem with data not present in db", async () => {
    (mockStorage.getItem as Mock).mockReturnValue(undefined);

    const handler = new PersistHandler(
      "testKey",
      {
        ...storeMock,
        currentState: {
          some: "old",
        },
      } as IgrisMaster<unknown>,
      config
    );

    handler["initializeStorage"]();

    const result = handler.getItem();

    expect(result).toEqual({
      some: "old",
    });
  });

  it("handles getItem with a promise", async () => {
    const promiseMock = Promise.resolve({
      value: {
        some: "data",
      },
      version: 1,
    });
    (mockStorage.getItem as Mock).mockReturnValue(promiseMock);
    const handler = new PersistHandler("testKey", storeMock, config);
    (utils.isPromise as unknown as Mock).mockReturnValue(true);

    (utils.runImmediately as Mock).mockImplementation((fn) => fn());

    handler["initializeStorage"]();

    const result = handler.getItem();

    expect(utils.runImmediately).toHaveBeenCalled();
    expect(utils.isPromise).toHaveBeenCalled();
    expect(result).toBeInstanceOf(Promise);

    expect(await result).toEqual({
      some: "data",
    });
  });

  it("handles error in getItem with catch block", async () => {
    mockStorage.getItem.mockImplementation(() => {
      return Promise.reject(new Error("Test Error"));
    });

    const handler = new PersistHandler("testKey", storeMock, config);
    (utils.isPromise as unknown as Mock).mockReturnValue(true);

    (utils.runImmediately as Mock).mockImplementation((fn) => fn());

    handler["initializeStorage"]();

    const result = handler.getItem();

    expect(utils.runImmediately).toHaveBeenCalled();
    expect(utils.isPromise).toHaveBeenCalled();
    expect(result).toBeInstanceOf(Promise);

    expect(await result).toEqual(null);
  });

  it("handles getItem with non-promise data", () => {
    const handler = new PersistHandler("testKey", storeMock, config);
    (utils.isPromise as unknown as Mock).mockReturnValue(false);
    const data = {
      value: {
        some: "data",
      },
      version: 1,
    };
    (mockStorage.getItem as Mock).mockReturnValue(data);

    handler["initializeStorage"]();

    const result = handler.getItem();
    expect(utils.isPromise).toHaveBeenCalled();
    expect(result).toEqual({
      some: "data",
    });
  });

  it("processes stored data with migration", () => {
    const handler = new PersistHandler("testKey", storeMock, config);
    const data = {
      value: {
        some: "data",
      },
      version: 0,
    };
    (config.migrate as Mock).mockReturnValue({
      someMigratedData: "migratedData",
    });

    const result = handler["processStoredData"](data);
    expect(config.migrate).toHaveBeenCalledWith(
      {
        some: "data",
      },
      0
    );
    expect(result).toEqual({
      someMigratedData: "migratedData",
    });
  });

  it("processes stored data with default shallow merge", () => {
    const withoutMigrateConfig = {
      ...config,
      merge: undefined,
    };
    const newStoreMock = {
      ...storeMock,
      currentState: {
        some: "new",
      },
    };

    const handler = new PersistHandler(
      "testKey",
      newStoreMock as IgrisMaster<unknown>,
      withoutMigrateConfig
    );
    const data = {
      value: {
        some: "data",
        newData: true,
      },
      version: 1,
    };

    const result = handler["processStoredData"](data);

    expect(result).toEqual({
      newData: true,
      some: "data",
    });
  });
  it("ignores migration becouse of migration function not present and version chnaged", () => {
    const withMergrationConfig = {
      ...config,
      migrate: undefined,
    };
    const newStoreMock = {
      ...storeMock,
      currentState: {
        some: "new",
      },
    };
    const handler = new PersistHandler(
      "testKey",
      newStoreMock as IgrisMaster<unknown>,
      withMergrationConfig
    );
    const data = {
      value: {
        some: "old",
      },
    };

    const result = handler["processStoredData"](data);

    expect(result).toEqual({
      some: "new",
    });
  });

  it("sets item with debounce", () => {
    vi.useFakeTimers();
    const handler = new PersistHandler("testKey", storeMock, config);
    handler["initializeStorage"]();
    const data = { some: "data" };

    handler.setItem(data);
    vi.runAllTimers();
    expect(mockStorage.setItem).toHaveBeenCalledWith("testKey", {
      value: data,
      version: config.version,
    });
  });

  it("sets item with catch block", () => {
    vi.useFakeTimers();
    const handler = new PersistHandler("testKey", storeMock, config);
    const data = { some: "data" };
    const error = new Error("Test Error");

    mockStorage.setItem.mockImplementation(() => {
      throw error;
    });
    handler["initializeStorage"]();

    handler.setItem(data);
    vi.runAllTimers();

    expect(mockStorage.setItem).toHaveBeenCalledWith("testKey", {
      value: data,
      version: config.version,
    });
    expect(utils.LOG.error).toHaveBeenCalledWith("Error setting item", error);
  });

  it("hydrates store with promise", async () => {
    const handler = new PersistHandler("testKey", storeMock, config);
    const storedValue = Promise.resolve({ some: "data" });
    (utils.isPromise as unknown as Mock).mockReturnValue(true);
    (utils.runImmediately as Mock).mockImplementation((fn) => fn());

    const getItemMock = vi.spyOn(handler, "getItem");
    getItemMock.mockReturnValue(storedValue);

    await handler.hydrate();
    expect(utils.runImmediately).toHaveBeenCalled();
    await storedValue;

    expect(storeMock.set).toHaveBeenCalledWith({ some: "data" });
  });

  it("hydrates store without promise", () => {
    const handler = new PersistHandler("testKey", storeMock, config);
    const storedValue = { some: "data" };
    (utils.isPromise as unknown as Mock).mockReturnValue(false);
    const getItemMock = vi.spyOn(handler, "getItem");
    getItemMock.mockReturnValue(storedValue);

    handler.hydrate();
    expect(storeMock.set).toHaveBeenCalledWith({ some: "data" });
  });

  it("subscribes to store changes and calls setItem", () => {
    const handler = new PersistHandler("testKey", storeMock, config);
    const data = { some: "data" };
    handler["initializeStorage"]();

    const setItemMock = vi.spyOn(handler, "setItem");
    setItemMock.mockImplementation(() => {});

    (storeMock.subscribe as Mock).mockImplementation((callback) => {
      callback(data);
      return vi.fn();
    });

    handler["subscribeStore"]();
    expect(storeMock.subscribe).toHaveBeenCalled();
    expect(setItemMock).toHaveBeenCalledWith(data);
  });
});
