import type { Preview } from '@storybook/react-vite'
import '../app/globals.css'

const preview: Preview = {
  parameters: {
    controls: { disable: true },
    viewport: {
      options: {
        phone: { name: '手機 390 px', styles: { width: '390px', height: '844px' } },
      },
    },
  },
}

export default preview
