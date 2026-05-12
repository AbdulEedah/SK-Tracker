import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  Body,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Response } from 'express';
import * as fs from 'fs';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadFile(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('category') category?: string,
    @Body('is_public') isPublic?: string,
  ) {
    const isPub = isPublic === 'true';
    return {
      success: true,
      data: await this.filesService.uploadFile(
        req.user.sub,
        file,
        category,
        isPub,
      ),
    };
  }

  @Get(':id')
  async getFile(@Param('id') id: string, @Res() res: any) {
    const file = await this.filesService.getFile(id);
    if (!fs.existsSync(file.file_path)) {
      return res.status(404).send('File not found on disk');
    }
    return res.sendFile(file.filename, { root: './uploads' });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteFile(@Param('id') id: string) {
    return this.filesService.removeFile(id);
  }
}
