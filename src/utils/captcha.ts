export interface CaptchaOptions {
  /**
   * 验证码字符数，默认 4。
   */
  length?: number
  /**
   * 图片宽度（像素），默认 180。
   */
  width?: number
  /**
   * 图片高度（像素），默认 56。
   */
  height?: number
  /**
   * 字符取值集合，默认去除了易混淆字符（0/O、1/I/l 等）。
   */
  charset?: string
  /**
   * 干扰线数量，默认 4。
   */
  noiseLines?: number
}

export interface CaptchaResult {
  /**
   * 验证码答案文本，需服务端保存以供后续比对。
   */
  text: string
  /**
   * SVG 图片的 base64 data URL。
   */
  dataUrl: string
  /**
   * SVG 图片原始字节。
   */
  buffer: Buffer
}
type SvgCaptcha = typeof import('svg-captcha')

const DEFAULT_CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
let svgCaptchaPromise: Promise<SvgCaptcha> | undefined

/**
 * 图形验证码工具类。
 *
 * 提供验证码生成、校验、随机文本生成及依赖预热功能。
 */
export class CaptchaUtils {
  private constructor() {}

  /**
   * 预热验证码生成依赖,提前加载 `svg-captcha`，避免首次生成验证码时产生模块加载开销。
   *
   * @returns 依赖加载完成的 Promise
   */
  static async preload() {
    await this.loadSvgCaptcha()
  }

  /**
   * 生成图形验证码。
   *
   * @param options 验证码生成选项
   * @param options.length 验证码字符数，默认 4
   * @param options.width 图片宽度(像素),默认 180
   * @param options.height 图片高度(像素),默认 56
   * @param options.charset 验证码字符集，默认使用去除易混淆字符的字符集
   * @param options.noiseLines 干扰线数量，默认 4
   * @returns 包含验证码文本、SVG Data URL 和 SVG 字节的结果
   */
  static async generate(options: CaptchaOptions = {}) {
    const svgCaptcha = await this.loadSvgCaptcha()
    const {
      length = 4,
      width = 180,
      height = 56,
      charset = DEFAULT_CHARSET,
      noiseLines = 4,
    } = options
    if (length <= 0) {
      throw new RangeError('Captcha length must be greater than 0')
    }
    if (width <= 0 || height <= 0) {
      throw new RangeError('Captcha width and height must be greater than 0')
    }
    if (!charset) {
      throw new RangeError('Captcha charset must not be empty')
    }
    const { text, data } = svgCaptcha.create({
      size: length,
      width,
      height,
      charPreset: charset,
      noise: noiseLines,
      color: true,
      background: '#f8fafc',
    })
    const buffer = Buffer.from(data, 'utf8')
    const dataUrl = `data:image/svg+xml;base64,${buffer.toString('base64')}`
    return {
      text,
      dataUrl,
      buffer,
    }
  }

  /**
   * 校验验证码(默认忽略首尾空白和大小写)
   *
   * @param input 用户输入的验证码
   * @param answer 服务端保存的正确答案
   * @param caseSensitive 是否区分大小写，默认 false
   * @returns 验证码是否匹配
   */
  static verify(input: string, answer: string, caseSensitive = false) {
    if (!input || !answer) return false
    const a = input.trim()
    const b = answer.trim()
    return caseSensitive ? a === b : a.toLowerCase() === b.toLowerCase()
  }

  /**
   * 生成指定长度的随机验证码文本。
   *
   * @param length 验证码长度
   * @param charset 验证码字符集，默认使用去除易混淆字符的字符集
   * @returns 随机验证码文本
   */
  static randomText(length: number, charset = DEFAULT_CHARSET) {
    if (length <= 0 || !charset) return ''
    const bytes = new Uint32Array(length)
    crypto.getRandomValues(bytes)
    let text = ''
    for (let i = 0; i < length; i++) {
      text += charset[bytes[i]! % charset.length]
    }
    return text
  }

  /**
   * 加载并缓存 `svg-captcha` 模块,使用 Promise 缓存避免重复加载模块。
   *
   * @returns `svg-captcha` 模块
   */
  private static async loadSvgCaptcha() {
    svgCaptchaPromise ??= import('svg-captcha')
    return svgCaptchaPromise
  }
}
