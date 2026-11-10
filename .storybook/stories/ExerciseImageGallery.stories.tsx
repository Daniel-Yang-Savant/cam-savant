import type { Meta, StoryObj } from '@storybook/react-vite'
import ExerciseImageGallery from '../../components/ExerciseImageGallery'
import { RELAXATION_GUIDES } from '../../lib/exercise-guides-relaxation'

const neckGuide = RELAXATION_GUIDES.find((guide) => guide.id === 'neck-shoulder-reset')
if (!neckGuide) throw new Error('Missing public relaxation images for the gallery preview')

const images = neckGuide.images

const meta = {
  title: '圖解/圖片檢視器',
  component: ExerciseImageGallery,
  args: { images, children: null },
  render: ({ images }) => (
    <main lang="zh-TW" className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold">動作圖解</h1>
      <ExerciseImageGallery images={images} as="ol" className="mt-4 grid gap-4">
        {images.map((image, index) => (
          <li key={image.src}>
            <a
              href={image.src}
              data-gallery-index={index}
              aria-haspopup="dialog"
              aria-label={`放大查看：${image.alt}`}
              className="block cursor-zoom-in rounded-xl border border-neutral-200 p-3"
            >
              {/* Storybook serves these sample assets directly without Next's image server. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.src} alt={image.alt} className="w-full rounded-lg" />
              <span className="mt-2 block text-sm font-semibold">{image.caption}</span>
            </a>
          </li>
        ))}
      </ExerciseImageGallery>
    </main>
  ),
} satisfies Meta<typeof ExerciseImageGallery>

export default meta
type Story = StoryObj<typeof meta>

export const MultipleImages: Story = { name: '多張圖解' }

export const SingleImage: Story = {
  name: '單張圖解',
  args: { images: images.slice(0, 1) },
}

export const MissingImage: Story = {
  name: '圖片載入失敗',
  args: {
    images: [{ src: '/images/exercise-guides/relaxation/example-missing.webp', alt: '示範圖', caption: '圖片載入失敗範例' }],
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('link', { name: '放大查看：示範圖' }))
    await canvas.findByText('圖片無法載入', { exact: true })
  },
}
