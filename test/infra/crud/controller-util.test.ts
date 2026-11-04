import { describe, expect, test } from 'bun:test'
import { z } from 'zod'
import { baseQuerySchema } from '@/infra/model'
import { CrudController } from '@/infra/crud/controller/controller'
import { CRUD_ENDPOINT, CRUD_ENDPOINTS } from '@/infra/crud/controller/constant'
import {
  getExcludes,
  getPermission,
  getPermissionPrefix,
  getTags,
} from '@/infra/crud/controller/util'

describe('controller util', () => {
  test('getPermissionPrefix 拆分驼峰', () => {
    expect(getPermissionPrefix('SysPost')).toBe('sys:post')
    expect(getPermissionPrefix('SysDictType')).toBe('sys:dict:type')
    expect(getPermissionPrefix('HTTPServer')).toBe('http:server')
    expect(getPermissionPrefix('sys-post')).toBe('sys:post')
    expect(getPermissionPrefix(undefined)).toBe('')
  })

  test('getPermission 拼接前缀与动作', () => {
    expect(getPermission('getList', { modelName: 'SysPost' })).toBe(
      'sys:post:getList'
    )
    expect(
      getPermission('getList', {
        modelName: 'SysPost',
        permissionSeparator: '.',
      })
    ).toBe('sys.post.getList')
  })

  test('getTags 回退到组件名', () => {
    expect(getTags({ tags: ['用户'] })).toEqual(['用户'])
    expect(getTags({ modelName: 'SysUser' })).toEqual(['SysUser'])
    expect(getTags({})).toEqual([])
  })

  test('getExcludes 根据 include / exclude 计算', () => {
    expect(getExcludes({})).toEqual([])
    expect(
      getExcludes({ includes: [CRUD_ENDPOINT.GET_LIST, CRUD_ENDPOINT.CREATE] })
    ).toEqual(
      CRUD_ENDPOINTS.filter(
        (endpoint) =>
          endpoint !== CRUD_ENDPOINT.GET_LIST &&
          endpoint !== CRUD_ENDPOINT.CREATE
      )
    )
    expect(
      getExcludes({
        excludes: [CRUD_ENDPOINT.DELETE, CRUD_ENDPOINT.DELETE_MANY],
      })
    ).toEqual([CRUD_ENDPOINT.DELETE, CRUD_ENDPOINT.DELETE_MANY])
  })

  test('CrudController 生成九个端点', () => {
    class TestService {
      async getPageList() {}
      async getList() {}
      async getRecord() {}
      async create() {}
      async createMany() {}
      async update() {}
      async updateMany() {}
      async delete() {}
      async deleteMany() {}
    }

    const Generated = CrudController({
      service: TestService,
      prefix: 'test/crud',
      modelName: 'TestCrud',
      schema: {
        response: z.object({ id: z.string() }),
        create: z.object({ name: z.string() }),
        update: z.object({ name: z.string() }),
        query: baseQuerySchema.extend({ name: z.string().optional() }),
      },
    })

    expect(typeof Generated).toBe('function')
    for (const method of CRUD_ENDPOINTS) {
      expect(typeof Generated.prototype[method]).toBe('function')
    }
  })
})
