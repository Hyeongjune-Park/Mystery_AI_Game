import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return { ok: true };
  }

  @Post('echo')
  echo(@Body() body: { message: string }) {
    return { reply: `echo: ${body.message}` };
  }
}
