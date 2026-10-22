import { resolve } from 'node:path'

/**
 * 配置文件目录，默认进程工作目录下的 `config`。
 *
 * `CONFIG_DIR` 只有 `src/infra/config` 读得到：它是配置层的自举参数，
 * 不属于任何一层配置；绝对路径与相对路径都可以。
 */
export const CONFIG_DIR = resolve(process.cwd(), Bun.env.CONFIG_DIR ?? 'config')

/**
 * 配置文件扩展名；换格式改这一行。
 */
export const CONFIG_EXTENSION = '.ts'
