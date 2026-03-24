import { mkdir, writeFile, readFile } from 'fs/promises'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

export interface ScreenshotResult {
  match: boolean
  diffRatio: number
  diffImage?: Buffer
}

export class ScreenshotComparator {
  private baselineDir: string
  private outputDir: string

  constructor(baselineDir: string, outputDir: string) {
    this.baselineDir = baselineDir
    this.outputDir = outputDir
  }

  async compare(
    name: string,
    actual: Buffer,
    threshold: number = 0.01
  ): Promise<ScreenshotResult> {
    await mkdir(this.baselineDir, { recursive: true })
    await mkdir(this.outputDir, { recursive: true })

    const baselinePath = `${this.baselineDir}/${name}.png`
    const diffPath = `${this.outputDir}/${name}-diff.png`

    try {
      const baseline = await readFile(baselinePath)
      return await this.doCompare(baseline, actual, diffPath, threshold)
    } catch {
      // First run - create baseline
      await writeFile(baselinePath, actual)
      return { match: true, diffRatio: 0 }
    }
  }

  private async doCompare(
    baseline: Buffer,
    actual: Buffer,
    diffPath: string,
    threshold: number
  ): Promise<ScreenshotResult> {
    const baselinePng = PNG.sync.read(baseline)
    const actualPng = PNG.sync.read(actual)

    const { width, height } = baselinePng
    const diff = new PNG(width, height)

    const numDiffPixels = pixelmatch(
      baselinePng.data,
      actualPng.data,
      diff.data,
      width,
      height,
      { threshold: 0.1, diffColor: [255, 0, 0] }
    )

    const diffRatio = numDiffPixels / (width * height)
    const match = diffRatio <= threshold

    if (!match) {
      await writeFile(diffPath, PNG.sync.write(diff))
    }

    return {
      match,
      diffRatio,
      diffImage: match ? undefined : PNG.sync.write(diff),
    }
  }

  async updateBaseline(name: string, image: Buffer): Promise<void> {
    await writeFile(`${this.baselineDir}/${name}.png`, image)
  }
}
