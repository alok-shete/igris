import React from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";
import { Activity, Code, Feather, Smartphone, Wrench, Zap } from "lucide-react";

type FeatureItem = {
  title: string;
  icon: JSX.Element;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Type-Safe by Design",
    icon: <Feather />,
    description: (
      <>
        Leverage TypeScript's static typing for state management. Catch errors
        at compile-time and enjoy excellent IDE support with full autocompletion
        and type inference.
      </>
    ),
  },
  {
    title: "Lightweight & Efficient",
    icon: <Zap />,
    description: (
      <>
        With a tiny bundle size and zero dependencies, Igris ensures your
        application stays fast and efficient. Selective re-rendering keeps your
        app responsive.
      </>
    ),
  },
  {
    title: "Simple API",
    icon: <Code />,
    description: (
      <>
        Get started quickly with an intuitive API. Create stores with{" "}
        <code>createStore</code> and manage simple state with{" "}
        <code>createState</code>. No complex configurations needed.
      </>
    ),
  },
  {
    title: "Flexible Storage",
    icon: <Activity />,
    description: (
      <>
        Choose between synchronous and asynchronous storage options. Persist
        state across sessions with built-in storage adapters or create custom
        solutions.
      </>
    ),
  },
  {
    title: "React Native Ready",
    icon: <Smartphone />,
    description: (
      <>
        Built with React Native in mind. Use the same state management solution
        across web and mobile platforms with consistent APIs and behavior.
      </>
    ),
  },
  {
    title: "Developer Friendly",
    icon: <Wrench />,
    description: (
      <>
        Comprehensive documentation, predictable behavior, and excellent
        debugging support make development a breeze. Integrates seamlessly with
        React DevTools.
      </>
    ),
  },
];

function Feature({ title, icon, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <div className={styles.featureIcon}>{icon}</div>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="text--center margin-bottom--xl">
          <Heading as="h2">Why Choose Igris?</Heading>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
