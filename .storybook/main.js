
/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],
  "framework": "@storybook/react-vite",
  async viteFinal(config) {
    const { mergeConfig } = await import('vite');
    const { resolve, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    const react = await import('@vitejs/plugin-react');

    // NOTE: This configuration mirrors the 'renderer' config in electron.vite.config.js.
    // If you update aliases or PostCSS plugins there, please update this file as well.

    const __dirname = dirname(fileURLToPath(import.meta.url));

    return mergeConfig(config, {
      plugins: [react.default()],
      resolve: {
        alias: {
          '@': resolve(__dirname, '../src/renderer')
        }
      },
      css: {
        postcss: {
          plugins: [
            (await import('@tailwindcss/postcss')).default,
            (await import('autoprefixer')).default
          ]
        }
      }
    });
  },
};
export default config;