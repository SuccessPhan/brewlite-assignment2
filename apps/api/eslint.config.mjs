// Cấu hình ESLint cho backend NestJS (flat config, ESLint 9)
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
    },
    rules: {
      // Biến bắt đầu bằng _ là cố ý bỏ qua (ví dụ tách trường khỏi object)
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
      // NestJS dùng class rỗng cho module, decorator cho DTO
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
);
