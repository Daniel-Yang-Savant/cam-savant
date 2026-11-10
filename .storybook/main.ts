import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['./stories/*.stories.tsx'],
  staticDirs: [{
    from: '../public/images/exercise-guides/relaxation',
    to: '/images/exercise-guides/relaxation',
  }],
  viteFinal: (config) => ({ ...config, publicDir: false }),
}

export default config
