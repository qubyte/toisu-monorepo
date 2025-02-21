import config from 'eslint-config-qubyte';

export default [
  {
    languageOptions: {
      ...config.languageOptions,
      globals: {
        Buffer: 'readable',
        setTimeout: 'readable',
        URL: 'readable'
      }
    },
    rules: {
      ...config.rules,
      'no-invalid-this': 'off'
    }
  }
];
