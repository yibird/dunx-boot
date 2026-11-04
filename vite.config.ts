import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite-plus'

const fmt = JSON.parse(
  readFileSync(new URL('.oxfmtrc.json', import.meta.url), 'utf8')
)

export default defineConfig({ fmt })
