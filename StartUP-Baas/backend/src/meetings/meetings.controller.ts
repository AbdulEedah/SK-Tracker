import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('meetings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  @Roles('admin')
  async create(@Request() req: any, @Body() createMeetingDto: any) {
    return {
      success: true,
      data: await this.meetingsService.create(req.user.sub, createMeetingDto),
    };
  }

  @Get()
  async findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return {
      success: true,
      data: await this.meetingsService.findAll(type, status),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { success: true, data: await this.meetingsService.findOne(id) };
  }

  @Patch(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Body() updateMeetingDto: any) {
    return {
      success: true,
      data: await this.meetingsService.update(id, updateMeetingDto),
    };
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string) {
    return this.meetingsService.remove(id);
  }

  @Post(':id/register')
  async register(@Request() req: any, @Param('id') id: string) {
    return this.meetingsService.register(id, req.user.sub);
  }
}
