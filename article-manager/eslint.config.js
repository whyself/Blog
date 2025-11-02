import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';

export default [
  {
    ignores: ['dist/**', 'dist-electron/**', 'release/**']
  },
  {
    files: ['src/renderer/src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        console: 'readonly'
      }
    },
    rules: {
      ...js.configs.recommended.rules
    }
  },
  {
    files: ['src/renderer/src/**/*.vue'],
    languageOptions: {
      parser: vueParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        console: 'readonly'
      }
    },
    plugins: {
      vue: pluginVue
    },
    rules: {
      ...js.configs.recommended.rules,
      ...pluginVue.configs['vue3-essential'].rules,
      'vue/multi-word-component-names': 'off'
    }
  }
];
