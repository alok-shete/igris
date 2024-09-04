# Igris

> Igris is a small, simple, and type-safe state management solution for React and React Native. It offers efficient data persistence and seamless integration with various storage mechanisms. Designed to be lightweight and intuitive, Igris helps developers manage application state with ease and confidence.

## Features

- **Simple API:** Igris provides a straightforward API for managing state in React applications, making it easy to integrate and use. Its intuitive API allows developers to quickly set up and manage state without a steep learning curve.
- **Type-safe:** Ensures that your application state is managed in a type-safe manner, reducing the risk of runtime errors. By leveraging TypeScript, Igris ensures that your state management is reliable and less prone to errors, leading to a more robust codebase and easier maintenance.
- **Synchronous & Asynchronous Storage:** Choose between synchronous and asynchronous storage options based on your application's requirements. Whether you need immediate state updates or handling state in more complex scenarios, Igris has you covered.
- **Efficient Data Persistence:** Igris offers efficient data persistence, ensuring that your application state is reliably stored across sessions. This is crucial for applications that need to maintain data across sessions, providing seamless saving and restoring of your application state.
- **Customizable Configuration:** Customize storage and persistence options to suit your application's needs. Igris offers a high level of customization, making it suitable for a wide range of applications, from simple to complex.
- **Seamless Integration:** Igris seamlessly integrates with various storage mechanisms, providing flexibility and compatibility. Integrating Igris into your existing React or React Native project is straightforward, allowing easy adoption without significant changes to your current setup.

## Installation

You can install Igris via npm or yarn:

```
npm install igris
```

or

```
yarn add igris
```

## Usage

```tsx
import React from 'react';
import { createStore, createState } from 'igris';

// **Store Example**

// Create a new instance of the store with initial state and actions
export const useCount = createStore(
  { count: 0 },
  ({ set, get }) => ({
    increment: () => {
      set({ count: get().count + 1 });
    },
    decrement: () => {
      set({ count: get().count - 1 });
    },
  })
);

// Without selector
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

// With selector to get state
const CountDisplayComponent = () => {
  const count = useCount((state) => state.count);

  return (
    <div>
      <p>Count: {count}</p>
    </div>
  );
};

// With selector to get actions
const CountActionsComponent = () => {
  const increment = useCount((state) => state.increment);
  const decrement = useCount((state) => state.decrement);

  return (
    <div>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
};

// **State Example**

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

## Documentation
For detailed documentation and usage examples, please visit the Igris GitHub repository.

## Contributing
We welcome contributions from the community! If you encounter any issues or have suggestions for improvement, please feel free to open an issue or submit a pull request on the <a href = "https://github.com/alok-shete/igris" target="_blank"> Igris GitHub repository.<a>

## Donate

Please consider donating if you think HTTPtestify is helpful to you or that my work is valuable. I am happy if you can help me <a href = "https://www.buymeacoffee.com/shetealok" target="_blank">buy a cup of coffee. ❤️

## License

This project is licensed under the <a href = "https://github.com/alok-shete/igris/blob/main/LICENSE" target="_blank">MIT License</a>
