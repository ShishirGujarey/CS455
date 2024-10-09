import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, 
        ...globals.jest 
      },
    },
    rules: {
      "complexity": ["error", { max: 10 }],
    },
  },
  pluginJs.configs.recommended,
];