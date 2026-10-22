# dunx-boot

[English](README.md) | [中文](README.zh-CN.md)

一个由 `bunx @dunx/create-app` 脚手架生成的 [dunx](https://github.com/petarzarkov/dunx)
应用：Bun + PostgreSQL（drizzle）+ zod。基础设施在 `src/infra`，业务模块在
`src/features`，表结构在 `src/schemas/schema`。

```bash
bun install
bun run dev         # http://localhost:3000，改文件自动重启
bun run start
bun test
bun run typecheck   # bun check
bunx oxlint         # 静态检查
bunx oxfmt          # 格式化
```

lint 与格式化分别由根目录的 `.oxlintrc.json` 和 `.oxfmtrc.json` 配置。

## 功能模块

- **`src/features/sys`** - 认证、用户、角色、部门、岗位、菜单、租户、字典，
  登录/操作/验证码/请求日志，系统消息、通知公告、通用任务
- **`src/features/ai`** - 模型供应商与模型、Agent、Chat、技能、提示词；
  工作流（workflow/version/node/edge/run/api/api-key/credential 等）的表结构在
  `src/schemas/schema/ai/workflow`
- **`src/features/pm`** - 项目、项目成员、任务、标签、评论、附件、任务动态
- **`src/features/infra`** - 文件、运行时指标

## 服务依赖

Postgres 与 Redis 在启动时都不是必需的：每个消费者只降级，不会让启动失败。
用 `bun run db:up`（docker compose）启动，`bun run db:down` 停止。

- Redis 缺失时：应用缓存 miss、限流放行、队列只在本地发布、WebSocket relay
  留在本地、Redis 健康检查按非关键处理
- 没有 Postgres 也能启动，连接池在首次查询时才连接；启动阶段只校验
  `DATABASE_URL` 的形态（非 postgres 协议是启动错误，而不是首个请求 500），
  数据库不可达时 readiness 返回 503

## 数据库

Schema 在 `src/schemas/schema/**`，迁移在 `drizzle/`。

```bash
bun run db:generate   # 从 schema 生成 SQL
bun run db:migrate    # 应用迁移
bun run db:seed       # 把 sql/sys.sql 应用到 dunx-boot（可重复执行）
bun run db:studio     # drizzle studio
```

`sql/ai.sql` 是 AI 模块的开发示例数据，需手工执行，不包含在 `db:seed` 里。

`config/application-dev.ts` 与 `config/application-prod.ts` 从 `.env` 读取
`DATABASE_URL`；开发覆盖层回退到本地
`postgresql://postgres:123456@127.0.0.1:5432/dunx-boot?search_path=public`，
生产覆盖层不提供回退。

多租户：使用 `commonColumns` 的表都有 `tenant_id`，非空且默认 `1`（默认租户）。
没有会话的写入口（注册、种子、定时任务、审计日志）都归到默认租户；
`getTenantId()` 在无会话时同样返回默认租户。

`db:generate` 遇到「列改名还是新增」的歧义时会要求 `--hints`，并按
`{"type":"rename","kind":"column","from":[...],"to":[...]}` 或
`{"type":"create","kind":"column","entity":[...]}` 区分；不指定时视为删旧列 + 加新列。

## 开发登录

在 `APP_ENV=dev` 或 `APP_ENV=test` 下，可以不传请求体直接获得登录会话：

```bash
curl -X POST http://localhost:3000/api/auth/devLogin
```

端点会在内部生成并消费图形验证码，然后用 `sql/sys.sql` 里的初始账号
`admin` / `123456` 走正常登录。数据库里必须存在该启用账号及其初始密码。
响应是标准 `Api` 信封，包含 `data.accessToken`、`data.refreshToken` 与
`data.user`；调试其他接口时带上 `Authorization: Bearer <accessToken>`。

生产环境中 `@Controller` 会把 `devLogin` 从路由和 OpenAPI 中排除，服务层也会
拒绝直接调用。正常验证码接口仍然只返回验证码 ID 与图片。

## 链路追踪

链路追踪遵循 [dunx 的 OpenTelemetry 指南](https://dunx.win/guide/tracing)。
在 `.env` 或部署环境里填完整的 OTLP/HTTP traces 地址后重启：

```dotenv
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://127.0.0.1:4318/v1/traces
```

地址要指向接受 OTLP/HTTP JSON 的 OpenTelemetry Collector、Jaeger 或 Tempo
HTTP receiver；这是后端接收地址，不是 UI 地址，也不是 OTLP/gRPC 的 4317 端口。
本应用不会启动 collector。

没有配置地址时 SDK 保持关闭，应用使用 `NoopTracer`；应用与测试都不需要
collector。`config/application.ts` 或环境覆盖层里的 `tracing.enabled: false`
会在配置了地址时也显式关闭追踪。`tracing.sampleRatio` 控制新 trace 的采样率
（0–1，默认 1），上游的采样决定会被尊重；`tracing.exportTimeoutMs` 限制每批导出
的超时（默认 2000ms）。

`AppTracingModule` 与 `OtelModule` 使用同一套 `Tracer` → `OtelTracer` 绑定，
并显式保证 SDK 在构造 tracer 之前完成注册，配置仍来自应用唯一的
`ConfigModule`。资源属性包含 `application.name`、`application.version` 和
`APP_ENV`。请求、出站 `HttpService` 调用、Drizzle SQL、Redis 命令以及 BullMQ
的发布/消费都使用框架的 span 与 W3C 传播。数据库适配器保留惰性连接、relations
和查询缓存。请求日志与 `traceresponse` 会和记录的服务端 span 关联；仪表盘路径
仍被现有请求日志配置排除。

SDK 批量导出，并在 `app.shutdown()` 时冲刷队列中的 span。同进程内配置相同的
应用共享 SDK，最后一次 shutdown 释放全局注册。`createApp()` 在应用创建失败时
也会释放追踪。collector 不可用不会阻塞启动或请求处理，导出尝试受配置的超时
限制。

业务 span 注入框架的 `Tracer` 后包住操作即可：

```ts
import { Tracer } from '@dunx/core'

export class ExampleService {
  constructor(private readonly tracer: Tracer) {}

  execute() {
    return this.tracer.span('example.execute', {}, async () => {
      // 业务逻辑；嵌套的 HTTP/SQL span 会继承这个上下文。
    })
  }
}
```

保持只有一份 `@opentelemetry/api`（`bun why @opentelemetry/api`），
`overrides` 会把传递依赖固定到应用版本。不要在同一进程里再注册一个 SDK；
使用进程隔离的队列 worker 需要在该进程内单独初始化追踪并完成模块绑定。

## 已接入能力

- **config** - 文件式配置：`config/application.ts` 只放默认值且不读任何环境
  变量，`config/application-<APP_ENV>.ts` 只写该环境不同的项，`.env` 只承载
  密钥与机器绑定地址（`DATABASE_URL`、`REDIS_URL`、`AUTH_SECRET`、
  `CORS_ORIGIN`、`PUBLIC_URL`、`OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`）。
  框架在启动时读取并用 zod 校验合并后的文件。未知 `APP_ENV` 和短于 32 字符的
  `auth.secret` 都是启动错误；schema 里的每个旋钮都必须真的被某个模块读取，
  不能留死配置。只在非生产使用的配置（如 `openapi.tagGroups`）放在开发覆盖层。
- **http** - CORS（配置了 `origin` 才挂载）、请求日志（默认不记录 body，
  需要时在环境覆盖层打开）、gzip 压缩、统一 `Api` 错误信封
  （`AppErrorFilter`）与 `Api`/`Pager` 响应。成功响应 `code` 为 `0`，
  失败响应 `code` 为对应 HTTP 状态码（400/401/403/404/500）。
- **auth** - JWT access/refresh token（HS256，`algorithms` 固定）、验证码、
  注册/登录/刷新/登出、全局会话中间件与 `sessionContext`，以及基于 SSE 与
  WebSocket 的轮换扫码登录。除 `@Public()`
  路由和 `security.auth.whiteList` 外，所有环境都要求认证。白名单只接受普通
  绝对路径：`/api/docs` 匹配自身及其后代，不匹配 `/api/docsx`；通配符会被拒绝。
  默认只放开文档与 OpenAPI 文档；`/api/auth/me` 与 `/api/auth/logout` 需要
  有效的 bearer token。授权元数据由 `@Permission` 声明（Spring Security 风格），
  权限码来自角色-菜单；注意 `PermissionGuard` 目前未挂到全局中间件，
  `@Permission` 只写元数据、尚未实际拦截。
- **crud** - `CrudRepository` / `CrudService` + `CrudController` 工厂：
  `CrudController({ service, prefix, modelName, schema: { response, create, update, query }, includes?, excludes?, tags? })`
  生成九个静态端点（`getList` / `getPageList` / `getRecord` / `create` /
  `createMany` / `update` / `updateMany` / `delete` / `deleteMany`），没有路径
  参数，id 走 `query` 或 `body`。域内额外端点直接写在子类里，通过继承来的
  `this.service` 调用；只读域用
  `includes: [CRUD_ENDPOINT.GET_PAGE_LIST, CRUD_ENDPOINT.GET_RECORD]`。
  软删除、乐观锁（更新入参必须带 `version`，缺失会直接报错）、审计填充、
  多租户作用域（租户总能解析，默认租户 `1`）与查询缓存都由仓储提供。
- **database** - `Bun.SQL` 之上的 drizzle，`AppDbModule` 背后的
  `drizzle-uncache` 查询缓存，连接池在 shutdown 时关闭（`DbLifecycle`）。
- **cache** - L1 内存 + L2 Redis，可降级；`cache.local.enabled: false` 时只剩
  Redis，查询缓存复用 `redis.url`，不需要第二套连接串。
- **queue / events / resilience / client** - bullmq 发布端（`queue.consume`
  默认 `false`，`'if-any'` 表示图里有 `@JobHandler` 才消费）、进程内事件总线、
  超时+重试策略、出站 `HttpService`（默认不重试，避免 POST 被偷偷重放）。
- **files / images / email** - 本地磁盘存储、图片管线（25MP / 6000px 上限）、
  邮件默认走日志传输并受配置超时约束。
- **health** - `/api/health/live`（内存上限是关键的：超出会请求重启进程）与
  `/api/health/ready`。
- **throttle** - 固定窗口限流，基于 Redis；已认证用户按用户计数，否则按客户端
  地址。
- **schedule** - `@Cron` / `@Interval` / `@OnceOnBoot`。
- **openapi** - 从路由 schema 生成 OpenAPI 3.1，非生产环境在 `/api/docs`
  提供 Scalar 文档页；标签层级由 `config/application-dev.ts` 的
  `openapi.tagGroups` 声明（3.1 输出为 `x-tagGroups`）。operation 的 `tags`
  只写叶子标签，未归组的标签会被 Scalar/Redoc 隐藏。
- **dashboard** - `/_dunx` 运维面板，在 `src/middleware/index.ts` 里注册在
  会话守卫之前。

## 编译为可执行文件

```bash
bun run build   # -> dist/dunx-boot(.exe) + 一份 config/
```

`scripts/build.ts` 把 `@dunx/transform` 插件与 `compile` 一起交给 `Bun.build`，
容器需要的构造器依赖记录会被打进可执行文件。这需要 Bun >= 1.4.1（更早的版本
会丢掉这些记录）。

可执行文件从 `<cwd>/config` 读取配置，构建时已复制到 `dist/config`，所以
`cd dist && ./dunx-boot` 就是一次完整部署。请在**没有**本应用 `bunfig.toml`
的目录下运行：独立 bun 可执行文件仍会读取当前工作目录的 `preload`，从而尝试
加载二进制已经不需要、也无法解析的 `@dunx/transform/preload`。

## 构造器注入

`bunfig.toml` 预加载 `@dunx/transform`，它在加载时记录每个类的构造参数类型，
容器才能解析依赖。没有这一行，provider 会以无参方式构造，启动时报错。
