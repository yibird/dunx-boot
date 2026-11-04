import { eq, like } from 'drizzle-orm'
import { bench, group, run } from 'mitata'
import { sessionContext, type SessionContext } from '@/infra/context'
import { createDb } from '@/infra/db/database/db'
import { CrudRepository } from '@/infra/crud'
import { SysRoleRepository } from '@/features/sys/role/repository'
import { SysRoleService } from '@/features/sys/role/service'
import { relations, sysRole } from '@/schemas'

/**
 * sys/role 查询基准
 *
 * 覆盖：
 * - 1 万行大表分页与 count
 * - 单行查询与业务服务查询
 *
 * 前置条件：`DATABASE_URL` 已配置，`sql/sys.sql` 已导入。
 * 运行：bun run bench
 */
const databaseUrl = Bun.env['DATABASE_URL']
if (!databaseUrl) {
  throw new Error('DATABASE_URL 未配置，无法运行数据库基准')
}

const actor: SessionContext = {
  userId: '1',
  account: 'admin',
  tenantId: '1',
}
const asActor = <T>(callback: () => T): T => sessionContext.run(actor, callback)

const prefix = `bench-${crypto.randomUUID().slice(0, 8)}-`
const BULK_ROWS = 10_000

const db = await createDb({ url: databaseUrl, drizzle: { relations } })

const repository = new CrudRepository(
  {
    table: sysRole,
    queryOptions: {},
  },
  db
)
const roleRepository = new SysRoleRepository(db)
const service = new SysRoleService(roleRepository)
const bulkWhere = like(sysRole.roleName, `${prefix}%`)

try {
  // 准备 1 万行基准数据
  const bulk = Array.from({ length: BULK_ROWS }, (_, index) => ({
    roleName: `${prefix}${index}`,
    tenantId: actor.tenantId!,
  }))
  for (let index = 0; index < bulk.length; index += 1000) {
    await db.insert(sysRole).values(bulk.slice(index, index + 1000))
  }
  console.log(`已写入 ${BULK_ROWS} 行基准数据（${prefix}）\n`)

  group('大表分页与 count（1 万行）', () => {
    bench('getPageList page=1 size=20', async () => {
      await asActor(() =>
        repository.getPageList(
          { current: 1, pageSize: 20 },
          { where: bulkWhere }
        )
      )
    })

    bench('getPageList page=100 size=20', async () => {
      await asActor(() =>
        repository.getPageList(
          { current: 100, pageSize: 20 },
          { where: bulkWhere }
        )
      )
    })

    bench('count（10k 过滤后）', async () => {
      await asActor(() => repository.count({ where: bulkWhere }))
    })
  })

  group('单行与业务条件', () => {
    bench('findById', async () => {
      await asActor(() => repository.findById('1'))
    })

    bench('Service.getPageList（含分页）', async () => {
      await asActor(() =>
        service.getPageList({ current: 1, pageSize: 20, roleName: '管理' })
      )
    })

    bench('原生 drizzle select by id（基线）', async () => {
      await db.select().from(sysRole).where(eq(sysRole.id, '1')).limit(1)
    })
  })

  const cpuStart = process.cpuUsage()
  const wallStart = performance.now()
  const { benchmarks, context } = await run({
    format: 'json',
    colors: false,
    print: () => {},
  })
  const cpu = process.cpuUsage(cpuStart)
  const wallMs = performance.now() - wallStart
  const cpuPercent = ((cpu.user + cpu.system) / 1000 / wallMs) * 100
  const rssMb = process.memoryUsage().rss / 1024 / 1024

  console.log(`runtime: ${context.runtime}`)
  console.log(`cpu: ${context.cpu.name} @ ${context.cpu.freq.toFixed(2)} GHz`)
  console.log(
    `进程 CPU 占用: ${cpuPercent.toFixed(1)}% (user+sys / wall)，RSS: ${rssMb.toFixed(1)} MB`
  )
  console.log(`总耗时: ${(wallMs / 1000).toFixed(2)} s\n`)

  console.log(
    '| 场景 | avg | p50 | p75 | p99 | max | 吞吐 (ops/s) | heap avg | heap max |'
  )
  console.log('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')

  for (const trial of benchmarks) {
    for (const result of trial.runs) {
      if (!result.stats) continue
      const s = result.stats
      const us = (ns: number) => `${(ns / 1000).toFixed(1)} µs`
      const ops = (1e9 / s.avg).toFixed(0)
      const heap = (bytes?: number) =>
        bytes === undefined ? '-' : `${(bytes / 1024).toFixed(0)} KB`
      console.log(
        `| ${result.name} | ${us(s.avg)} | ${us(s.p50)} | ${us(s.p75)} | ${us(
          s.p99
        )} | ${us(s.max)} | ${ops} | ${heap(s.heap?.avg)} | ${heap(s.heap?.max)} |`
      )
    }
  }
} finally {
  await db.delete(sysRole).where(bulkWhere)
  await db.$client.close()
}
