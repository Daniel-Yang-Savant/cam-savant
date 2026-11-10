import { expect, patientAccessCode, test } from './fixture'

test('patient access unlocks the postoperative gallery and each image keeps its guidance', async ({ page }) => {
  const articlePath = '/perioperative-rehab/tkr-rehab'
  await page.goto(articlePath)
  await expect(page).toHaveURL('/perioperative-rehab/locked')
  await expect(page.getByRole('heading', { name: '此頁面僅供就診患者閱覽' })).toBeVisible()

  const grant = new URLSearchParams({ token: patientAccessCode })
  await page.goto(`/perioperative-rehab/access?${grant}`)
  await expect(page).toHaveURL('/perioperative-rehab')

  await page.goto(articlePath)
  await expect(page).toHaveURL(articlePath)
  const thumbnail = page.getByRole('link', { name: /放大查看.*股四頭肌等長收縮/ })
  await thumbnail.click()

  const gallery = page.getByRole('dialog', { name: '圖解檢視' })
  await expect(gallery.getByText('適用：急性保護期')).toBeVisible()
  await expect(gallery.getByText(/將膝窩輕壓向下/)).toBeVisible()
  await gallery.getByRole('button', { name: '下一張' }).click()
  await expect(gallery.getByText('適用：術後早期活動度訓練')).toBeVisible()
  await expect(gallery.getByText(/腳跟沿床面緩慢滑向臀部/)).toBeVisible()

  await gallery.getByRole('button', { name: '關閉' }).click()
  await expect(gallery).toBeHidden()
  await expect(thumbnail).toBeFocused()
})
