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
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async create(@Request() req: any, @Body() createReportDto: any) {
    return {
      success: true,
      data: await this.reportsService.create(req.user.sub, createReportDto),
    };
  }

  @Get()
  async findAll(
    @Request() req: any,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 10;
    return {
      success: true,
      data: await this.reportsService.findAll(
        req.user.sub,
        req.user.role,
        p,
        l,
      ),
    };
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return {
      success: true,
      data: await this.reportsService.findOne(id, req.user.sub, req.user.role),
    };
  }

  @Patch(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateReportDto: any,
  ) {
    return {
      success: true,
      data: await this.reportsService.update(id, req.user.sub, updateReportDto),
    };
  }

  @Patch(':id/status')
  @Roles('admin')
  async updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() statusDto: any,
  ) {
    return {
      success: true,
      data: await this.reportsService.updateStatus(id, req.user.sub, statusDto),
    };
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.reportsService.remove(id, req.user.sub);
  }
}
