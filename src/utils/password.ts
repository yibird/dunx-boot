import type { Password } from 'bun'

/**
 * 密码散列与比较工具类
 */
export class PasswordUtils {
  private constructor() {}

  /**
   * 使用安全配置指定的算法散列密码。
   *
   * @param password 明文密码
   * @return 密码散列值
   */
  static hash(
    password: string,
    algorithm:
      | Password.AlgorithmLabel
      | Password.Argon2Algorithm
      | Password.BCryptAlgorithm = 'argon2id'
  ) {
    return Bun.password.hash(password, algorithm)
  }

  /**
   * 比较明文密码与已存储的散列值。比较时由 Bun 从散列值识别算法，确保切换配置后仍可校验旧密码。
   *
   * @param password 明文密码
   * @param hash 已存储的密码散列值
   * @return 密码匹配时返回 true
   */
  static async verify(password: string, hash: string) {
    try {
      return await Bun.password.verify(password, hash)
    } catch {
      return false
    }
  }
}
