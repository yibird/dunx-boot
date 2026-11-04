# CRUD2 重构设计文档

## 背景

原 `src/infra/crud` 模块将多租户、审计字段、乐观锁等逻辑硬编码在仓储基类中，导致：

- 代码耦合：所有功能混在一起，难以维护
- 扩展困难：新增功能需要修改核心代码
- 配置僵化：无法灵活启用/禁用功能

## 新架构设计

### 核心思想

**关注点分离 + 插件化**：将核心 CRUD 操作与扩展功能解耦，通过插件机制实现功能组合。

### 架构层次

```
┌─────────────────────────────────────┐
│   业务仓储 (SysDeptRepository)       │
│   - 继承 CrudRepository              │
│   - 配置插件列表                     │
│   - 实现业务查询逻辑                 │
└─────────────────────────────────────┘
              │
              ↓
┌─────────────────────────────────────┐
│   CrudRepository (核心仓储)          │
│   - 提供基础 CRUD 方法               │
│   - 协调插件执行                     │
│   - 保持类型安全                     │
└─────────────────────────────────────┘
              │
      ┌───────┴───────┐
      ↓               ↓
┌──────────┐   ┌──────────────────┐
│ 核心操作 │   │ 插件管理器        │
│ - query  │   │ - 插件注册       │
│ - create │   │ - 优先级排序     │
│ - update │   │ - 钩子调度       │
│ - delete │   └──────────────────┘
└──────────┘           │
                       ↓
              ┌────────────────┐
              │  插件生态       │
              │ - tenantPlugin │
              │ - auditPlugin  │
              │ - softDelete   │
              │ - 自定义插件   │
              └────────────────┘
```

### 插件接口

```typescript
export interface CrudPlugin<TTable extends PgTable = PgTable> {
  name: string;
  priority?: number;

  // 查询生命周期
  beforeQuery?(context: QueryContext<TTable>): void | Promise<void>;
  afterQuery?<T>(context: ResultContext<TTable, T>): void | Promise<void>;

  // 创建生命周期
  beforeCreate?(context: CreateContext<TTable>): void | Promise<void>;
  afterCreate?<T>(context: ResultContext<TTable, T>): void | Promise<void>;

  // 更新生命周期
  beforeUpdate?(context: UpdateContext<TTable>): void | Promise<void>;
  afterUpdate?<T>(context: ResultContext<TTable, T>): void | Promise<void>;

  // 删除生命周期
  beforeDelete?(context: DeleteContext<TTable>): void | Promise<void>;
  afterDelete?<T>(context: ResultContext<TTable, T>): void | Promise<void>;
}
```

### 执行流程

```
查询操作流程:
  用户调用 getPageList(query)
    → beforeQuery 插件链 (按 priority 升序)
      → tenant (priority: 10)
      → softDelete (priority: 15)
    → 执行数据库查询
    → afterQuery 插件链
    → 返回结果

创建操作流程:
  用户调用 create(input)
    → beforeCreate 插件链
      → tenant: 填充租户ID
      → audit: 填充创建时间/人
      → optimisticLock: 初始化版本号
    → 执行数据库插入
    → afterCreate 插件链
    → 返回结果

更新操作流程:
  用户调用 update(id, input)
    → beforeUpdate 插件链
      → tenant: 添加租户条件
      → audit: 填充更新时间/人
      → optimisticLock: 校验版本、递增版本
    → 执行数据库更新
    → afterUpdate 插件链
      → optimisticLock: 检查冲突
    → 返回结果

删除操作流程:
  用户调用 delete(id)
    → beforeDelete 插件链
      → tenant: 添加租户条件
      → softDelete: 转为软删除
      → audit: 填充删除时间/人
    → 执行软删除 (update) 或物理删除 (delete)
    → afterDelete 插件链
    → 返回结果
```

## 输出过滤（ignoreColumns）

字段过滤不是插件。仓储构造时通过 `ignoreColumns` 声明不返回的列，
类型受 `keyof TTable['_']['columns']` 约束，查询、创建与更新结果中都会省略
这些列，但不影响写入：

```ts
super({
  table: sysUser,
  ignoreColumns: ["password"],
  queryOptions: {},
});
```

## 内置插件

### 1. tenantPlugin

- **优先级**: 10
- **功能**: 多租户数据隔离
- **拦截点**:
  - beforeQuery: 添加 `tenantId = ?` 条件
  - beforeCreate: 填充 `tenantId`
  - beforeUpdate/Delete: 添加租户条件

### 2. softDeletePlugin

- **优先级**: 15
- **功能**: 软删除支持
- **拦截点**:
  - beforeQuery: 过滤 `deleted = false`
  - beforeDelete: 转为 update 并设置 `deleted = true`

### 3. auditPlugin

- **优先级**: 20
- **功能**: 审计字段自动填充
- **拦截点**:
  - beforeCreate: 填充 createdAt/By/ByName
  - beforeUpdate: 填充 updatedAt/By/ByName
  - beforeDelete: 填充 deletedAt/By/ByName (软删除时)

### 4. optimisticLockPlugin

- **优先级**: 30 (最后执行)
- **功能**: 乐观锁版本控制
- **拦截点**:
  - beforeCreate: 设置 `version = 1`
  - beforeUpdate: 校验版本、设置 `version = version + 1`
  - afterUpdate: 检测版本冲突

## 使用示例

### 标准配置

```typescript
export class SysDeptRepository extends CrudRepository<typeof sysDept> {
  constructor() {
    super({
      table: sysDept,
      queryOptions: {
        orderBy: [asc(sysDept.sort), asc(sysDept.createdAt)],
      },
      ignoreColumns: ["id", "tenantId"],
      plugins: [tenantPlugin(), softDeletePlugin(), auditPlugin(), optimisticLockPlugin()],
    });
  }
}

// 查询条件在调用时通过 options 传入，也可由插件在 beforeQuery 中追加
const page = await repository.getPageList(query, {
  where: mergeAnd(
    ilikeIf(sysDept.deptName, query.deptName),
    eqIf(sysDept.parentId, query.parentId),
  ),
});
```

### 自定义插件

```typescript
// 示例：数据脱敏插件
const dataMaskPlugin: CrudPlugin<typeof sysUser> = {
  name: "dataMask",
  priority: 50,

  afterQuery(context) {
    const rows = Array.isArray(context.result) ? context.result : [context.result];

    for (const row of rows) {
      if (row?.phone) {
        row.phone = row.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
      }
    }
  },
};

export class SysUserRepository extends CrudRepository<typeof sysUser> {
  constructor() {
    super({
      table: sysUser,
      ignoreColumns: ["id", "tenantId"],
      plugins: [
        tenantPlugin(),
        auditPlugin(),
        dataMaskPlugin, // 使用自定义插件
      ],
    });
  }
}
```

## 优势对比

### 旧架构 (crud)

```
✗ 所有逻辑硬编码在 CrudRepository
✗ 新增功能需要修改核心类
✗ 无法灵活启用/禁用功能
✗ 代码耦合度高，难以测试
✗ 配置复杂，选项散落各处
```

### 新架构 (crud2)

```
✓ 核心仓储简洁，只负责基础 CRUD
✓ 插件独立开发和测试
✓ 按需组合，灵活配置
✓ 扩展无需修改核心代码
✓ 执行顺序清晰可控
✓ 类型安全保持完整
```

## 迁移策略

1. **并行开发**: crud2 与 crud 共存，逐步迁移
2. **新模块优先**: 新业务模块使用 crud2
3. **渐进迁移**: 旧模块按优先级逐个迁移
4. **充分测试**: 每个模块迁移后完整测试
5. **最终替换**: 所有模块迁移完成后移除 crud

## 测试覆盖

- [x] 插件执行顺序测试
- [x] 插件间数据传递测试
- [x] tenantPlugin 测试
- [x] softDeletePlugin 测试
- [x] auditPlugin 测试
- [ ] optimisticLockPlugin 完整测试
- [ ] 集成测试
- [ ] 性能测试

## 后续计划

1. 补充完整的单元测试
2. 编写更多示例插件 (缓存、日志、权限等)
3. 性能优化和基准测试
4. 完善文档和迁移指南
5. 在一个业务模块中试点
6. 根据反馈调整设计
7. 全面推广使用
