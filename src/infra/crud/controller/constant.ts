export const CRUD_ENDPOINT = {
  GET_LIST: 'getList',
  GET_PAGE_LIST: 'getPageList',
  GET_RECORD: 'getRecord',
  CREATE: 'create',
  CREATE_MANY: 'createMany',
  UPDATE: 'update',
  UPDATE_MANY: 'updateMany',
  DELETE: 'delete',
  DELETE_MANY: 'deleteMany',
} as const

export type CrudEndpoint = (typeof CRUD_ENDPOINT)[keyof typeof CRUD_ENDPOINT]

export const CRUD_ENDPOINTS: readonly CrudEndpoint[] =
  Object.values(CRUD_ENDPOINT)
