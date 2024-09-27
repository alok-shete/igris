import React, {
  forwardRef,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
} from "react";
import { WrappedComponentType } from "../utils/types";
import { getDisplayName } from "../utils/functions";

/**
 * Higher-order component that enhances a component by mapping state props using a state mapping function.
 * @template P - The props type of the wrapped component
 * @template R - The type of the additional props provided by the state mapping function
 * @template Ref - The type of the ref for the wrapped component
 * @param WrappedComponent - The component to be wrapped with state props
 * @param stateMap - A function that maps props to additional state props
 * @returns A component with enhanced props from stateMap
 */
export const withConnect = <
  P extends Record<string, any>,
  R extends Record<string, any>,
  Ref = unknown,
>(
  WrappedComponent: WrappedComponentType<P, Ref>,
  stateMap: (props: React.PropsWithoutRef<Omit<P, keyof R>>) => R
): ForwardRefExoticComponent<
  PropsWithoutRef<Omit<P, keyof R>> & RefAttributes<Ref>
> => {
  type EnhancedProps = Omit<P, keyof R>;

  const EnhancedComponent = forwardRef<Ref, EnhancedProps>((props, ref) => {
    const mappedState = stateMap(props);
    const combinedProps = { ...props, ...mappedState };

    return <WrappedComponent {...(combinedProps as unknown as P)} ref={ref} />;
  });

  EnhancedComponent.displayName = `withIgrisConnect(${getDisplayName(WrappedComponent)})`;

  return EnhancedComponent;
};
