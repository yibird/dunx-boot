/**
 * 字符串工具
 *
 * 与请求/响应无关的字符串处理都放这里；`WebUtils` 只负责从 `Request` /
 * `Response` 上读东西，不再兼任通用字符串操作。
 */
export class StringUtils {
  /**
   * 按目标长度截断字符串。
   *
   * @param value 原始值
   * @param max 最大长度（列宽、报文阈值等）
   * @return 截断后的值；空值返回 undefined
   */
  static truncate(value: string | null | undefined, max: number) {
    if (!value) return undefined
    return value.length > max ? value.slice(0, max) : value
  }
}
