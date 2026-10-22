import { HTTP_HEADER } from '@/constants'
import type IP2Region from 'ip2region'
import type { IP2RegionResult } from 'ip2region'

/**
 * 地理位置查询结果，由 ip2region 归一化而来。字段为空字符串表示该层级“未知”。
 */
export interface IpRegion {
  country: string
  province: string
  city: string
  isp: string
}

/** IPv4 点分四段格式，例如 `192.168.0.1`。 */
const IPV4_RE =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/

/**
 * IP 地址工具集。
 *
 * 集成了校验、数值转换、网络分类、地理位置查询
 * （通过 {@link https://github.com/yourtion/node-ip2region ip2region}）以及
 * 从请求中提取客户端 IP 的功能。所有方法均为静态方法；底层的
 * ip2region 数据库在首次进行地理位置查询时才会惰性加载，因此在未使用
 * 地理位置功能时应用启动不会有额外开销。
 */
export class IpUtils {
  private constructor() {}
  static #query: IP2Region | null = null
  static #getQuery() {
    if (!IpUtils.#query) {
      const { default: IP2Region } =
        require('ip2region') as typeof import('ip2region')
      IpUtils.#query = new IP2Region()
    }
    return IpUtils.#query
  }

  /** 预热 ip2region 地理位置数据库，避免首个请求承担加载成本。 */
  static warmup() {
    IpUtils.#getQuery()
  }

  // --- 校验 -----------------------------------------------------------

  /**
   * 当 `ip` 是有效的 IPv4 点分四段格式时返回 true。
   *
   * @param ip 待校验的 IP 字符串
   * @return 当为有效 IPv4 时返回 true
   */
  static isIpv4(ip: string) {
    return IPV4_RE.test(ip)
  }

  /**
   * 当 `ip` 是（基本上）有效的 IPv6 地址时返回 true。
   * @param ip 待校验的 IP 字符串
   * @return 当为有效 IPv6 时返回 true
   */
  static isIpv6(ip: string) {
    if (typeof ip !== 'string' || ip.length < 2) return false
    // 此处拒绝 IPv4；显式处理 IPv4 映射地址（::ffff:1.2.3.4）。
    const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i)
    if (mapped) return IpUtils.isIpv4(mapped[1]!)
    if (!/^[0-9a-f:]+$/i.test(ip)) return false
    // 最多只允许一次 "::" 压缩。
    const doubleColon = ip.match(/::/g)
    if (doubleColon && doubleColon.length > 1) return false
    const groups = ip.split(':')
    if (groups.length > 8) return false
    if (!ip.includes('::') && groups.length !== 8) return false
    return groups.every((g) => g === '' || /^[0-9a-f]{1,4}$/i.test(g))
  }

  /**
   * 当 `ip` 是有效的 IPv4 或 IPv6 地址时返回 true。
   *
   * @param ip 待校验的 IP 字符串
   * @return 当为有效 IPv4 或 IPv6 时返回 true
   */
  static isValid(ip: string) {
    return IpUtils.isIpv4(ip) || IpUtils.isIpv6(ip)
  }

  // --- 转换（IPv4） ----------------------------------------------------

  /**
   * 将 IPv4 字符串转换为其无符号 32 位整数形式。输入无效时返回 `null`。
   *
   * @param ip IPv4 字符串
   * @return 无符号 32 位整数，输入无效时返回 `null`
   */
  static ipv4ToLong(ip: string) {
    if (!IpUtils.isIpv4(ip)) return null
    return (
      ip.split('.').reduce((acc, part) => acc * 256 + Number(part), 0) >>> 0
    )
  }

  /**
   * 将无符号 32 位整数还原为 IPv4 字符串。
   *
   * @param long 无符号 32 位整数
   * @return 对应的 IPv4 点分四段字符串
   */
  static longToIpv4(long: number) {
    const n = long >>> 0
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(
      '.'
    )
  }

  // --- 网络分类（IPv4） ---------------------------------------

  /**
   * 当地址为 IPv4/IPv6 回环地址时返回 true。
   * @param ip 待判断的 IP 字符串
   * @return 当为回环地址时返回 true
   */
  static isLoopback(ip: string) {
    if (ip === '::1') return true
    const long = IpUtils.ipv4ToLong(ip)
    if (long === null) return false
    return long >>> 24 === 127
  }

  /**
   * 当 `ip` 处于私有/保留地址范围时返回 true（RFC 1918 + 链路本地地址 +
   * IPv6 唯一本地地址 + 回环地址）。可用于判断是否信任某个地址或对其进行
   * 地理位置查询。
   * @param ip 待判断的 IP 字符串
   * @return 当处于私有/保留地址范围时返回 true
   */
  static isPrivate(ip: string) {
    if (IpUtils.isLoopback(ip)) return true

    // IPv6 唯一本地地址（fc00::/7）和链路本地地址（fe80::/10）。
    const lower = ip.toLowerCase()
    if (
      lower.startsWith('fc') ||
      lower.startsWith('fd') ||
      lower.startsWith('fe8') ||
      lower.startsWith('fe9') ||
      lower.startsWith('fea') ||
      lower.startsWith('feb')
    ) {
      return IpUtils.isIpv6(ip)
    }

    const long = IpUtils.ipv4ToLong(ip)
    if (long === null) return false
    const a = (long >>> 24) & 255
    const b = (long >>> 16) & 255
    // 10.0.0.0/8
    if (a === 10) return true
    // 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) return true
    // 192.168.0.0/16
    if (a === 192 && b === 168) return true
    // 169.254.0.0/16（链路本地地址）
    if (a === 169 && b === 254) return true
    return false
  }

  /**
   * 当 `ip` 是有效且可公网路由的地址时返回 true。
   * @param ip 待判断的 IP 字符串
   * @return 当为有效且可公网路由的地址时返回 true
   */
  static isPublic(ip: string) {
    return IpUtils.isValid(ip) && !IpUtils.isPrivate(ip)
  }

  // --- 地理位置查询 -----------------------------------------------------------

  /**
   * 解析 IP 的地理区域。对于无效地址或私有地址（无有意义的地理位置）返回
   * `null`。country/province/city/isp 字段在未知时可能为空字符串。
   * @param ip 待查询的 IP 字符串
   * @return 归一化的地理区域信息，无有意义地理位置时返回 `null`
   */
  static lookup(ip: string) {
    if (!IpUtils.isValid(ip) || IpUtils.isPrivate(ip)) return null
    const result: IP2RegionResult | null = IpUtils.#getQuery().search(ip)
    if (!result) return null
    return {
      country: result.country ?? '',
      province: result.province ?? '',
      city: result.city ?? '',
      isp: result.isp ?? '',
    }
  }

  /**
   * 人类可读的位置字符串，例如 `"中国 江苏省 南京市"`。
   * 当没有可用的区域信息时返回空字符串。
   * @param ip 待描述的 IP 字符串
   * @return 人类可读的位置字符串，无区域信息时返回空字符串
   */
  static describe(ip: string) {
    const region = IpUtils.lookup(ip)
    if (!region) return ''
    return [region.country, region.province, region.city, region.isp]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(' ')
  }

  // --- 请求辅助工具 ------------------------------------------------------

  /**
   * 从代理请求头中提取最可能的客户端 IP，若无则回退到提供的远端地址。
   * 优先采用 `x-forwarded-for` 中最左侧的条目（即原始客户端），其次是
   * `x-real-ip`。
   *
   * 注意：这些请求头可由客户端控制；仅在处于你所控制、且会覆写/归一化
   * 这些请求头的代理之后时才应信任它们。
   * @param headers 请求头对象或普通键值映射
   * @param fallback 请求头缺失时使用的回退远端地址
   * @return 最可能的客户端 IP，无法确定时返回 `null`
   */
  static fromHeaders(
    headers: Headers | Record<string, string | undefined>,
    fallback?: string
  ) {
    const get = (name: string): string | undefined =>
      headers instanceof Headers
        ? (headers.get(name) ?? undefined)
        : headers[name]

    const forwarded = get(HTTP_HEADER.FORWARDED_FOR)
    if (forwarded) {
      const first = forwarded.split(',')[0]?.trim()
      if (first) {
        const ip = IpUtils.#stripPort(first)
        if (IpUtils.isValid(ip)) return ip
      }
    }

    const real = get(HTTP_HEADER.REAL_IP)
    if (real) {
      const ip = IpUtils.#stripPort(real.trim())
      if (IpUtils.isValid(ip)) return ip
    }

    if (fallback) {
      const ip = IpUtils.#stripPort(fallback)
      if (IpUtils.isValid(ip)) return ip
    }
    return null
  }

  /**
   * 去除 IPv4 地址中可选的 `:port` 后缀（IPv6 保持不变）。
   * @param ip 可能带有 `:port` 后缀的 IP 字符串
   * @return 去除端口后的 IP 字符串
   */
  static #stripPort(ip: string) {
    // 仅当恰好只有一个冒号时才去除（IPv4:port）；IPv6 含有多个冒号。
    const parts = ip.split(':')
    if (parts.length === 2) return parts[0]!
    return ip
  }
}
