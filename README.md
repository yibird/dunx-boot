# dunx-boot

[English](README.md) | [中文](README.zh-CN.md)

A [dunx](https://github.com/petarzarkov/dunx) application scaffolded with
`bunx @dunx/create-app`: Bun, PostgreSQL (drizzle) and zod, with the
infrastructure wired in `src/infra` and the business modules under
`src/features`.

```bash
bun install
bun run dev     # http://localhost:3000, restarts on a change
bun run start
bun test        # createApp smoke test: no postgres, no Redis needed
bun run typecheck
```

## Services

AI text chat, sessions, streaming replies and provider credentials are documented
in [AI Chat](docs/ai-chat.md).
Agent configuration and reusable instruction Skills are documented in
[Agent and Skills](docs/ai-agent-skills.md).

File uploads, resumable chunks and streaming downloads are documented in
[docs/files.md](docs/files.md).

Postgres and Redis are optional at boot: every consumer degrades rather than
fails. Start them with `bun run db:up` (docker compose) and stop them with
`bun run db:down`.

- `cache`, `throttle`, `queue`, the websocket relay and the Redis health probe
  miss/allow/publish-locally when Redis is absent
- the app boots without postgres and the pool connects on first query; only the
  shape of `DATABASE_URL` is checked at boot (a non-postgres scheme is a boot
  error rather than a 500 on the first request), and readiness flips to 503 while
  the database is unreachable

## Database

Schema lives in `src/schemas/schema/**`, migrations in `drizzle/`.

```bash
bun run db:generate   # generate SQL from the schema
bun run db:migrate    # apply it
bun run db:seed       # apply sql/sys.sql to dunx-boot (safe to repeat)
bun run db:studio     # drizzle studio
```

`config/application-dev.ts` and `config/application-prod.ts` read `DATABASE_URL`
from `.env`; the dev overlay falls back to a local
`postgresql://postgres:123456@127.0.0.1:5432/dunx-boot?search_path=public`, production does not.

See [database initialization](sql/README.md) for migration and seed details.

## Development login

In `APP_ENV=dev` or `APP_ENV=test`, request a normal login session without a
request body:

```bash
curl -X POST http://localhost:3000/api/auth/devLogin
```

The endpoint generates and consumes an image captcha internally, then runs the
normal account/password login with the initial `admin` / `123456` credentials
from `sql/sys.sql`. The database must contain that enabled account with its
initial password. The response uses the usual `Api` envelope with
`data.accessToken`, `data.refreshToken` and `data.user`; pass the access token as
`Authorization: Bearer <accessToken>` when debugging other APIs.

In production, `@Controller` excludes `devLogin` from routing and OpenAPI, and
the service also rejects direct calls. The normal captcha endpoint continues to
return only the captcha ID and image.

## Tracing

Tracing follows the [dunx OpenTelemetry guide](https://dunx.win/guide/tracing).
Set the complete OTLP/HTTP traces URL in `.env` or the deployment environment,
then restart the app:

```dotenv
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://127.0.0.1:4318/v1/traces
```

Point this at an OpenTelemetry Collector, Jaeger or Tempo HTTP receiver that
accepts OTLP/HTTP JSON. This is a backend receiver, not its UI address or the
OTLP/gRPC port 4317. No collector is started by this application.

Without an endpoint, the SDK stays off and the app uses `NoopTracer`; the app
and tests still boot without a collector. `tracing.enabled: false` in
`config/application.ts` or an environment overlay explicitly disables tracing
even when an endpoint is configured. `tracing.sampleRatio` controls sampling of
new traces (0–1, default 1); an incoming parent's sampling decision is respected.
`tracing.exportTimeoutMs` bounds each batch export (default 2000 ms).

`AppTracingModule` uses the same `Tracer` → `OtelTracer` binding as `OtelModule`,
with an explicit dependency that registers the SDK before constructing the
tracer. Configuration still comes from the app's single `ConfigModule` load.
Resources identify `application.name`, `application.version` and `APP_ENV`.
Requests, outbound `HttpService` calls, Drizzle SQL, Redis commands and BullMQ
publish/consume operations use the framework's spans and W3C propagation. The
database adapter retains lazy connection, relations and query caching. Request
logs and `traceresponse` correlate with the recorded server span; dashboard paths
remain excluded by the existing request-logging configuration.

The SDK batches exports and flushes queued spans during `app.shutdown()`.
Applications in the same process share the SDK when their tracing and application
configuration matches; the last shutdown releases its global registration.
`createApp()` also releases tracing if application creation fails. Collector
outages do not block boot or request handling, and export attempts have the
configured timeout.

For a business span, inject the framework's `Tracer` and wrap the operation:

```ts
import { Tracer } from '@dunx/core'

export class ExampleService {
  constructor(private readonly tracer: Tracer) {}

  execute() {
    return this.tracer.span('example.execute', {}, async () => {
      // Business work; nested HTTP/SQL spans inherit this context.
    })
  }
}
```

Keep one `@opentelemetry/api` version (`bun why @opentelemetry/api`); the package
override pins transitive consumers to the app's version. Do not independently
register another SDK in this process. A queue worker using process isolation
needs its own tracing initialization and module binding in that process.

## What is wired up

- **config** - file-based: `config/application.ts` holds the defaults (and reads
  no environment variable), `config/application-<APP_ENV>.ts` holds what that
  environment changes, and `.env` carries only secrets and machine-bound
  addresses (`DATABASE_URL`, `REDIS_URL`, `AUTH_SECRET`, `CORS_ORIGIN`,
  `PUBLIC_URL`, `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`); the framework reads and
  zod-validates the merged files at boot.
  An unknown `APP_ENV` and an `auth.secret` under 32 characters are boot errors,
  and every knob in the schema is read by some module (no dead switches)
- **http** - CORS (mounted only when an `origin` is configured), request logging
  (bodies stay off unless an environment turns them on), gzip compression, a
  unified `Api` error envelope (`AppErrorFilter`) and `Api`/`Pager` responses
- **auth** - JWT access/refresh tokens (HS256, `algorithms` pinned), captcha,
  register/login/refresh/logout, a global session middleware and `sessionContext`
  plus [rotating QR login over SSE and WebSocket](docs/qr-login.md)
  Authentication is required in every environment except for `@Public()` routes
  and `security.auth.whiteList`. Whitelist entries are plain absolute paths:
  `/api/docs` matches itself and descendants, but not `/api/docsx`. Wildcards
  are rejected; replace `/api/docs/**` with `/api/docs`. The defaults expose
  only the docs and OpenAPI document; `/api/auth/me` and `/api/auth/logout`
  require valid bearer tokens. Whitelist matching is built once as a Set and
  checks slash boundaries without evaluating glob patterns.
- **crud** - `CrudRepository`/`CrudService` plus two controller shapes:
  `defineCrudController({ service, schema: { response, create, update, query } })`
  generates the five routes (add domain endpoints via
  `customize: (base) => ...`, which inherits `this.service`; endpoints
  pass business inputs only, the tenant/operator scope is the service's job), and
  `crudRoutes()` descriptors let a domain mount a subset by hand (read-only, tree,
  batch). Soft delete, optimistic lock (the update request must carry `version`),
  audit fill, multi-tenant scoping (a missing tenant is a 400, never an
  unfiltered query) and query cache come from the repository; batch delete is
  capped at 500 ids
- **database** - drizzle over `Bun.SQL`, `drizzle-uncache` query cache behind
  `AppDbModule`, and the pool is closed on shutdown (`DbLifecycle`)
- **cache** - L1 memory + L2 Redis, degrading; `cache.enabled: false` leaves L1
  only, and the query cache shares `redis.url` instead of a second connection
  string
- **queue / events / resilience / client** - bullmq publish side
  (`queue.consume: 'if-any'` consumes only where a `@JobHandler` exists),
  in-process event bus, timeout+retry policy, outbound `HttpService` (no retry by
  default, so a `POST` is never replayed behind your back)
- **files / images / email** - local disk storage, image pipeline with a 25MP /
  6000px ceiling, mail with a log transport by default and the configured timeout
- **health** - `/api/health/live` (memory ceiling is critical: over it, the
  process asks to be restarted) and `/api/health/ready`
- **throttle** - fixed-window rate limit, Redis-backed, counted per authenticated
  user and per client address otherwise
- **schedule** - `@Cron` / `@Interval` / `@OnceOnBoot`
- **openapi** - OpenAPI 3.1 from the route schemas plus a Scalar page at
  `/api/docs` (non-prod); the document is generated from the same root module the
  app serves
- **dashboard** - the ops panel at `/_dunx`, registered ahead of the session
  guard in `src/middleware/index.ts`; without a `dashboard.token` it only answers
  in `dev`, and `reveal` is left at the framework default (no config values are
  shown)

## Compile to a binary

```bash
bun run build   # -> dist/dunx-boot(.exe) + a copy of config/
```

`scripts/build.ts` hands `Bun.build` the `@dunx/transform` plugin and `compile`
together, so the constructor-dependency records the container needs are baked
into the executable. This needs Bun >= 1.4.1: an earlier one dropped the records.

The binary reads `<cwd>/config`, which the build copies to `dist/config`, so
`cd dist && ./dunx-boot` is a complete deployment. Run it from a directory
without this app's `bunfig.toml`: a standalone bun executable still reads
`preload` from the working directory's bunfig and would try to load
`@dunx/transform/preload`, which the binary no longer needs and cannot resolve.

## Constructor injection

`bunfig.toml` preloads `@dunx/transform`, which records each class's constructor
parameter types so the container can resolve them. Without that line providers
are built with no arguments and boot fails saying so.
