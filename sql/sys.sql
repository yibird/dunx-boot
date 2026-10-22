-- 在目标数据库完成 Drizzle 迁移后执行本脚本。
-- 主键已存在时保留现有数据，重复执行不会重置账号密码或覆盖业务修改。
BEGIN;

-- 租户：保留原租户 ID；管理员及基础数据归属租户 1。
INSERT INTO "public"."sys_tenant" (
  "id", "tenant_name", "domain", "super_tenant", "data_status", "creator_name"
) VALUES
  (1, '总公司', 'admin.example.com', true, true, 'system'),
  (2, '华东分部', 'east.example.com', false, true, 'system'),
  (3, '华南分部', 'south.example.com', false, true, 'system'),
  (4, '测试租户', 'test.example.com', false, true, 'system'),
  (5, '演示租户', 'demo.example.com', false, false, 'system')
ON CONFLICT ("id") DO NOTHING;

-- 角色：data_scope 使用表默认值 0，其余公共字段使用表默认值。
INSERT INTO "public"."sys_role" (
  "id", "role_name", "tenant_id", "data_status", "creator_name"
) VALUES
  (1, '管理员', 1, true, 'system'),
  (2, '财务', 1, true, 'system'),
  (3, '运营', 1, true, 'system'),
  (4, '市场', 1, true, 'system')
ON CONFLICT ("id") DO NOTHING;

-- 部门
INSERT INTO "public"."sys_dept" (
  "id", "dept_name", "root_id", "parent_id", "path", "tenant_id", "data_status", "creator_name"
) VALUES
  (1, '董事会', 0, 0, '0', 1, true, 'system'),
  (2, '研发部', 1, 1, '0/1', 1, true, 'system'),
  (3, '市场部', 1, 1, '0/1', 1, true, 'system'),
  (4, '财务部', 1, 1, '0/1', 1, true, 'system'),
  (5, '人力资源部', 1, 1, '0/1', 1, true, 'system')
ON CONFLICT ("id") DO NOTHING;

-- 岗位：新版表结构已移除 post_code。
INSERT INTO "public"."sys_post" (
  "id", "post_name", "post_level", "tenant_id", "data_status", "creator_name"
) VALUES
  (1, '首席执行官', 6, 1, true, 'system'),
  (2, '首席技术官', 6, 1, true, 'system'),
  (3, '前端开发专家', 6, 1, true, 'system'),
  (4, '后端开发工程师', 3, 1, true, 'system'),
  (5, '人力资源专员', 2, 1, true, 'system')
ON CONFLICT ("id") DO NOTHING;

-- 用户：保留原 admin 账号、密码哈希和角色/部门/岗位关联。
INSERT INTO "public"."sys_user" (
  "id", "account", "password", "nickname", "role_id", "dept_id", "post_id", "sex", "age", "id_card", "tenant_id", "data_status", "creator_name"
) VALUES
  (1, 'admin', '$argon2id$v=19$m=65536,t=2,p=1$PVYajZGf3242I96CxjPYmc1b+nQSJxK1F0++guBHPCk$vkZ6eY33ePYxzIfGRuATdrSNpVhQ4vipyjOTiccrOBw', '超级管理员', 1, 1, 1, 0, 30, '110101199001011234', 1, true, 'system')
ON CONFLICT ("id") DO NOTHING;

-- 菜单：类型与 SYS_MENU_TYPE 一致（目录 1、菜单 2、子菜单 3、权限 4）。
-- 已移除 component_path、visible；is_external 使用表默认值 false。
-- 已实现的 CRUD 权限采用当前控制器的权限码，其余原菜单权限保留。
INSERT INTO "public"."sys_menu" (
  "id", "menu_name", "SYS_MENU_TYPE", "root_id", "parent_id", "route_path", "permission", "icon", "is_cache", "sort", "creator_name", "tenant_id"
) VALUES
  (1, '系统管理', 1, 0, 0, '/sys', NULL, 'i-lucide:cog', false, 10, 'system', 1),
  (2, '系统日志', 1, 1, 1, '/sys/log', NULL, 'i-lucide:logs', false, 90, 'system', 1),
  (10, '用户管理', 2, 1, 1, '/sys/user', 'sys:user:getPageList', 'i-lucide:users', true, 10, 'system', 1),
  (20, '角色管理', 2, 1, 1, '/sys/role', 'sys:role:getPageList', 'i-lucide:shield-check', true, 20, 'system', 1),
  (30, '部门管理', 2, 1, 1, '/sys/dept', 'sys:dept:getPageList', 'i-lucide:building-2', true, 30, 'system', 1),
  (40, '岗位管理', 2, 1, 1, '/sys/post', 'sys:post:getPageList', 'i-lucide:briefcase-business', true, 40, 'system', 1),
  (50, '菜单管理', 2, 1, 1, '/sys/menu', 'sys:menu:getPageList', 'i-lucide:menu', true, 50, 'system', 1),
  (60, '租户管理', 2, 1, 1, '/sys/tenant', 'sys:tenant:getPageList', 'i-lucide:building', true, 60, 'system', 1),
  (70, '数据字典', 2, 1, 1, '/sys/dict', 'sys:dict:type:getPageList', 'i-lucide:book-type', true, 70, 'system', 1),
  (80, '系统监控', 2, 1, 1, '/dashboard/monitor', 'sys:metrics:serviceInfo', 'i-lucide:monitor-cog', true, 80, 'system', 1),
  (90, '登录日志', 2, 1, 2, '/sys/log/loginLog', 'sys:log:login:list', 'i-lucide:log-in', true, 10, 'system', 1),
  (91, '操作日志', 2, 1, 2, '/sys/log/operationLog', 'sys:operation:log:getPageList', 'i-lucide:mouse-pointer-click', true, 20, 'system', 1),
  (92, '验证码日志', 2, 1, 2, '/sys/log/captchaLog', 'sys:log:captcha:list', 'i-lucide:scan-search', true, 40, 'system', 1),
  (93, '请求日志', 2, 1, 2, '/sys/log/requestLog', 'sys:log:request:list', 'i-lucide:route', true, 30, 'system', 1),
  (101, '查看用户详情', 4, 1, 10, NULL, 'sys:user:getRecord', NULL, false, 10, 'system', 1),
  (102, '修改用户', 4, 1, 10, NULL, 'sys:user:update', NULL, false, 20, 'system', 1),
  (103, '删除用户', 4, 1, 10, NULL, 'sys:user:delete', NULL, false, 30, 'system', 1),
  (104, '强制用户下线', 4, 1, 10, NULL, 'sys:user:kick', NULL, false, 40, 'system', 1),
  (201, '查看角色详情', 4, 1, 20, NULL, 'sys:role:getRecord', NULL, false, 10, 'system', 1),
  (202, '新增角色', 4, 1, 20, NULL, 'sys:role:create', NULL, false, 20, 'system', 1),
  (203, '修改角色', 4, 1, 20, NULL, 'sys:role:update', NULL, false, 30, 'system', 1),
  (204, '删除角色', 4, 1, 20, NULL, 'sys:role:delete', NULL, false, 40, 'system', 1),
  (301, '查看部门详情', 4, 1, 30, NULL, 'sys:dept:getRecord', NULL, false, 10, 'system', 1),
  (302, '新增部门', 4, 1, 30, NULL, 'sys:dept:create', NULL, false, 20, 'system', 1),
  (401, '查看岗位详情', 4, 1, 40, NULL, 'sys:post:getRecord', NULL, false, 10, 'system', 1),
  (402, '新增岗位', 4, 1, 40, NULL, 'sys:post:create', NULL, false, 20, 'system', 1),
  (403, '修改岗位', 4, 1, 40, NULL, 'sys:post:update', NULL, false, 30, 'system', 1),
  (404, '删除岗位', 4, 1, 40, NULL, 'sys:post:delete', NULL, false, 40, 'system', 1),
  (501, '查看菜单详情', 4, 1, 50, NULL, 'sys:menu:getRecord', NULL, false, 10, 'system', 1),
  (502, '新增菜单', 4, 1, 50, NULL, 'sys:menu:create', NULL, false, 20, 'system', 1),
  (503, '修改菜单', 4, 1, 50, NULL, 'sys:menu:update', NULL, false, 30, 'system', 1),
  (504, '删除菜单', 4, 1, 50, NULL, 'sys:menu:delete', NULL, false, 40, 'system', 1),
  (601, '查看租户详情', 4, 1, 60, NULL, 'sys:tenant:getRecord', NULL, false, 10, 'system', 1),
  (602, '新增租户', 4, 1, 60, NULL, 'sys:tenant:create', NULL, false, 20, 'system', 1),
  (603, '修改租户', 4, 1, 60, NULL, 'sys:tenant:update', NULL, false, 30, 'system', 1),
  (604, '删除租户', 4, 1, 60, NULL, 'sys:tenant:delete', NULL, false, 40, 'system', 1),
  (701, '查看字典类型详情', 4, 1, 70, NULL, 'sys:dict:type:getRecord', NULL, false, 10, 'system', 1),
  (702, '新增字典类型', 4, 1, 70, NULL, 'sys:dict:type:create', NULL, false, 20, 'system', 1),
  (703, '修改字典类型', 4, 1, 70, NULL, 'sys:dict:type:update', NULL, false, 30, 'system', 1),
  (704, '删除字典类型', 4, 1, 70, NULL, 'sys:dict:type:delete', NULL, false, 40, 'system', 1),
  (705, '查询字典数据', 4, 1, 70, NULL, 'sys:dict:data:list', NULL, false, 50, 'system', 1),
  (706, '查看字典数据详情', 4, 1, 70, NULL, 'sys:dict:data:read', NULL, false, 60, 'system', 1),
  (707, '新增字典数据', 4, 1, 70, NULL, 'sys:dict:data:create', NULL, false, 70, 'system', 1),
  (708, '修改字典数据', 4, 1, 70, NULL, 'sys:dict:data:update', NULL, false, 80, 'system', 1),
  (709, '删除字典数据', 4, 1, 70, NULL, 'sys:dict:data:delete', NULL, false, 90, 'system', 1),
  (801, '运行时指标', 4, 1, 80, NULL, 'sys:metrics:runtime', NULL, false, 10, 'system', 1),
  (802, 'Redis 指标', 4, 1, 80, NULL, 'sys:metrics:redis', NULL, false, 20, 'system', 1),
  (803, '缓存指标', 4, 1, 80, NULL, 'sys:metrics:cache', NULL, false, 30, 'system', 1),
  (804, 'PostgreSQL 指标', 4, 1, 80, NULL, 'sys:metrics:postgresql', NULL, false, 40, 'system', 1),
  (805, '应用实例信息', 4, 1, 80, NULL, 'sys:metrics:app', NULL, false, 50, 'system', 1),
  (901, '查看登录日志详情', 4, 1, 90, NULL, 'sys:log:login:read', NULL, false, 10, 'system', 1),
  (911, '查看操作日志详情', 4, 1, 91, NULL, 'sys:operation:log:getRecord', NULL, false, 10, 'system', 1),
  (921, '查看验证码日志详情', 4, 1, 92, NULL, 'sys:log:captcha:read', NULL, false, 10, 'system', 1),
  (931, '查看请求日志详情', 4, 1, 93, NULL, 'sys:log:request:read', NULL, false, 10, 'system', 1)
ON CONFLICT ("id") DO NOTHING;

-- 仅关联管理员角色 1 与上述初始化菜单；不设置 *，不为其他角色赋权。
-- 未新增 getList/批量操作等权限，后续按业务需要显式配置。
INSERT INTO "public"."sys_role_menu" (
  "id", "role_id", "menu_id", "tenant_id", "creator_name"
) VALUES
  (1, 1, 1, 1, 'system'),
  (2, 1, 2, 1, 'system'),
  (10, 1, 10, 1, 'system'),
  (20, 1, 20, 1, 'system'),
  (30, 1, 30, 1, 'system'),
  (40, 1, 40, 1, 'system'),
  (50, 1, 50, 1, 'system'),
  (60, 1, 60, 1, 'system'),
  (70, 1, 70, 1, 'system'),
  (80, 1, 80, 1, 'system'),
  (90, 1, 90, 1, 'system'),
  (91, 1, 91, 1, 'system'),
  (92, 1, 92, 1, 'system'),
  (93, 1, 93, 1, 'system'),
  (101, 1, 101, 1, 'system'),
  (102, 1, 102, 1, 'system'),
  (103, 1, 103, 1, 'system'),
  (104, 1, 104, 1, 'system'),
  (201, 1, 201, 1, 'system'),
  (202, 1, 202, 1, 'system'),
  (203, 1, 203, 1, 'system'),
  (204, 1, 204, 1, 'system'),
  (301, 1, 301, 1, 'system'),
  (302, 1, 302, 1, 'system'),
  (401, 1, 401, 1, 'system'),
  (402, 1, 402, 1, 'system'),
  (403, 1, 403, 1, 'system'),
  (404, 1, 404, 1, 'system'),
  (501, 1, 501, 1, 'system'),
  (502, 1, 502, 1, 'system'),
  (503, 1, 503, 1, 'system'),
  (504, 1, 504, 1, 'system'),
  (601, 1, 601, 1, 'system'),
  (602, 1, 602, 1, 'system'),
  (603, 1, 603, 1, 'system'),
  (604, 1, 604, 1, 'system'),
  (701, 1, 701, 1, 'system'),
  (702, 1, 702, 1, 'system'),
  (703, 1, 703, 1, 'system'),
  (704, 1, 704, 1, 'system'),
  (705, 1, 705, 1, 'system'),
  (706, 1, 706, 1, 'system'),
  (707, 1, 707, 1, 'system'),
  (708, 1, 708, 1, 'system'),
  (709, 1, 709, 1, 'system'),
  (801, 1, 801, 1, 'system'),
  (802, 1, 802, 1, 'system'),
  (803, 1, 803, 1, 'system'),
  (804, 1, 804, 1, 'system'),
  (805, 1, 805, 1, 'system'),
  (901, 1, 901, 1, 'system'),
  (911, 1, 911, 1, 'system'),
  (921, 1, 921, 1, 'system'),
  (931, 1, 931, 1, 'system')
ON CONFLICT ("id") DO NOTHING;

-- 字典类型
INSERT INTO "public"."sys_dict_type" (
  "id", "dict_name", "dict_type", "tenant_id", "creator_name"
) VALUES
  (1, '用户性别', 'sys_user_sex', 1, 'system'),
  (2, '启用状态', 'sys_data_status', 1, 'system'),
  (3, '通知类型', 'sys_notice_type', 1, 'system'),
  (4, '设备类型', 'sys_device_type', 1, 'system'),
  (5, '登录平台', 'sys_SYS_LOGIN_PLATFORM', 1, 'system')
ON CONFLICT ("id") DO NOTHING;

-- 字典数据
INSERT INTO "public"."sys_dict_data" (
  "id", "dict_type_id", "dict_label", "dict_value", "tenant_id", "creator_name"
) VALUES
  (1, 1, '男', '0', 1, 'system'),
  (2, 1, '女', '1', 1, 'system'),
  (3, 1, '未知', '2', 1, 'system'),
  (4, 2, '启用', 'true', 1, 'system'),
  (5, 2, '禁用', 'false', 1, 'system'),
  (6, 5, 'PC 端', '1', 1, 'system'),
  (7, 3, '系统通知', '1', 1, 'system'),
  (8, 3, '待办事项', '2', 1, 'system'),
  (9, 3, '告警消息', '3', 1, 'system'),
  (10, 4, '桌面浏览器', '1', 1, 'system'),
  (11, 4, '移动设备', '2', 1, 'system'),
  (12, 4, '平板设备', '3', 1, 'system'),
  (13, 5, '移动端', '2', 1, 'system'),
  (14, 5, '小程序', '3', 1, 'system'),
  (15, 5, 'API 客户端', '4', 1, 'system')
ON CONFLICT ("id") DO NOTHING;

-- 显式初始化 ID 不推进 bigserial 序列；同步后续自增起点，重复执行时不回退序列。
DO $$
DECLARE
  target_table text;
  sequence_name text;
  max_id bigint;
  last_id bigint;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'sys_tenant',
    'sys_role',
    'sys_dept',
    'sys_post',
    'sys_user',
    'sys_menu',
    'sys_role_menu',
    'sys_dict_type',
    'sys_dict_data'
  ] LOOP
    sequence_name := pg_get_serial_sequence(format('public.%I', target_table), 'id');
    EXECUTE format('SELECT MAX(id) FROM public.%I', target_table) INTO max_id;
    last_id := pg_sequence_last_value(sequence_name::regclass);
    IF max_id IS NOT NULL THEN
      PERFORM setval(sequence_name::regclass, GREATEST(max_id, COALESCE(last_id, 0)), true);
    END IF;
  END LOOP;
END;
$$;

COMMIT;
