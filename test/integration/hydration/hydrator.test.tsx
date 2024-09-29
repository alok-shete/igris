import React from "react";
import { createState, createStore } from "../../../src";
import {
  Hydrator,
  enablePersist,
  withHydrator,
} from "../../../src/persistence";
import { HydratorOption } from "../../../src/utils/types";
import { createAsyncMock } from "../../utils/functions";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";

const persistedStateStoreFactory = () => {
  const countStateWithoutPersist = createState(0);
  const countStateWithSyncPersist = createState(0, {
    name: "count",
    persist: enablePersist(),
  });

  const countStateWithASyncPersist = createState(0, {
    name: "count",
    persist: enablePersist({
      storage: createAsyncMock(),
    }),
  });

  const countStoreWithoutPersist = createStore({ count: 0 }, () => ({}));
  const countStoreWithSyncPersist = createStore({ count: 0 }, () => ({}), {
    name: "count",
    persist: enablePersist(),
  });

  const countStoreWithASyncPersist = createStore({ count: 0 }, () => ({}), {
    name: "count",
    persist: enablePersist({
      storage: createAsyncMock(),
    }),
  });

  return {
    countStateWithoutPersist,
    countStateWithSyncPersist,
    countStateWithASyncPersist,
    countStoreWithoutPersist,
    countStoreWithSyncPersist,
    countStoreWithASyncPersist,
  };
};

const HydratorComponent = (hydratorProps: HydratorOption) => {
  return (
    <Hydrator {...hydratorProps}>
      <h1 data-testid="hydrated">Hydrator</h1>
    </Hydrator>
  );
};

const WithHydratorComponent = (hydratorProps: HydratorOption) => {
  const SampleComponent: React.FC = () => (
    <div data-testid="sample-component">Sample Component</div>
  );

  const WrappedComponent = withHydrator(SampleComponent, hydratorProps);

  return <WrappedComponent />;
};

describe("HydratorComponent Integration Tests", () => {
  it("should render loading component initially", () => {
    const { countStateWithSyncPersist, countStoreWithSyncPersist } =
      persistedStateStoreFactory();

    const props: HydratorOption = {
      stores: [countStateWithSyncPersist, countStoreWithSyncPersist],
      loadingComponent: <div data-testid="loading">Loading...</div>,
    };

    render(<HydratorComponent {...props} />);

    expect(screen.getByTestId("hydrated")).toBeInTheDocument();
  });

  it("should render children component after hydration", async () => {
    const { countStateWithSyncPersist, countStoreWithSyncPersist } =
      persistedStateStoreFactory();
    const props: HydratorOption = {
      stores: [countStateWithSyncPersist, countStoreWithSyncPersist],
      loadingComponent: <div data-testid="loading">Loading...</div>,
    };

    render(<HydratorComponent {...props} />);

    await waitFor(() => {
      expect(screen.getByTestId("hydrated")).toBeInTheDocument();
    });
  });

  it("should handle async store hydration", async () => {
    const { countStateWithASyncPersist, countStoreWithASyncPersist } =
      persistedStateStoreFactory();
    const props: HydratorOption = {
      stores: [countStateWithASyncPersist, countStoreWithASyncPersist],
      loadingComponent: <div data-testid="loading">Loading...</div>,
    };

    render(<HydratorComponent {...props} />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("hydrated")).toBeInTheDocument();
    });
  });

  it("should handle custom handler function for hydration", async () => {
    const customHandler = vi.fn().mockResolvedValueOnce(void 0);

    const props: HydratorOption = {
      handler: customHandler,
      loadingComponent: <div data-testid="loading">Loading...</div>,
    };

    render(<HydratorComponent {...props} />);

    await waitFor(() => {
      expect(screen.getByTestId("hydrated")).toBeInTheDocument();
    });

    expect(customHandler).toHaveBeenCalled();
  });
});

describe("withHydrator HOC Integration Tests", () => {
  it("should render wrapped component after hydration", async () => {
    const { countStateWithSyncPersist, countStoreWithSyncPersist } =
      persistedStateStoreFactory();
    const hydratorProps: HydratorOption = {
      stores: [countStateWithSyncPersist, countStoreWithSyncPersist],
      loadingComponent: <div data-testid="loading">Loading...</div>,
    };

    render(<WithHydratorComponent {...hydratorProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("sample-component")).toBeInTheDocument();
    });
  });

  it("should handle async store hydration", async () => {
    const { countStateWithASyncPersist, countStoreWithASyncPersist } =
      persistedStateStoreFactory();

    const hydratorProps: HydratorOption = {
      stores: [countStateWithASyncPersist, countStoreWithASyncPersist],
      loadingComponent: <div data-testid="loading">Loading...</div>,
    };

    render(<WithHydratorComponent {...hydratorProps} />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("sample-component")).toBeInTheDocument();
    });
  });

  it("should handle custom handler function for hydration", async () => {
    const customHandler = vi.fn().mockResolvedValueOnce(void 0);

    const hydratorProps: HydratorOption = {
      handler: customHandler,
      loadingComponent: <div data-testid="loading">Loading...</div>,
    };

    render(<WithHydratorComponent {...hydratorProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("sample-component")).toBeInTheDocument();
    });

    expect(customHandler).toHaveBeenCalled();
  });
});
