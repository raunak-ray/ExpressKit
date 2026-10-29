import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

let prettier = [];
try {
  const prettierConfig = await import("eslint-config-prettier");
  prettier = [prettierConfig.default];
} catch (error) {
  // eslint-config-prettier is optional, used when Prettier is also configured
  void error;
}

export default tseslint.config(
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  ...prettier,
);
