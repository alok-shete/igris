# Igris

[![Build Size](https://img.shields.io/bundlephobia/minzip/igris?label=bundle%20size&style=flat&colorA=000000&colorB=000000)](https://bundlephobia.com/result?p=igris)
[![Version](https://img.shields.io/npm/v/igris?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/igris)
[![Downloads](https://img.shields.io/npm/d18m/igris.svg?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/igris)

Igris is a small, simple, and type-safe state management solution for React and React Native. It offers efficient data persistence and seamless integration with various storage mechanisms. Designed to be lightweight and intuitive, Igris helps developers manage application state with ease and confidence.

## Features

- **Simple API:** Straightforward and intuitive for quick setup and easy state management.
- **Type-safe:** Leverages TypeScript to ensure reliable and error-resistant state management.
- **Synchronous & Asynchronous Storage:** Flexible options to suit various application requirements.
- **Efficient Data Persistence:** Reliable state storage across sessions for seamless user experiences.
- **Customizable Configuration:** Adaptable storage and persistence options for diverse application needs.
- **Seamless Integration:** Easy to adopt in existing React and React Native projects.

## Installation

Install Igris using npm:

```bash
npm install igris
```

Or using yarn:

```bash
yarn add igris
```

## Usage

### Store Example

```tsx
import React from 'react';
import { createStore, createState } from 'igris';

// Create a new instance of the store with initial state and actions
export const useCount = createStore(
  { count: 0 },
  ({ set, get }) => ({
    increment: () => set({ count: get().count + 1 }),
    decrement: () => set({ count: get().count - 1 }),
  })
);

// Component using the entire store
const CounterComponent = () => {
  const { count, decrement, increment } = useCount();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
};

// Component using a selector for state
const CountDisplayComponent = () => {
  const count = useCount((state) => state.count);
  return <p>Count: {count}</p>;
};

// Component using a selector for actions
const CountActionsComponent = () => {
  const { increment, decrement } = useCount((state) => ({
    increment: state.increment,
    decrement: state.decrement,
  }));

  return (
    <div>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
};
```

### State Example

```tsx
export const useDarkTheme = createState(true);

const ThemeComponent = () => {
  const [isDark, setDark] = useDarkTheme();

  return (
    <div>
      <p>Current Theme: {isDark ? 'Dark' : 'Light'}</p>
      <button onClick={() => setDark(true)}>DARK</button>
      <button onClick={() => setDark(false)}>LIGHT</button>
    </div>
  );
}
```

## API Reference

### `createStore(initialState, actions)`

Creates a new store with the given initial state and actions.

- `initialState`: An object representing the initial state of the store.
- `actions`: A function that receives `set` and `get` methods and returns an object of actions.

### `createState(initialValue)`

Creates a new state hook with the given initial value.

- `initialValue`: The initial value of the state.

## Advanced Usage

For more advanced usage examples and detailed API documentation, please visit our [GitHub repository](https://github.com/alok-shete/igris).

## Contributing

We welcome contributions from the community! If you encounter any issues or have suggestions for improvement, please feel free to [open an issue](https://github.com/alok-shete/igris/issues) or submit a pull request on the [Igris GitHub repository](https://github.com/alok-shete/igris).

## Support

If you find Igris helpful, consider supporting its development:

[!["Buy Me A Coffee"](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/shetealok)

Your support helps maintain and improve Igris for the entire community.

## License

This project is licensed under the [MIT License](https://github.com/alok-shete/igris/blob/main/LICENSE).

---

Made with ❤️ by [Alok Shete](https://alokshete.com)
