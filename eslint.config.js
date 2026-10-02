import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

// Regras de arquitetura do CLAUDE.md, aplicadas pela máquina.
const proibidoEmPuros = {
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        { group: ['react', 'react-*', 'react/*'], message: 'Módulo puro: não importe React.' },
        { group: ['tone', 'tone/*'], message: 'Módulo puro: não importe Tone.js.' },
        {
          group: ['**/audio/**', '**/componentes/**', '**/telas/**', '**/progresso/**'],
          message: 'Módulo puro: não dependa de camadas de navegador.',
        },
      ],
    },
  ],
  'no-restricted-globals': [
    'error',
    { name: 'window', message: 'Módulo puro: sem window.' },
    { name: 'document', message: 'Módulo puro: sem document.' },
    { name: 'localStorage', message: 'Módulo puro: sem localStorage.' },
  ],
};

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      'referencias',
      'coverage',
      'test-results',
      'playwright-report',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/progresso/**'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'localStorage', message: 'localStorage só em src/progresso.' },
      ],
    },
  },
  {
    files: ['src/teoria/**/*.ts', 'src/exercicios/**/*.ts', 'src/agenda/**/*.ts'],
    rules: proibidoEmPuros,
  },
  {
    files: ['scripts/**/*.mjs', '*.config.{js,ts}', 'e2e/**/*.{ts,mjs}'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
);
