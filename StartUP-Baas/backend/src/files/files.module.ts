import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { File } from './entities/file.entity';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    MulterModule.register({ dest: './uploads' }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
