import {
  Controller,
  Get,
  Param,
  Put,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  async findAll() {
    // Basic implementation for brevity. Needs pagination in real world
    return { success: true, data: [] };
  }

  @Get('me')
  async getProfile(@Request() req: any) {
    const user = await this.usersService.findById(req.user.sub);
    const { password_hash, ...result } = user;
    return { success: true, data: result };
  }

  @Get(':userId')
  async findOne(@Param('userId') userId: string) {
    const user = await this.usersService.findById(userId);
    const { password_hash, ...result } = user;
    return { success: true, data: result };
  }

  @Put(':userId')
  async update(@Param('userId') userId: string, @Body() updateDto: any) {
    const updated = await this.usersService.update(userId, updateDto);
    const { password_hash, ...result } = updated;
    return { success: true, data: result };
  }

  @Patch(':userId/status')
  @Roles('admin')
  async updateStatus(
    @Param('userId') userId: string,
    @Body() statusDto: { is_active: boolean },
  ) {
    const updated = await this.usersService.update(userId, {
      is_active: statusDto.is_active,
    });
    return { success: true, data: { is_active: updated.is_active } };
  }

  @Delete(':userId')
  @Roles('admin')
  async remove(@Param('userId') userId: string) {
    await this.usersService.update(userId, { is_active: false }); // Soft delete logic
    return { success: true };
  }
}
