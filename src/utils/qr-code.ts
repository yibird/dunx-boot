import qrCode, { type QRCodeRenderersOptions } from 'qrcode'

const FORMAT = {
  SVG: 'svg',
  PNG: 'png',
}

/**
 * 二维码图片选项，默认生成 SVG，也可选择 PNG。
 */
export interface QRCodeImageOptions extends QRCodeRenderersOptions {
  /**
   * 图片格式，默认 svg。
   */
  format?: (typeof FORMAT)[keyof typeof FORMAT]
}

/**
 * 二维码静态工具类
 */
export class QRCodeUtils {
  private constructor() {}

  /**
   * 生成 SVG 文本，适用于矢量图片展示或下载。
   *
   * @param text 二维码文本
   * @param options 二维码图片选项
   * @returns SVG 文本
   */
  static toSvg(text: string, options: QRCodeRenderersOptions = {}) {
    return qrCode.toString(text, { ...options, type: 'svg' })
  }

  /**
   * 生成图片字节，默认 SVG；format 为 png 时返回 PNG 字节。
   *
   * @param text 二维码文本
   * @param options 二维码图片选项
   * @param options.format 图片格式，默认 svg
   * @returns 图片字节
   */
  static async toBuffer(text: string, options: QRCodeImageOptions = {}) {
    const { format = 'svg', ...renderOptions } = options
    if (format === FORMAT.PNG) {
      return qrCode.toBuffer(text, { ...renderOptions, type: 'png' })
    }
    return Buffer.from(await QRCodeUtils.toSvg(text, renderOptions), 'utf8')
  }

  /**
   * 生成 base64 data URL，可直接用于图片预览；默认 SVG，也支持 PNG
   *
   * @param text 二维码文本
   * @param options 二维码图片选项
   * @returns base64 data URL
   */
  static async toDataUrl(text: string, options: QRCodeImageOptions = {}) {
    const buffer = await QRCodeUtils.toBuffer(text, options)
    const mimeType =
      options.format === FORMAT.PNG ? 'image/png' : 'image/svg+xml'
    return `data:${mimeType};base64,${buffer.toString('base64')}`
  }
}
