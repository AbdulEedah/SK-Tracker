import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  async getAdminStats() {
    return this.adminService.getAdminStats();
  }

  @Get('users')
  async getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const currentPage = page ? parseInt(page, 10) : 1;
    const currentLimit = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getAllUsers(currentPage, currentLimit);
  }

  @Get('users/:id')
  async getUserDetails(@Param('id') userId: string) {
    return this.adminService.getUserDetails(userId);
  }

  @Put('users/:id/role')
  async updateUserRole(@Param('id') userId: string, @Body() body: any) {
    return this.adminService.updateUserRole(userId, body.role);
  }

  @Patch('users/:id/status')
  async updateUserStatus(@Param('id') userId: string, @Body() body: any) {
    return this.adminService.updateUserStatus(userId, body.is_active);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  @Get('audit-logs')
  async getAuditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const currentPage = page ? parseInt(page, 10) : 1;
    const currentLimit = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getAuditLogs(currentPage, currentLimit);
  }

  @Get('settings')
  async getSystemSettings() {
    return this.adminService.getSystemSettings();
  }

  @Put('settings/:key')
  async updateSystemSetting(@Param('key') key: string, @Body() body: any) {
    return this.adminService.updateSystemSetting(key, body.value);
  }
}
