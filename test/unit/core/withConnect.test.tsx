import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { withConnect } from "../../../src/core/withConnect";

// Test components
const TestComponent: React.FC<{ name: string; age: number }> = ({
  name,
  age,
}) => (
  <div>
    <span data-testid="name">{name}</span>
    <span data-testid="age">{age}</span>
  </div>
);

const TestComponentWithRef = React.forwardRef<
  HTMLDivElement,
  { name: string; age: number }
>(({ name, age }, ref) => (
  <div ref={ref}>
    <span data-testid="name">{name}</span>
    <span data-testid="age">{age}</span>
  </div>
));

describe("withConnect HOC", () => {
  it("should pass through original props", () => {
    const EnhancedComponent = withConnect(TestComponent, () => ({}));
    render(<EnhancedComponent name="John" age={30} />);

    expect(screen.getByTestId("name").textContent).toBe("John");
    expect(screen.getByTestId("age").textContent).toBe("30");
  });

  it("should add mapped state props", () => {
    const stateMap = (props: { name: string }) => ({
      age: props.name.length * 2,
    });
    const EnhancedComponent = withConnect(TestComponent, stateMap);
    render(<EnhancedComponent name="John" />);

    expect(screen.getByTestId("name").textContent).toBe("John");
    expect(screen.getByTestId("age").textContent).toBe("8"); // 'John'.length * 2
  });

  it("should override original props with mapped state props", () => {
    const stateMap = () => ({ age: 40 });
    const EnhancedComponent = withConnect(TestComponent, stateMap);
    const props = {
      name: "John",
      age: 30,
    };
    render(<EnhancedComponent {...props} />);

    expect(screen.getByTestId("name").textContent).toBe("John");
    expect(screen.getByTestId("age").textContent).toBe("40");
  });

  it("should forward refs", () => {
    const ref = React.createRef<HTMLDivElement>();
    const EnhancedComponent = withConnect(TestComponentWithRef, () => ({}));
    render(<EnhancedComponent ref={ref} name="John" age={30} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("should set correct displayName", () => {
    const EnhancedComponent = withConnect(TestComponent, () => ({}));
    expect(EnhancedComponent.displayName).toBe(
      "withIgrisConnect(TestComponent)"
    );
  });

  it("should work with components without props", () => {
    const NoPropsComponent: React.FC = () => (
      <div data-testid="no-props">No Props</div>
    );
    const EnhancedComponent = withConnect(NoPropsComponent, () => ({
      extraProp: "extra",
    }));
    render(<EnhancedComponent />);

    expect(screen.getByTestId("no-props").textContent).toBe("No Props");
  });

  it("should handle null values in stateMap", () => {
    const stateMap = () => ({ age: null });
    const EnhancedComponent = withConnect(TestComponent, stateMap);
    render(<EnhancedComponent name="John" />);

    expect(screen.getByTestId("name").textContent).toBe("John");
    expect(screen.getByTestId("age").textContent).toBe("");
  });
});
