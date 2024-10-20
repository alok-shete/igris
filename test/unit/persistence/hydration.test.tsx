import "@testing-library/jest-dom";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StorageProvider, StoreHook } from "../../../src/utils/types";
import { render, act, waitFor } from "@testing-library/react";
import {
  Hydrator,
  setupHydrator,
  withHydrator,
} from "../../../src/persistence/hydration"; // Adjust the import path accordingly

import * as functions from "../../../src/utils/functions";

vi.spyOn(functions, "runImmediately");

describe("setupHydrator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should could not hydrate if persist is undefined", () => {
    const mockStore = {
      get: vi.fn(),
      persist: undefined,
    } as unknown as StoreHook<any, any>;
    const mockStorageProvider = vi.fn();
    const stores = [mockStore];

    const hydrator = setupHydrator(stores, { storage: mockStorageProvider });
    hydrator();
  });
  it("should set storage from config if not defined in store", () => {
    const mockStore = {
      get: vi.fn(),
      persist: {
        config: {
          storage: undefined,
        },
        hydrate: vi.fn(),
      },
    } as unknown as StoreHook<any, any>;
    const mockStorageProvider = vi.fn();
    const stores = [mockStore];

    const hydrator = setupHydrator(stores, { storage: mockStorageProvider });
    hydrator();

    expect(mockStore.persist?.config.storage).toBe(mockStorageProvider);
  });

  it("should not override store storage if already defined", () => {
    const mockExistingStorage = vi.fn();
    const mockStore = {
      get: vi.fn(),
      persist: {
        config: {
          storage: mockExistingStorage,
        },
        hydrate: vi.fn(),
      },
    } as unknown as StoreHook<any, any>;
    const mockStorageProvider = vi.fn();
    const stores = [mockStore];

    const hydrator = setupHydrator(stores, { storage: mockStorageProvider });
    hydrator();

    expect(mockStore.persist?.config.storage).toBe(mockExistingStorage);
  });

  it("should call hydrate method for each store", () => {
    const mockStore = {
      get: vi.fn(),
      persist: {
        config: {
          storage: undefined,
        },
        hydrate: vi.fn().mockResolvedValue(undefined),
      },
    } as unknown as StoreHook<any, any>;
    const stores = [mockStore];
    const mockStorageProvider = vi.fn();

    const hydrator = setupHydrator(stores, { storage: mockStorageProvider });
    hydrator();

    expect(mockStore.persist?.hydrate).toHaveBeenCalledTimes(1);
  });

  it("should return a promise if any store hydration is a promise", async () => {
    const mockStore1 = {
      get: vi.fn(),
      persist: {
        config: {
          storage: undefined,
        },
        hydrate: vi.fn().mockResolvedValue(undefined),
      },
    } as unknown as StoreHook<any, any>;
    const mockStore2 = {
      get: vi.fn(),
      persist: {
        config: {
          storage: undefined,
        },
        hydrate: vi.fn().mockReturnValue(Promise.resolve()),
      },
    } as unknown as StoreHook<any, any>;
    const stores = [mockStore1, mockStore2];
    const mockStorageProvider = vi.fn();

    const hydrator = setupHydrator(stores, { storage: mockStorageProvider });
    const result = hydrator();

    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBeUndefined();
  });

  it("should not return a promise if no store hydration is a promise", () => {
    const mockStore = {
      get: vi.fn(),
      persist: {
        config: {
          storage: undefined,
        },
        hydrate: vi.fn().mockReturnValue(undefined),
      },
    } as unknown as StoreHook<any, any>;
    const stores = [mockStore];

    const hydrator = setupHydrator(stores);
    const result = hydrator();

    expect(result).toBeUndefined();
  });

  it("should call runImmediately with an async function if any hydration is a promise", async () => {
    const mockStore = {
      get: vi.fn(),
      persist: {
        config: {
          storage: vi.fn(),
        },
        hydrate: vi.fn().mockReturnValue(Promise.resolve()),
      },
    } as unknown as StoreHook<any, any>;
    const stores = [mockStore];

    const hydrator = setupHydrator(stores);
    await hydrator();

    expect(functions.runImmediately).toHaveBeenCalledTimes(1);
    expect(functions.runImmediately).toHaveBeenCalledWith(expect.any(Function));
  });
});

describe("Hydrator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading component when not hydrated", async () => {
    let resolveRef = () => {};
    const { getByText } = render(
      <Hydrator
        handler={() =>
          new Promise((resolve) => {
            resolveRef = resolve;
          })
        }
        loadingComponent={<div>Loading...</div>}
      >
        <div>Content</div>
      </Hydrator>
    );
    expect(getByText("Loading...")).toBeInTheDocument();
    // Resolve the promise to trigger hydration
    await act(async () => {
      resolveRef();
    });
  });

  it("renders children when hydrated", () => {
    const { getByText } = render(
      <Hydrator handler={() => {}}>
        <div>Content</div>
      </Hydrator>
    );
    expect(getByText("Content")).toBeInTheDocument();
  });

  it("calls handler function when provided", async () => {
    const mockHandler = vi.fn().mockResolvedValue(undefined);

    render(
      <Hydrator handler={mockHandler}>
        <div>Content</div>
      </Hydrator>
    );

    await waitFor(() => {
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });
  });

  it("uses setupHydrator when stores are provided", async () => {
    const mockStore = {
      get: vi.fn(),
      persist: {
        config: {
          storage: vi.fn(),
        },
        hydrate: vi.fn(),
      },
    } as unknown as StoreHook<any, any>;
    const mockStores = [mockStore];

    const mockConfig = { storage: {} as StorageProvider };

    const { getByText } = render(
      <Hydrator stores={mockStores} config={mockConfig}>
        <div>Content</div>
      </Hydrator>
    );

    expect(getByText("Content")).toBeInTheDocument();
  });

  it("handles synchronous hydration", () => {
    const mockHandler = vi.fn();

    const { getByText } = render(
      <Hydrator handler={mockHandler}>
        <div>Content</div>
      </Hydrator>
    );

    expect(getByText("Content")).toBeInTheDocument();
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it("handles asynchronous hydration", async () => {
    const mockHandler = vi.fn().mockResolvedValue(undefined);
    let resolveHydration: () => void;
    const hydrationPromise = new Promise<void>((resolve) => {
      resolveHydration = resolve;
    });

    const { getByText } = render(
      <Hydrator handler={mockHandler} loadingComponent={<div>Loading...</div>}>
        <div>Content</div>
      </Hydrator>
    );

    expect(getByText("Loading...")).toBeInTheDocument();

    await act(async () => {
      resolveHydration();
      await hydrationPromise;
    });

    expect(getByText("Content")).toBeInTheDocument();
  });
});

describe("withHydrator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("wraps component with Hydrator", () => {
    const TestComponent = () => <div>Test Content</div>;
    const hydratorProps = { handler: vi.fn() };
    const WrappedComponent = withHydrator(TestComponent, hydratorProps);

    const { getByText } = render(<WrappedComponent />);

    expect(getByText("Test Content")).toBeInTheDocument();
  });

  it("passes props to wrapped component", () => {
    const TestComponent = vi.fn(() => null);
    const hydratorProps = { handler: vi.fn() };
    const WrappedComponent = withHydrator(TestComponent, hydratorProps);
    const testProps = { foo: "bar" };

    render(<WrappedComponent {...testProps} />);

    expect(TestComponent).toHaveBeenCalledWith(
      expect.objectContaining(testProps),
      expect.anything()
    );
  });

  it("forwards ref to wrapped component", () => {
    const TestComponent = React.forwardRef<HTMLDivElement, {}>((props, ref) => (
      <div ref={ref}>Test Content</div>
    ));
    const hydratorProps = { handler: vi.fn() };
    const WrappedComponent = withHydrator(TestComponent, hydratorProps);
    const ref = React.createRef<HTMLDivElement>();

    render(<WrappedComponent ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.textContent).toBe("Test Content");
  });

  it("sets correct displayName", () => {
    const TestComponent = () => <div>Test Content</div>;
    TestComponent.displayName = "TestComponent";
    const hydratorProps = { handler: vi.fn() };
    const WrappedComponent = withHydrator(TestComponent, hydratorProps);

    expect(WrappedComponent.displayName).toBe("withHydrator(TestComponent)");
  });

  it("works with function components", () => {
    const TestComponent = (props: { message: string }) => (
      <div>{props.message}</div>
    );
    const hydratorProps = { handler: vi.fn() };
    const WrappedComponent = withHydrator(TestComponent, hydratorProps);

    const { getByText } = render(<WrappedComponent message="Hello" />);

    expect(getByText("Hello")).toBeInTheDocument();
  });

  it("works with class components", () => {
    class TestComponent extends React.Component<{ message: string }> {
      render() {
        return <div>{this.props.message}</div>;
      }
    }
    const hydratorProps = { handler: vi.fn() };
    const WrappedComponent = withHydrator(TestComponent, hydratorProps);

    const { getByText } = render(<WrappedComponent message="Hello" />);

    expect(getByText("Hello")).toBeInTheDocument();
  });

  it("passes hydrator props correctly", () => {
    const TestComponent = () => <div>Test Content</div>;
    const mockHandler = vi.fn();
    const hydratorProps = {
      handler: mockHandler,
      loadingComponent: <div>Loading...</div>,
    };
    const WrappedComponent = withHydrator(TestComponent, hydratorProps);

    render(<WrappedComponent />);
  });
});
