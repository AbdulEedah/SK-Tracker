import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@Request() req: any) {
    return this.notificationsService.findAll(req.user.sub);
  }

  @Post('read-all')
  async markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.sub);
  }

  @Put(':id/read')
  async markAsRead(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.sub, id);
  }

  @Get('preferences')
  async getPreferences(@Request() req: any) {
    return this.notificationsService.getPreferences(req.user.sub);
  }

  @Put('preferences')
  async updatePreferences(@Request() req: any, @Body() prefsDto: any) {
    return this.notificationsService.updatePreferences(req.user.sub, prefsDto);
  }
}
