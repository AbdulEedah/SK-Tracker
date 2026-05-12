import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommunicationsService } from './communications.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('communications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  @Post('email-templates')
  @Roles('admin')
  async createTemplate(@Request() req: any, @Body() createTemplateDto: any) {
    return {
      success: true,
      data: await this.communicationsService.createEmailTemplate(
        req.user.sub,
        createTemplateDto,
      ),
    };
  }

  @Get('email-templates')
  async getTemplates() {
    return {
      success: true,
      data: await this.communicationsService.getEmailTemplates(),
    };
  }

  @Get('email-templates/:id')
  async getTemplate(@Param('id') id: string) {
    return {
      success: true,
      data: await this.communicationsService.getEmailTemplate(id),
    };
  }

  @Put('email-templates/:id')
  @Roles('admin')
  async updateTemplate(
    @Param('id') id: string,
    @Body() updateTemplateDto: any,
  ) {
    return {
      success: true,
      data: await this.communicationsService.updateEmailTemplate(
        id,
        updateTemplateDto,
      ),
    };
  }

  @Delete('email-templates/:id')
  @Roles('admin')
  async deleteTemplate(@Param('id') id: string) {
    return this.communicationsService.deleteEmailTemplate(id);
  }

  @Post('email-templates/:id/test')
  @Roles('admin')
  async testTemplate(@Param('id') id: string, @Body() testData: any) {
    return this.communicationsService.testEmailTemplate(id, testData);
  }
}
