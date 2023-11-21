module.exports = {
  parserOptions: {
    project: './tsconfig.json',
  },
  env: {
    node: true,
    es6: true,
  },
  extends: [
    'airbnb',
    'airbnb-typescript/base',
    'prettier',
    'eslint:recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['prettier'],
  rules: {
    'no-console': 'error',
    'import/prefer-default-export': 'off',
  },
};
