# dunx-boot Agent Guidelines

本文件用于约束在本仓库内工作的 AI Agent、协作者和自动化脚本。

## 项目概况

### 技术栈

- bun
- @dunx/core、@dunx/http、@dunx/infra、@dunx/openapi
- TypeScript
- drizzle-orm
- date-fns
- es-toolkit
- jose
- zod
- picomatch
- qrcode
- svg-captcha
- hyperid
- opentelemetry

### 项目结构

```text
src/
├── constants/          # 常量目录,例如api、redis、http相关常量
├── errors/             # 通用组件
├── events/             # eventsBus目录
├── features/           # 全局配置
├── infra/              # 基础设施目录,提供项目常用的基础功能,例如http、http、cache、redis、resilience、throttle、tracing、crud
├── features/           # 业务模块目录
├── mastra/             # 页面布局
├── middleware/         # dunx http 中间件目录
├── schedule/           # 调度目录
├── schemas/            # drizzle-orm的表schema目录
├── utils/              # 通用工具目录
├── ws/                 # websocket目录
└── index.ts            # 入口文件
config/                 # 项目配置目录,包含了多环境配置文件
sql/                    # sql插入脚本
types/                  # 全局类型
logs/                   # 日志文件存放目录
```

## 命名规范

| 类型               | 命名风格                           | 示例                               |
| ------------------ | ---------------------------------- | ---------------------------------- |
| 文件名             | kebab-case                         | `user-profile.ts`、`theme-mode.ts` |
| 目录名             | kebab-case                         | `user-center/`、`theme-mode/`      |
| 变量 / 函数        | camelCase                          | `userName`、`getUserInfo()`        |
| 固定常量           | SCREAMING_SNAKE_CASE               | `MAX_RETRY_COUNT`                  |
| 普通配置对象       | camelCase                          | `themeConfig`                      |
| 类型 / 接口 / 枚举 | PascalCase                         | `ThemeMode`、`UserProfile`         |
| 布尔变量           | `is` / `has` / `should` 等语义前缀 | `isVisible`、`hasPermission`       |
| 回调型 props       | `on` + 事件名                      | `onSubmit`、`onChange`             |
| 内部事件处理函数   | 根据行为语义命名                   | `handleSubmit`、`resetForm`        |
| 配置对象回调       | `on` + 事件名                      | `onSuccess`、`onError`             |

- 命名应简单、准确、自然，能够表达真实的业务含义。
- 不追求看起来高级、复杂或抽象的名称。
- 优先使用能描述实际行为的名称，避免含糊的 `handleData`、`processValue`、`doAction` 等名称。
- 根据实际语义区分 `set`、`get`、`create`、`update`、`apply`、`sync` 等动词，不要随意混用。
- 不要为函数添加没有必要的前缀或后缀。函数名应反映职责，而不是只描述内部技术实现。
- 文件名优先使用 kebab-case，包括普通 TypeScript 文件和 composable 文件。同类命名应保持一致，不在同一模块中混用不同风格。
- 不要仅因为变量使用 `const` 就使用大写命名。大写常量用于固定的全局常量、枚举式常量或项目约定的配置键。
- 在业务模块中跟查询的相关的以`Query`为后缀,例如`SysUserQuery`、`SysDeptQuery`。在业务模块中跟新增或修改的相关的分别以`CreateReq`或`UpdateReq`为后缀,例如`SysUserCreateReq`、`SysUserUpdateReq`。

## 功能规范

新增一个业务功能时,应先在src/schemas 对应的业务域目录下创建dirzzle-orm 表schema,之后在src/features对应的业务域目录新建一下文件:

- schema.ts:业务schema文件,例如业务响应模块、业务新增/修改模型、业务查询模型。
- repository.ts: 存储层文件,用于业务的持久化,提供CRUD等api时可以继承自CrudRepository,否则无需继承任何类。
- service.ts: 服务层文件,用于处理业务逻辑,如果业务的repository继承自CrudRepository,那么服务层通常也要继承自CrudService。
- controller.ts: 控制层文件,用于对外提供http端点服务。
- constant.ts: 业务常量文件,如果业务未使用常量无需新建。
- index.ts: 入口文件,用于组装业务Module,对外暴露模型、存储层、服务端。

## 代码质量与独立审查

完成需求实现后，除了验证功能正确性，还应检查设计质量。

### 简洁性

- 是否存在不必要的中间变量、重复赋值、重复判断或重复状态？
- 是否存在只转发参数和返回值、没有独立语义的包装函数？
- 是否存在为了缩短代码而牺牲可读性的写法？
- 是否存在可以使用项目已有能力解决，却重新实现的功能？

### 职责与层次

- 每个函数、组件、composable 和模块是否具有明确职责？
- 是否把业务规则、状态管理、UI 表现、DOM 操作和请求逻辑不必要地混在一起？
- 是否存在调用链过深、不必要的转发层或循环依赖？
- 模块之间的依赖关系和状态所有权是否清晰？

### 模块拆分

- 是否存在承担多个独立职责的大模块？
- 是否存在拆得过碎、只服务于单一调用点的微型模块？
- 是否因为机械套用设计模式而增加不必要的文件、接口或抽象？
- 公共模块是否具有稳定、明确的复用价值？

### 命名与一致性

- 函数名是否准确描述其行为？
- 变量名是否表达真实含义，而不是只描述实现细节？
- 是否存在过长、含糊、重复表达或不符合项目习惯的名称？
- 是否遵循项目现有的类型、错误处理和模块组织方式？

### 审查执行要求

- 对明确且有实际影响的问题，应直接修正，不要只输出审查报告。
- 不要为了体现优化而重写已经简单、清晰且正确的实现。
- 不改变需求行为，不随意扩大修改范围。
- 完成修正后执行适用的类型检查、Lint、测试和构建。
- 对仍存在的问题或无法验证的部分如实说明。
- 简单任务无需输出冗长审查报告；涉及多个模块、公共 API 或架构调整时，应简要说明关键设计取舍。

## Git Commit 规范

Commit Message 格式：

```text
<type>(<scope>): <subject>
```

支持的类型：

- `feat`
- `fix`
- `refactor`
- `perf`
- `docs`
- `style`
- `chore`
- `test`

示例：

```text
feat(table): support virtual scrolling
fix(form): handle empty value
refactor(router): simplify route guard
perf(editor): lazy load editor dependencies
docs(components): update usage examples
```

要求：

- subject 应简洁描述实际变更。
- `scope` 应与项目模块或功能领域对应。
- 不要将无关改动合并进同一个提交。
- 未经明确要求，不要擅自创建 Git commit、推送或修改远程分支。
