export const PluginPriority = {
  LOW: 10,
  DEFAULT: 100,
  HIGH: 1000,
} as const

export type PluginPriority = ValueOf<typeof PluginPriority>
