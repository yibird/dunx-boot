import { ImagesModule } from '@dunx/infra/images'
import { AppConfigService } from '../config'
import type { DynamicModule } from '@dunx/core'

/**
 * 图片处理：全局发布 `Images` / `ImagesOptions`，质量与尺寸上限来自配置。
 *
 * 三个上限都必须在配置文件里给出：不配时框架允许 ~268MP，
 * 一次解码就是 1GB 左右的 RGBA，等于把解压炸弹的门打开。
 */
export const AppImagesModule: DynamicModule = {
  ...ImagesModule.forRootAsync({
    useFactory: (config: AppConfigService) => {
      const {
        quality = 80,
        maxPixels = 268000000,
        maxWidth = 268000000,
        maxHeight = 268000000,
      } = config.values.images
      return { quality, maxPixels, maxWidth, maxHeight }
    },
    inject: [AppConfigService] as const,
  }),
  global: true,
}
