import { createAvatar, type StyleOptions } from '@dicebear/core'
import { avataaars } from '@dicebear/collection'

/**
 * 头像生成选项，支持尺寸、背景色及 avataaars 外观配置。
 */
export type AvatarOptions = Omit<StyleOptions<avataaars.Options>, 'seed'>

/**
 * 头像静态工具类。
 */
export class AvatarUtils {
  private constructor() {}

  /**
   * 本地生成 SVG Data URL，同一 seed 和配置生成相同头像。
   *
   * @param seed 头像种子，默认随机生成
   * @param options 头像生成选项，默认尺寸为 128 像素
   * @returns 可直接用作图片 src 的 SVG Data URL
   */
  static generate(
    seed: string = crypto.randomUUID(),
    options: AvatarOptions = {}
  ): string {
    return createAvatar(avataaars, { size: 128, ...options, seed }).toDataUri()
  }
}
