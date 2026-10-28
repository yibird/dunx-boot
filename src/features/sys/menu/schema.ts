import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { baseQuerySchema } from '@/infra/model'
import { commonColumnsSchema, sysMenu } from '@/schemas'
import { SYS_MENU_TYPE } from '@/constants'

export const sysMenuSchema = createSelectSchema(sysMenu, {
  menuName: z.string().meta({ description: '菜单名称', example: '首页' }),
  menuType: z
    .union([
      z.literal(SYS_MENU_TYPE.Dir),
      z.literal(SYS_MENU_TYPE.Menu),
      z.literal(SYS_MENU_TYPE.ChildMenu),
      z.literal(SYS_MENU_TYPE.Permission),
    ])
    .meta({ description: '菜单类型', examples: [SYS_MENU_TYPE.Menu] }),
  rootId: z.string().meta({ description: '根菜单ID', example: '0' }),
  parentId: z.string().meta({ description: '父菜单ID', example: '0' }),
  routePath: z.string().meta({ description: '路由路径', examples: ['/home'] }),
  permission: z.string().meta({ description: '权限', example: 'home:index' }),
  icon: z.string().meta({ description: '图标', example: 'icon-home' }),
  isExternal: z.boolean().meta({ description: '是否外部链接', example: false }),
  isCache: z.boolean().meta({ description: '是否缓存', example: true }),
  ...commonColumnsSchema,
}).meta({ id: 'SysMenu' })

export const sysMenuQuerySchema = baseQuerySchema
  .extend({
    menuName: z
      .string()
      .optional()
      .meta({ description: '菜单名称（模糊查询）' }),
    menuType: z
      .number()
      .optional()
      .nullable()
      .meta({ description: '菜单类型', examples: [SYS_MENU_TYPE.Menu] }),
    parentId: z.string().optional().meta({ description: '父菜单ID' }),
    menuPath: z.string().optional().meta({ description: '菜单路径' }),
    permission: z.string().optional().meta({ description: '权限标识' }),
  })
  .meta({ id: 'SysMenuQuery' })

export const sysMenuCreateReqSchema = sysMenuSchema
  .pick({
    menuName: true,
    menuType: true,
    rootId: true,
    parentId: true,
    routePath: true,
    icon: true,
    permission: true,
    isExternal: true,
    isCache: true,
    sort: true,
    remark: true,
  })
  .meta({ id: 'SysMenuCreateReq' })

export const sysMenuUpdateReqSchema = sysMenuSchema
  .pick({
    id: true,
    menuName: true,
    menuType: true,
    rootId: true,
    parentId: true,
    routePath: true,
    icon: true,
    permission: true,
    isExternal: true,
    isCache: true,
    sort: true,
    remark: true,
  })
  .meta({ id: 'SysMenuUpdateReq' })

export type SysMenuQuery = z.infer<typeof sysMenuQuerySchema>
export type SysMenuCreateReq = z.infer<typeof sysMenuCreateReqSchema>
export type SysMenuUpdateReq = z.infer<typeof sysMenuUpdateReqSchema>
