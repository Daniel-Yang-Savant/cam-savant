import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const COVERS_DIRECTORY = path.join(process.cwd(), 'public', 'images', 'covers')
const TARGET_WIDTH = 1792
const TARGET_HEIGHT = 1024
const MAX_FILE_SIZE = 2 * 1024 * 1024

async function optimizeCover(filePath: string): Promise<boolean> {
  const metadata = await sharp(filePath).metadata()
  const fileSize = fs.statSync(filePath).size
  const needsOptimization =
    metadata.format !== 'jpeg' ||
    fileSize > MAX_FILE_SIZE ||
    (metadata.width ?? 0) > TARGET_WIDTH ||
    (metadata.height ?? 0) > TARGET_HEIGHT

  if (!needsOptimization) return false

  const temporaryPath = `${filePath}.${process.pid}.tmp.jpg`

  try {
    await sharp(filePath)
      .rotate()
      .flatten({ background: '#0a0a0a' })
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: 'cover',
        position: 'attention',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 90, progressive: true, mozjpeg: true })
      .toFile(temporaryPath)

    fs.renameSync(temporaryPath, filePath)
    return true
  } catch (error) {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath)
    throw error
  }
}

async function main() {
  const requestedFiles = process.argv.slice(2)
  const fileNames = requestedFiles.length
    ? requestedFiles
    : fs
        .readdirSync(COVERS_DIRECTORY)
        .filter((fileName) => /\.jpe?g$/i.test(fileName))

  let optimized = 0

  for (const fileName of fileNames) {
    const filePath = path.isAbsolute(fileName)
      ? fileName
      : path.join(COVERS_DIRECTORY, fileName)

    if (!fs.existsSync(filePath)) {
      throw new Error(`找不到封面圖片：${filePath}`)
    }

    if (await optimizeCover(filePath)) {
      optimized += 1
      const sizeKb = Math.round(fs.statSync(filePath).size / 1024)
      console.log(`✓ ${path.basename(filePath)} → JPEG ${sizeKb} KB`)
    }
  }

  console.log(`✓ 封面圖片處理完成：更新 ${optimized} 張`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
