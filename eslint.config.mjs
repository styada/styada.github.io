import coreWebVitals from "eslint-config-next/core-web-vitals";

export default [
  ...coreWebVitals,
  {
    rules: {
      // ThemeToggle reads DOM state on mount - legitimate use case
      "react-hooks/set-state-in-effect": "off",
      // OG image route uses raw <img> intentionally (next/og JSX context)
      "@next/next/no-img-element": "off",
    },
  },
];
