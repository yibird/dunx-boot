# Benchmark

性能基准与压测相关脚本，与 `test/` 下的正确性测试分离。

## 目录

```text
benchmark/
├── db/          # 数据库 / ORM / 仓储微基准
└── README.md
```

压测（HTTP 吞吐）后续放 `perf/`，使用 k6 或 autocannon，不建议用 `bun test` 运行。

## 运行数据库基准

前置条件：

1. PostgreSQL 已启动，`.env` 中配置了 `DATABASE_URL`。
2. 已执行建表与种子脚本：

```bash
bunx drizzle-kit push
# 或者使用已有迁移

bun -e "const sql=new Bun.SQL(process.env.DATABASE_URL,{max:1}); await sql.file('sql/sys.sql'); await sql.file('sql/ai.sql'); await sql.close()"
```

执行基准：

```bash
bun run bench
```

## 约定

- 基准文件以 `*.bench.ts` 命名。
- 数据依赖固定种子，不使用随机规模。
- 基准前保留 warmup，结论以多轮中位数/分位数为准。
- 结果文件放 `benchmark/results/`（已 gitignore）。
