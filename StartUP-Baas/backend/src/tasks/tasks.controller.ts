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
  Put,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@Request() req: any, @Body() createTaskDto: any): Promise<any> {
    return {
      success: true,
      data: await this.tasksService.create(
        req.user.sub as string,
        createTaskDto,
      ),
    };
  }

  @Get('my-tasks')
  async getMyTasks(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ): Promise<any> {
    return this.tasksService.getMyTasks(
      req.user.sub as string,
      status,
      priority,
    );
  }

  @Get('overdue')
  async getOverdueTasks(
    @Request() req: any,
    @Query('days_overdue') daysOverdue?: string,
  ): Promise<any> {
    return this.tasksService.getOverdueTasks(
      req.user.sub as string,
      daysOverdue ? parseInt(daysOverdue, 10) : 0,
    );
  }

  @Get('search')
  async searchTasks(
    @Request() req: any,
    @Query('query') query?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ): Promise<any> {
    return this.tasksService.searchTasks(
      req.user.sub as string,
      req.user.role as string,
      {
        query,
        status,
        priority,
      },
    );
  }

  @Get()
  async findAll(
    @Request() req: any,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ): Promise<any> {
    return this.tasksService.findAll(
      req.user.sub as string,
      req.user.role as string,
      type,
      status,
    );
  }

  @Get(':id/history')
  async getTaskHistory(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<any> {
    return this.tasksService.getTaskHistory(id, req.user.sub as string);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string): Promise<any> {
    return this.tasksService.findOne(
      id,
      req.user.sub as string,
      req.user.role as string,
    );
  }

  @Put(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: any,
  ): Promise<any> {
    return this.tasksService.update(id, req.user.sub as string, updateDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() statusDto: any,
  ): Promise<any> {
    return this.tasksService.updateStatus(
      id,
      req.user.sub as string,
      statusDto,
    );
  }

  @Patch(':id/accept')
  async acceptTask(@Request() req: any, @Param('id') id: string): Promise<any> {
    return this.tasksService.acceptTask(id, req.user.sub as string);
  }

  @Patch(':id/revision')
  @Roles('admin')
  async requestRevision(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ): Promise<any> {
    return this.tasksService.requestRevision(
      id,
      req.user.sub as string,
      body.revision_notes,
    );
  }

  @Patch('bulk-update')
  @Roles('admin')
  async bulkUpdate(@Request() req: any, @Body() body: any): Promise<any> {
    return this.tasksService.bulkUpdate(body.task_ids, body.updates);
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string): Promise<any> {
    return this.tasksService.remove(
      id,
      req.user.sub as string,
      req.user.role as string,
    );
  }


}
