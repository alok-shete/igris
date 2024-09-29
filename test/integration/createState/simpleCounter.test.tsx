import React, { act } from "react";
import { createState } from "../../../src/index";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { IgrisMaster } from "../../../src/core/master";
import { PersistHandler, enablePersist } from "../../../src/persistence";
import {
  createAsyncMock,
  getDataFromStorage,
  removeDataFromStorage,
  setDataToStorage,
} from "../../utils/functions";

const persistName = "counter";
const SimpleCounter = (
  persist?: (
    storeName: string,
    store: IgrisMaster<number>
  ) => PersistHandler<number>
) => {
  const useCounter = createState(0, {
    name: persistName,
    persist: persist,
  });

  // Component using the entire store
  const CounterActions = () => {
    const [_, setCount] = useCounter();

    return (
      <div>
        <button
          data-testid="increment-button"
          onClick={() => setCount((count) => count + 1)}
        >
          Increment
        </button>
        <button
          data-testid="decrement-button"
          onClick={() => setCount((count) => count - 1)}
        >
          Decrement
        </button>
      </div>
    );
  };

  const DisplayCounter = () => {
    const [count] = useCounter();

    return (
      <div>
        <p data-testid="count-value">Count: {count}</p>
      </div>
    );
  };

  const CounterApp = () => {
    return (
      <div>
        <CounterActions />
        <DisplayCounter />
      </div>
    );
  };

  return {
    CounterApp,
    useCounter,
  };
};

describe("SimpleCounter Integration Tests", () => {
  it("renders counter with initial count of 0", () => {
    const { CounterApp } = SimpleCounter();
    render(<CounterApp />);
    expect(screen.getByTestId("count-value")).toHaveTextContent("Count: 0");
  });

  it("increments the count when increment button is clicked", () => {
    const { CounterApp } = SimpleCounter();
    render(<CounterApp />);
    const incrementButton = screen.getByTestId("increment-button");
    fireEvent.click(incrementButton);
    expect(screen.getByTestId("count-value")).toHaveTextContent("Count: 1");
  });

  it("decrements the count when decrement button is clicked", () => {
    const { CounterApp } = SimpleCounter();
    render(<CounterApp />);
    const incrementButton = screen.getByTestId("increment-button");
    const decrementButton = screen.getByTestId("decrement-button");

    fireEvent.click(incrementButton);
    expect(screen.getByTestId("count-value")).toHaveTextContent("Count: 1");

    fireEvent.click(decrementButton);
    expect(screen.getByTestId("count-value")).toHaveTextContent("Count: 0");
  });

  it("multiple increments and decrements work correctly", () => {
    const { CounterApp } = SimpleCounter();
    render(<CounterApp />);
    const incrementButton = screen.getByTestId("increment-button");
    const decrementButton = screen.getByTestId("decrement-button");

    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    expect(screen.getByTestId("count-value")).toHaveTextContent("Count: 3");

    fireEvent.click(decrementButton);
    fireEvent.click(decrementButton);
    expect(screen.getByTestId("count-value")).toHaveTextContent("Count: 1");
  });
});

describe("SimpleCounter Sync Persist Integration Tests", () => {
  beforeEach(() => {
    removeDataFromStorage(localStorage, persistName);
  });

  it("persists count to localStorage on increment and decrement", async () => {
    vi.useFakeTimers();
    const { CounterApp } = SimpleCounter(enablePersist());
    render(<CounterApp />);
    const incrementButton = screen.getByTestId("increment-button");
    const decrementButton = screen.getByTestId("decrement-button");

    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    fireEvent.click(decrementButton);

    vi.runAllTimers();
    expect(getDataFromStorage(localStorage, persistName)).toStrictEqual({
      value: 1,
    });
  });

  it("initializes count from localStorage if available", () => {
    setDataToStorage(localStorage, persistName, 5);
    const { CounterApp } = SimpleCounter(enablePersist());
    render(<CounterApp />);
    expect(screen.getByTestId("count-value")).toHaveTextContent("Count: 5");
  });
});

describe("SimpleCounter Async Persist Integration Tests", () => {
  beforeEach(() => {
    removeDataFromStorage(localStorage, persistName);
  });

  it("persists count to Async storage on increment and decrement", async () => {
    vi.useFakeTimers();
    const mockAsynStorage = createAsyncMock();
    const { CounterApp } = SimpleCounter(
      enablePersist({
        storage: mockAsynStorage,
        debounceTime: 0,
      })
    );
    render(<CounterApp />);
    const incrementButton = screen.getByTestId("increment-button");
    const decrementButton = screen.getByTestId("decrement-button");

    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    fireEvent.click(decrementButton);
    vi.runAllTimers();
    expect(getDataFromStorage(localStorage, persistName)).toStrictEqual({
      value: 1,
    });
  });

  it("initializes count from localStorage if available", async () => {
    const mockAsynStorage = createAsyncMock();
    setDataToStorage(localStorage, persistName, 5);
    const { CounterApp } = SimpleCounter(
      enablePersist({
        storage: mockAsynStorage,
      })
    );
    await act(() => {
      return render(<CounterApp />);
    });
    expect(screen.getByTestId("count-value")).toHaveTextContent("Count: 5");
  });
});
