import type { CDPSession, Locator } from '@playwright/test'
import { expect, test } from './fixture'

async function swipe(session: CDPSession, target: Locator, direction: 'left' | 'right') {
  const bounds = await target.boundingBox()
  if (!bounds) throw new Error('The swipe target must be visible')

  const center = bounds.x + bounds.width / 2
  const y = Math.round(bounds.y + bounds.height / 2)
  const offset = Math.min(bounds.width / 3, 100) * (direction === 'left' ? 1 : -1)
  const startX = center + offset
  const endX = center - offset
  const steps = 6
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: Math.round(startX), y }],
  })
  for (let step = 1; step <= steps; step++) {
    const x = Math.round(startX + (endX - startX) * step / steps)
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] })
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}

test('keyboard navigation returns focus to the original thumbnail', async ({ page }) => {
  await page.goto('/exercise-guides/low-back-strength')
  const thumbnail = page.getByRole('link', { name: /^放大查看：.*腳跟慢慢點地/ })
  const gallery = page.getByRole('dialog', { name: '圖解檢視' })
  await thumbnail.press('Enter')
  await expect(gallery.getByRole('img', { name: /腳跟慢慢點地/ })).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(gallery.getByRole('img', { name: /鳥狗式/ })).toBeVisible()
  await page.keyboard.press('ArrowLeft')
  await expect(gallery.getByRole('img', { name: /腳跟慢慢點地/ })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(gallery).toBeHidden()
  await expect(thumbnail).toBeFocused()
})

test.describe('mobile touch gallery', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

  test('swipes between images and pans a zoomed image without changing slides', async ({ page, context }) => {
    await page.goto('/exercise-guides/neck-shoulder-reset')
    const thumbnail = page.getByRole('link', { name: /^放大查看：.*慢慢轉頭/ })
    const gallery = page.getByRole('dialog', { name: '圖解檢視' })
    const first = gallery.getByRole('img', { name: /慢慢轉頭/ })
    const second = gallery.getByRole('img', { name: /輕輕側傾/ })
    const zoom = gallery.getByRole('button', { name: '放大 2 倍' })

    await thumbnail.tap()
    await expect(first).toBeVisible()
    await expect(zoom).toBeEnabled()

    // Browser touch events exercise native scrolling as well as the gallery's swipe handler.
    const touch = await context.newCDPSession(page)
    await swipe(touch, first, 'left')
    await expect(second).toBeVisible()
    await expect(zoom).toBeEnabled()
    await swipe(touch, second, 'right')
    await expect(first).toBeVisible()
    await expect(zoom).toBeEnabled()

    const fitWidth = await first.evaluate((image) => image.getBoundingClientRect().width)
    await zoom.tap()
    const stage = gallery.getByRole('region', { name: '已放大圖解，可捲動查看' })
    await expect(stage).toBeVisible()
    await expect.poll(async () => {
      const enlargedWidth = await first.evaluate((image) => image.getBoundingClientRect().width)
      return enlargedWidth / fitWidth
    }).toBeCloseTo(2, 1)
    await expect.poll(() => stage.evaluate((element) => element.scrollLeft)).toBe(0)
    await swipe(touch, stage, 'left')
    await expect.poll(() => stage.evaluate((element) => element.scrollLeft)).toBeGreaterThan(30)
    await expect(first).toBeVisible()

    await gallery.getByRole('button', { name: '還原大小' }).tap()
    await expect(stage).toBeHidden()
    await gallery.getByRole('button', { name: '關閉' }).tap()
    await expect(gallery).toBeHidden()
    await expect(thumbnail).toBeFocused()
  })
})
