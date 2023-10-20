import globals from 'globals';
import config from 'eslint-config-qubyte';

export default [
  {
    languageOptions: {
      ...config.languageOptions,
      globals: globals.nodeBuiltin
    },
    rules: {
      ...config.rules,
      'no-invalid-this': 'off'
    }
  }
];
