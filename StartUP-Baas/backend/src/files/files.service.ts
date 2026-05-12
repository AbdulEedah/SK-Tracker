import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}

  async uploadFile(
    userId: string,
    file: Express.Multer.File,
    category: string = 'general',
    isPublic: boolean = false,
  ) {
    const fileRecord = this.fileRepository.create({
      filename: file.filename,
      original_name: file.originalname,
      file_path: file.path,
      file_size: file.size,
      mime_type: file.mimetype,
      category,
      is_public: isPublic,
      uploaded_by: userId,
    });

    return this.fileRepository.save(fileRecord);
  }

  async getFile(id: string) {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async removeFile(id: string) {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File not found');

    if (fs.existsSync(file.file_path)) {
      fs.unlinkSync(file.file_path);
    }

    await this.fileRepository.remove(file);
    return { success: true };
  }
}
