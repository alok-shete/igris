import React from "react";
import { createState, createStore } from "../../../src/index";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { PersistHandler, enablePersist } from "../../../src/persistence";
import {
  getDataFromStorage,
  removeDataFromStorage,
  setDataToStorage,
} from "../../utils/functions";
import { IgrisMaster } from "../../../src/core/master";

const persistName = "login";

type StateType = { username: string; password: string; isLoggedIn: boolean };

export const LoginForm = (
  persist?: (
    storeName: string,
    store: IgrisMaster<StateType>
  ) => PersistHandler<StateType>
) => {
  const loginCallback = vi.fn();
  const useLoginForm = createState(
    { username: "", password: "", isLoggedIn: false },

    {
      name: persistName,
      persist: persist,
    }
  );

  const LoginActions = () => {
    const [user, setUser] = useLoginForm();

    const setUsername = (username: string) =>
      setUser({
        ...user,
        username,
      });
    const setPassword = (password: string) =>
      setUser({
        ...user,
        password,
      });
    const login = () => {
      const { username, password } = user;
      if (username === "user" && password === "pass") {
        setUser(
          (pre) => ({
            ...pre,
            isLoggedIn: true,
          }),
          loginCallback
        );
      } else {
        alert("Invalid credentials");
      }
    };
    const logout = () =>
      setUser({
        ...user,
        isLoggedIn: false,
      });

    return (
      <div>
        {user.isLoggedIn ? (
          <button data-testid="logout-button" onClick={logout}>
            Logout
          </button>
        ) : (
          <div>
            <input
              data-testid="username-input"
              type="text"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              data-testid="password-input"
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button data-testid="login-button" onClick={login}>
              Login
            </button>
          </div>
        )}
      </div>
    );
  };

  const DisplayLoginStatus = () => {
    const [user] = useLoginForm();

    return (
      <div data-testid="login-status">
        {user.isLoggedIn ? <p>You are logged in</p> : <p>Please log in</p>}
      </div>
    );
  };

  const LoginApp = () => {
    return (
      <div>
        <LoginActions />
        <DisplayLoginStatus />
      </div>
    );
  };

  return {
    LoginApp,
    useLoginForm,
    loginCallback,
  };
};

describe("LoginForm Integration Tests", () => {
  it("renders login form initially", () => {
    const { LoginApp } = LoginForm();
    render(<LoginApp />);
    expect(screen.getByTestId("username-input")).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(screen.getByTestId("login-button")).toBeInTheDocument();
    expect(screen.getByTestId("login-status")).toHaveTextContent(
      "Please log in"
    );
  });

  it("logs in with correct credentials", () => {
    const { LoginApp, loginCallback } = LoginForm();
    render(<LoginApp />);
    fireEvent.change(screen.getByTestId("username-input"), {
      target: { value: "user" },
    });
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { value: "pass" },
    });
    fireEvent.click(screen.getByTestId("login-button"));
    expect(screen.getByTestId("login-status")).toHaveTextContent(
      "You are logged in"
    );
    expect(loginCallback).toHaveBeenCalled();
  });

  it("shows alert with incorrect credentials", () => {
    const { LoginApp } = LoginForm();
    // Use a Jest spy to listen for alert calls and verify the alert message
    const alertSpy = vi.spyOn(window, "alert");

    render(<LoginApp />);
    fireEvent.change(screen.getByTestId("username-input"), {
      target: { value: "user" },
    });
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByTestId("login-button"));

    // Check if the alert was called with the correct message
    expect(alertSpy).toHaveBeenCalledWith("Invalid credentials");

    // Restore the original alert function
    alertSpy.mockRestore();
  });

  it("logs out when logout button is clicked", () => {
    const { LoginApp } = LoginForm();
    render(<LoginApp />);
    fireEvent.change(screen.getByTestId("username-input"), {
      target: { value: "user" },
    });
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { value: "pass" },
    });
    fireEvent.click(screen.getByTestId("login-button"));
    fireEvent.click(screen.getByTestId("logout-button"));
    expect(screen.getByTestId("login-status")).toHaveTextContent(
      "Please log in"
    );
  });
});

describe("LoginForm Sync Persist Integration Tests", () => {
  beforeEach(() => {
    removeDataFromStorage(sessionStorage, persistName);
  });

  it("logs in with correct credentials", () => {
    vi.useFakeTimers();
    const { LoginApp } = LoginForm(
      enablePersist({
        storage: sessionStorage,
      })
    );
    render(<LoginApp />);
    fireEvent.change(screen.getByTestId("username-input"), {
      target: { value: "user" },
    });
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { value: "pass" },
    });
    fireEvent.click(screen.getByTestId("login-button"));
    expect(screen.getByTestId("login-status")).toHaveTextContent(
      "You are logged in"
    );
    vi.runAllTimers();
    const storeValue = getDataFromStorage(sessionStorage, persistName);
    expect(storeValue).toStrictEqual({
      value: { username: "user", password: "pass", isLoggedIn: true },
    });
  });

  it("logs in with correct credentials - store only isLoggedIn(partial value)", () => {
    vi.useFakeTimers();
    const { LoginApp } = LoginForm(
      enablePersist({
        storage: sessionStorage,
        partial: (state) => ({
          isLoggedIn: state.isLoggedIn,
        }),
      })
    );
    render(<LoginApp />);
    fireEvent.change(screen.getByTestId("username-input"), {
      target: { value: "user" },
    });
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { value: "pass" },
    });
    fireEvent.click(screen.getByTestId("login-button"));
    expect(screen.getByTestId("login-status")).toHaveTextContent(
      "You are logged in"
    );
    vi.runAllTimers();
    const storeValue = getDataFromStorage(sessionStorage, persistName);
    expect(storeValue).toStrictEqual({
      value: { isLoggedIn: true },
    });
  });

  it("logs out when logout button is clicked", () => {
    vi.useFakeTimers();
    const { LoginApp } = LoginForm(
      enablePersist({
        storage: sessionStorage,
      })
    );
    render(<LoginApp />);
    fireEvent.change(screen.getByTestId("username-input"), {
      target: { value: "user" },
    });
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { value: "pass" },
    });
    fireEvent.click(screen.getByTestId("login-button"));

    fireEvent.click(screen.getByTestId("logout-button"));
    expect(screen.getByTestId("login-status")).toHaveTextContent(
      "Please log in"
    );
    vi.runAllTimers();
    const storeValue = getDataFromStorage(sessionStorage, persistName);
    expect(storeValue).toStrictEqual({
      value: { username: "user", password: "pass", isLoggedIn: false },
    });
  });

  it("logs out when the user is already logged in", () => {
    setDataToStorage(sessionStorage, persistName, {
      username: "user",
      password: "pass",
      isLoggedIn: true,
    });

    const { LoginApp } = LoginForm(
      enablePersist({
        storage: sessionStorage,
      })
    );
    render(<LoginApp />);

    // Verify that the logout button is present and the user is logged in
    expect(screen.getByTestId("logout-button")).toBeInTheDocument();
    expect(screen.getByTestId("login-status")).toHaveTextContent(
      "You are logged in"
    );

    // Click the logout button
    fireEvent.click(screen.getByTestId("logout-button"));

    // Verify that the login form is displayed again and the user is logged out
    expect(screen.getByTestId("username-input")).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(screen.getByTestId("login-button")).toBeInTheDocument();
    expect(screen.getByTestId("login-status")).toHaveTextContent(
      "Please log in"
    );
  });

  it("logs automatic becouse of store version chnaged", () => {
    setDataToStorage(sessionStorage, persistName, {
      username: "user",
      password: "pass",
      isLoggedIn: true,
    });

    const { LoginApp } = LoginForm(
      enablePersist({
        storage: sessionStorage,
        version: 2,
      })
    );
    render(<LoginApp />);

    // Verify that the login form is displayed again and the user is logged out
    expect(screen.getByTestId("username-input")).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(screen.getByTestId("login-button")).toBeInTheDocument();
    expect(screen.getByTestId("login-status")).toHaveTextContent(
      "Please log in"
    );
  });

  it("user not logs out automatic becouse of store version chnaged but migrate function is present", () => {
    setDataToStorage(sessionStorage, persistName, {
      username: "user",
      password: "pass",
      isLoggedIn: true,
    });

    const { LoginApp } = LoginForm(
      enablePersist({
        storage: sessionStorage,
        version: 2,
        migrate: (storedValue) => {
          return {
            isLoggedIn: storedValue.isLoggedIn,
          };
        },
      })
    );
    render(<LoginApp />);

    // Verify that the logout button is present and the user is logged in
    expect(screen.getByTestId("logout-button")).toBeInTheDocument();
  });
});
