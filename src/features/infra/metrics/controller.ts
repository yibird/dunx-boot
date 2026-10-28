import { Controller, Get } from '@dunx/http'
import { ApiDoc } from '@dunx/openapi'
import { SysMetricsService } from './service'
import {
  SysCacheMetricsSchema,
  SysMetricsSchema,
  SysQueryMetricsSchema,
  SysQueueMetricsSchema,
  SysRedisMetricsSchema,
  SysRequestMetricsSchema,
} from './schema'
import { Api, apiRouteResponse } from '@/infra/model'
import { ApiStatus } from '@/constants'

@Controller('/metrics')
@ApiDoc({ tags: ['指标'] })
export class SysMetricsController {
  constructor(private readonly metricsService: SysMetricsService) {}

  @Get('/getMetrics', { response: apiRouteResponse(SysMetricsSchema) })
  @ApiDoc({ summary: '获取所有指标' })
  getMetrics() {
    const res = this.metricsService.getMetrics()
    return Response.json(Api.ok(res), { status: ApiStatus.OK })
  }

  @Get('/getRequestMetrics', {
    response: apiRouteResponse(SysRequestMetricsSchema),
  })
  @ApiDoc({ summary: '获取请求指标' })
  getRequestMetrics() {
    const res = this.metricsService.getRequestMetrics()
    return Response.json(Api.ok(res), { status: ApiStatus.OK })
  }

  @Get('/getQueryMetrics', {
    response: apiRouteResponse(SysQueryMetricsSchema),
  })
  @ApiDoc({ summary: '获取数据库查询指标' })
  getQueryMetrics() {
    const res = this.metricsService.getQueryMetrics()
    return Response.json(Api.ok(res), { status: ApiStatus.OK })
  }

  @Get('/getCacheMetrics', {
    response: apiRouteResponse(SysCacheMetricsSchema),
  })
  @ApiDoc({ summary: '获取缓存指标' })
  getCacheMetrics() {
    const res = this.metricsService.getCacheMetrics()
    return Response.json(Api.ok(res), { status: ApiStatus.OK })
  }

  @Get('/getRedisMetrics', {
    response: apiRouteResponse(SysRedisMetricsSchema),
  })
  @ApiDoc({ summary: '获取Redis指标' })
  getRedisMetrics() {
    const res = this.metricsService.getRedisMetrics()
    return Response.json(Api.ok(res), { status: ApiStatus.OK })
  }

  @Get('/getQueueMetrics', {
    response: apiRouteResponse(SysQueueMetricsSchema),
  })
  @ApiDoc({ summary: '获取队列指标' })
  getQueueMetrics() {
    const res = this.metricsService.getQueueMetrics()
    return Response.json(Api.ok(res), { status: ApiStatus.OK })
  }

  /**
   * Prometheus / OpenMetrics 抓取端点。
   *
   * 返回纯文本，不是 JSON 信封；路径已加入 `security.auth.whiteList`。
   */
  @Get('/openmetrics')
  @ApiDoc({ summary: 'Prometheus OpenMetrics 指标' })
  async openMetrics() {
    const text = await this.metricsService.openMetrics()
    return new Response(text, {
      status: ApiStatus.OK,
      headers: {
        'content-type': 'text/plain; version=0.0.4; charset=utf-8',
      },
    })
  }
}
