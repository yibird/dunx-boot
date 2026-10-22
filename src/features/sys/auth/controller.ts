import { Controller, Get, Post, type Input } from '@dunx/http'
import { ApiDoc } from '@dunx/openapi'
import { isProd } from '@/infra/config'
import { Api, apiRouteResponse } from '@/infra/model'
import { ApiStatus } from '@/constants'
import {
  sysAuthAccountLoginReqSchema,
  sysAuthAccountRegisterReqSchema,
  sysAuthEmailRegisterReqSchema,
  sysAuthImageCaptchaRespSchema,
  sysAuthPhoneLoginReqSchema,
  sysAuthPhoneRegisterReqSchema,
  sysAuthSessionSchema,
  sysAuthSmsCaptchaReqSchema,
} from './schema'
import { SysAuthService } from './service'

export const routes = {
  imageCaptcha: {
    response: apiRouteResponse(sysAuthImageCaptchaRespSchema),
  },
  smsCaptcha: {
    status: ApiStatus.OK,
    body: sysAuthSmsCaptchaReqSchema,
    response: apiRouteResponse(sysAuthSmsCaptchaReqSchema),
  },
  accountRegister: {
    status: ApiStatus.OK,
    body: sysAuthAccountRegisterReqSchema,
    response: apiRouteResponse(),
  },
  emailRegister: {
    status: ApiStatus.OK,
    body: sysAuthEmailRegisterReqSchema,
    response: apiRouteResponse(),
  },
  phoneRegister: {
    status: ApiStatus.OK,
    body: sysAuthPhoneRegisterReqSchema,
    response: apiRouteResponse(),
  },
  accountLogin: {
    status: ApiStatus.OK,
    body: sysAuthAccountLoginReqSchema,
    response: apiRouteResponse(sysAuthSessionSchema),
  },
  devLogin: {
    response: apiRouteResponse(sysAuthSessionSchema),
  },
  phoneLogin: {
    status: ApiStatus.OK,
    body: sysAuthPhoneLoginReqSchema,
    response: apiRouteResponse(sysAuthSessionSchema),
  },
  logout: {
    response: apiRouteResponse(),
  },
  qrLogin: { response: apiRouteResponse(sysAuthSessionSchema) },
}

/**
 * 认证控制器:验证码、注册、账号/手机号/扫码登录、刷新、退出与当前用户。
 */
@ApiDoc({ tags: ['认证'] })
@Controller('auth', { excludes: isProd() ? ['devLogin'] : [] })
export class SysAuthController {
  constructor(private readonly authService: SysAuthService) {}

  @ApiDoc({ summary: '获取图形验证码' })
  @Get('/captcha/image', routes.imageCaptcha)
  async getImageCaptcha({ req }: Input) {
    const res = await this.authService.createImageCaptcha(req)
    return Response.json(Api.ok(res), { status: ApiStatus.OK })
  }

  @ApiDoc({ summary: '获取短信验证码' })
  @Post('/captcha/sms', routes.smsCaptcha)
  async getSmsCaptcha({ body, req }: Input<typeof routes.smsCaptcha>) {
    const res = await this.authService.smsCaptcha(body.phone, req)
    return Response.json(Api.ok(res), { status: ApiStatus.OK })
  }

  @ApiDoc({ summary: '账号密码注册' })
  @Post('/register/account', routes.accountRegister)
  async accountRegister({ body }: Input<typeof routes.accountRegister>) {
    const res = await this.authService.accountRegister(body)
    return Response.json(Api.ok(res), { status: ApiStatus.OK })
  }

  @ApiDoc({ summary: '邮箱密码注册' })
  @Post('/register/email', routes.emailRegister)
  async emailRegister({ body }: Input<typeof routes.emailRegister>) {
    const res = await this.authService.emailRegister(body)
    return Response.json(Api.ok(res), { status: ApiStatus.OK })
  }

  @ApiDoc({ summary: '手机号密码注册' })
  @Post('/register/phone', routes.phoneRegister)
  async phoneRegister({ body }: Input<typeof routes.phoneRegister>) {
    const res = await this.authService.phoneRegister(body)
    return Response.json(Api.ok(res), { status: ApiStatus.OK })
  }

  @ApiDoc({ summary: '账号密码登录' })
  @Post('/login', routes.accountLogin)
  async accountLogin(input: Input<typeof routes.accountLogin>) {
    const res = await this.authService.login(input.body, input.req)
    return Response.json(Api.ok(res), { status: ApiStatus.OK })
  }

  @ApiDoc({ summary: '开发快速登录' })
  @Post('/devLogin', routes.devLogin)
  async devLogin({ req }: Input<{}>) {
    const res = await this.authService.devLogin(req)
    return Response.json(Api.ok(res), { status: ApiStatus.OK })
  }

  @ApiDoc({ summary: '手机号登录' })
  @Post('/login/phone', routes.phoneLogin)
  async phoneLogin(input: Input<typeof routes.phoneLogin>) {
    const res = await this.authService.phoneLogin(input.body, input.req)
    return Response.json(Api.ok(res), { status: ApiStatus.OK })
  }

  @ApiDoc({ summary: '退出登录' })
  @Post('/logout', routes.logout)
  async logout({ req }: Input<{}>) {
    const res = await this.authService.logout(req)
    return Response.json(Api.ok(res), { status: ApiStatus.OK })
  }

  @ApiDoc({ summary: '获取扫码登录二维码' })
  @Get('/qr', routes.qrLogin)
  async qrLogin({ req }: Input<{}>) {
    const res = await this.authService.devLogin(req)
    return Response.json(Api.ok(res), { status: ApiStatus.OK })
  }
}
