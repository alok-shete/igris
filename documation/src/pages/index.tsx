import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";
import { Github, Package, Coffee } from "lucide-react";
import styles from "./index.module.css";

function Badges(): JSX.Element {
  return (
    <div className={styles.badges}>
      <a href="https://www.npmjs.com/package/igris" target="_blank" rel="noopener noreferrer">
        <img src="https://img.shields.io/npm/v/igris?style=flat&colorA=000000&colorB=000000" alt="npm version" />
      </a>
      <a href="https://bundlephobia.com/result?p=igris" target="_blank" rel="noopener noreferrer">
        <img src="https://img.shields.io/bundlephobia/minzip/igris?label=bundle%20size&style=flat&colorA=000000&colorB=000000" alt="bundle size" />
      </a>
      <a href="https://www.npmjs.com/package/igris" target="_blank" rel="noopener noreferrer">
        <img src="https://img.shields.io/npm/dm/igris.svg?style=flat&colorA=000000&colorB=000000" alt="downloads" />
      </a>
    </div>
  );
}

function HomepageHeader(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <Badges />
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/introduction/getting-started"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

function CommunitySection(): JSX.Element {
  return (
    <div className={clsx("padding-vert--xl", styles.community)}>
      <div className="container">
        <div className="text--center margin-bottom--xl">
          <Heading as="h2">Join Our Community</Heading>
        </div>
        <div className="row">
          <div className="col col--4">
            <div className="text--center">
              <Github className={styles.communityIcon} />
              <Heading as="h3">GitHub</Heading>
              <p>Star us, contribute, or report issues</p>
              <Link
                className="button button--secondary"
                href="https://github.com/alok-shete/igris"
              >
                View Repository
              </Link>
            </div>
          </div>
          <div className="col col--4">
            <div className="text--center">
              <Package className={styles.communityIcon} />
              <Heading as="h3">npm</Heading>
              <p>Latest package releases</p>
              <Link
                className="button button--secondary"
                href="https://www.npmjs.com/package/igris"
              >
                View Package
              </Link>
            </div>
          </div>
          <div className="col col--4">
            <div className="text--center">
              <Coffee className={styles.communityIcon} />
              <Heading as="h3">Support</Heading>
              <p>Help maintain and improve Igris</p>
              <Link
                className="button button--secondary"
                href="https://www.buymeacoffee.com/shetealok"
              >
                Buy Me a Coffee
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home(): JSX.Element {
  const description = "A lightweight, type-safe state management solution designed to make React state simple";
  
  return (
    <Layout description={description}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <CommunitySection />
      </main>
    </Layout>
  );
}