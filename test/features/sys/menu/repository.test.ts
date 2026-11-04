import { buildSysMenuQueryOptions as getQueryOptions } from '@/features/sys/menu/controller'
import { describe, expect, test } from 'bun:test'
import type { SQL } from 'drizzle-orm'
import { PgDialect } from 'drizzle-orm/pg-core'
import {
  sysMenuCreateReqSchema,
  sysMenuQuerySchema,
} from '@/features/sys/menu/schema'
import { SYS_MENU_TYPE } from '@/constants'

const dialect = new PgDialect()

function render(where?: SQL) {
  return where ? dialect.sqlToQuery(where) : undefined
}

describe('SysMenuRepository.getQueryOptions', () => {
  test('没有查询条件时不生成 where', () => {
    expect(render(getQueryOptions({}).where)).toBeUndefined()
  })

  test('菜单名称、父菜单与权限标识分别生成条件', () => {
    expect(render(getQueryOptions({ menuName: '用户' }).where)?.params).toEqual(
      ['%用户%']
    )
    expect(render(getQueryOptions({ parentId: '9' }).where)?.params).toEqual([
      '9',
    ])
    expect(
      render(getQueryOptions({ permission: 'sys:user' }).where)?.params
    ).toEqual(['%sys:user%'])
  })

  test('menuPath 映射到 route_path 列并模糊匹配', () => {
    const query = render(getQueryOptions({ menuPath: '/sys' }).where)

    expect(query?.sql).toBe('"sys_menu"."route_path" ilike $1')
    expect(query?.params).toEqual(['%/sys%'])
  })

  test('菜单类型走等值匹配，0 也会生成条件', () => {
    const query = render(
      getQueryOptions({ menuType: SYS_MENU_TYPE.Menu }).where
    )

    expect(query?.sql).toBe('"sys_menu"."menu_type" = $1')
    expect(query?.params).toEqual([SYS_MENU_TYPE.Menu])

    expect(render(getQueryOptions({ menuType: 0 }).where)?.params).toEqual([0])
  })

  test('所有条件按顺序用 and 合并', () => {
    const query = render(
      getQueryOptions({
        menuName: '用户',
        menuType: SYS_MENU_TYPE.Menu,
        parentId: '0',
        menuPath: '/sys',
        permission: 'sys:user',
      }).where
    )

    expect(query?.sql).toBe(
      '(("sys_menu"."menu_name" ilike $1) and ("sys_menu"."menu_type" = $2) and ' +
        '("sys_menu"."parent_id" = $3) and ("sys_menu"."route_path" ilike $4) and ' +
        '("sys_menu"."permission" ilike $5))'
    )
    expect(query?.params).toEqual([
      '%用户%',
      SYS_MENU_TYPE.Menu,
      '0',
      '%/sys%',
      '%sys:user%',
    ])
  })
})

describe('SysMenu schema', () => {
  const createInput = {
    menuName: '用户管理',
    menuType: SYS_MENU_TYPE.Menu,
    rootId: '0',
    parentId: '0',
    routePath: '/sys/user',
    icon: 'user',
    permission: 'sys:user:list',
    isExternal: false,
    isCache: true,
    sort: 0,
    remark: null,
  }

  test('菜单类型限定为四种取值', () => {
    expect(sysMenuCreateReqSchema.safeParse(createInput).success).toBe(true)
    expect(
      sysMenuCreateReqSchema.safeParse({ ...createInput, menuType: 99 }).success
    ).toBe(false)
  })

  test('查询参数会补齐默认分页', () => {
    expect(sysMenuQuerySchema.parse({})).toEqual({
      current: 1,
      pageSize: 10,
    })
  })
})
