// This file has been automatically migrated to valid ESM format by Storybook.
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';

const require = createRequire(import.meta.url);

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
  stories: ['../../docs/storybook/*.mdx', '../../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  addons: [getAbsolutePath('@storybook/addon-docs')],

  // App notices describe the shipped renderer, not Storybook's development runtime.
  async viteFinal(config) {
    config.plugins = (await Promise.all(config.plugins ?? [])).filter(
      (plugin) => !plugin || Array.isArray(plugin) || plugin.name !== 'open-source-notices',
    );
    return config;
  },

  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: { builder: { viteConfigPath: 'tooling/config/vite.config.ts' } },
  },
};

export default config;
