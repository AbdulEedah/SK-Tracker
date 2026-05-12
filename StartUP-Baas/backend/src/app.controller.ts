import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): any {
    return {
      status: 'ok',
      message: 'API is healthy',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('status')
  getStatus(): any {
    return {
      success: true,
      status: 'running',
      message: 'API server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
