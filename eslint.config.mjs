import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/node_modules/**"],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["**/*.queries.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["apps/core-platform/src/**/app/**/*.ts"],
    ignores: ["**/*.module.ts", "**/*.module.spec.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/infra/**"],
              message:
                "Application code must depend on inward-facing ports, not infrastructure adapters.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["apps/core-platform/src/**/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/app/**", "**/infra/**", "**/public-api/**"],
              message:
                "Domain code must not depend on application, infrastructure, or public transport contracts.",
            },
          ],
        },
      ],
    },
  },
);
