import autocannon from 'autocannon'

/**
 * sys/role/getPageList 接口压测
 *
 * 前置条件：
 * - 服务已启动
 * - Redis / PostgreSQL 可用
 * - `sql/sys.sql` 已导入
 *
 * 运行：
 *   BASE_URL=http://localhost:3000 bun run load:role
 */
const baseUrl = Bun.env['BASE_URL'] ?? 'http://localhost:3000'
const connections = Number(Bun.env['CONNECTIONS'] ?? 50)
const duration = Number(Bun.env['DURATION'] ?? 15)

async function getToken() {
  const response = await fetch(`${baseUrl}/api/auth/devLogin`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  })
  const result = (await response.json()) as {
    data?: { accessToken?: string }
  }
  const token = result.data?.accessToken
  if (!token) {
    throw new Error(`devLogin 失败: HTTP ${response.status}`)
  }
  return token
}

const token = await getToken()
const url = `${baseUrl}/api/sys/role/getPageList?current=1&pageSize=20`

console.log(`压测目标: ${url}\n并发: ${connections}  时长: ${duration}s\n`)

const result = await autocannon({
  url,
  connections,
  duration,
  headers: {
    authorization: `Bearer ${token}`,
  },
})

const latency = result.latency
const requests = result.requests

console.log('| 指标 | 数值 |')
console.log('| --- | ---: |')
console.log(`| p2.5 | ${latency.p2_5} ms |`)
console.log(`| p50 | ${latency.p50} ms |`)
console.log(`| p97.5 | ${latency.p97_5} ms |`)
console.log(`| p99 | ${latency.p99} ms |`)
console.log(`| avg | ${latency.average} ms |`)
console.log(`| max | ${latency.max} ms |`)
console.log(`| RPS (avg) | ${requests.average.toFixed(0)} |`)
console.log(`| RPS (min/max) | ${requests.min} / ${requests.max} |`)
console.log(`| 2xx / non-2xx | ${result['2xx']} / ${result.non2xx} |`)
console.log(`| 错误数 | ${result.errors} |`)
console.log(`| 超时数 | ${result.timeouts} |`)
console.log(`| 总请求数 | ${(requests.total ?? 0).toLocaleString()} |`)
