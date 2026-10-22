import { customType } from 'drizzle-orm/pg-core'

export const bigintString = customType<{
  data: string
  driverData: string
  driverOutput: string | number | bigint
}>({
  dataType: () => 'bigint',
  toDriver: (value) => value,
  fromDriver: (value) => String(value),
})

export const bigserialString = customType<{
  data: string
  driverData: string
  driverOutput: string | number | bigint
  notNull: true
  default: true
}>({
  dataType: () => 'bigserial',
  toDriver: (value) => value,
  fromDriver: (value) => String(value),
})
