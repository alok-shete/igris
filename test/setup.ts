import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import "@testing-library/jest-dom";

declare module "vitest" {
  interface Assertion<T = any>
    extends jest.Matchers<void, T>,
      TestingLibraryMatchers<T, void> {}
}
