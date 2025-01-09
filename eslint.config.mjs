// @ts-check
import eslint from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import eslintConfigLove from 'eslint-config-love'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  eslintPluginPrettierRecommended,
  eslintConfigLove,
  {
    ignores: ['eslint.config.mjs', 'commitlint.config.mjs'],
  },
)
