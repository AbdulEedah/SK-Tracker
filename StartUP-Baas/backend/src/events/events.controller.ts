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
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles('admin')
  async create(@Request() req: any, @Body() createEventDto: any) {
    return {
      success: true,
      data: await this.eventsService.create(req.user.sub, createEventDto),
    };
  }

  @Get()
  async findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('featured') featured?: string,
  ) {
    return {
      success: true,
      data: await this.eventsService.findAll(type, status, featured),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { success: true, data: await this.eventsService.findOne(id) };
  }

  @Patch(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Body() updateEventDto: any) {
    return {
      success: true,
      data: await this.eventsService.update(id, updateEventDto),
    };
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Post(':id/register')
  async register(@Request() req: any, @Param('id') id: string) {
    return this.eventsService.register(id, req.user.sub);
  }

  @Post(':id/feedback')
  async submitFeedback(
    @Request() req: any,
    @Param('id') id: string,
    @Body() feedbackDto: any,
  ) {
    return this.eventsService.submitFeedback(id, req.user.sub, feedbackDto);
  }
}
