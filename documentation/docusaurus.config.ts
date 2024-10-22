import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Igris",
  tagline:
    "A lightweight, type-safe state management solution designed to make React state simple",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://igris-doc.web.app",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "alok-shete", // Usually your GitHub org/user name.
  projectName: "igris", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/alok-shete/igris/tree/main/documentation",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "Igris",
      logo: {
        alt: "Igris Logo",
        src: "img/igris.png",
      },
      items: [
        {
          // type: "docSidebar",
          sidebarId: "tutorialSidebar",
          to: "/docs/introduction/getting-started",
          position: "left",
          label: "Docs",
        },
        {
          href: "https://github.com/alok-shete/igris",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      // style: "dark",
      links: [],
      // The copyright sentence is fine as is.
      copyright: `© ${new Date().getFullYear()} Igris. Created by <a href="https://alokshete.com" target="_blank" rel="noopener noreferrer">Alok Shete</a>. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
