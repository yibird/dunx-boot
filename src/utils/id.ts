import hyperid from 'hyperid'

const generateShortId = hyperid({ urlSafe: true, maxInt: 1 })

export class IdUtils {
  /**
   * 生成一个 RFC-4122 v4 UUID
   *
   * @returns 36 位标准 UUID 字符串
   */
  static uuid() {
    return crypto.randomUUID()
  }

  /**
   * 生成一个简短、URL 安全的唯一 id
   *
   * 基于高性能开源库 [hyperid](https://github.com/mcollina/hyperid) 实现。
   * 每次生成后轮换随机 UUID，避免连续 id 可预测，适用于验证码等公开标识。
   *
   * @returns URL 安全的唯一 id
   */
  static shortId(options?: hyperid.Options): string {
    if (!options) return generateShortId()
    return hyperid({
      urlSafe: true,
      ...options,
    })()
  }
}
