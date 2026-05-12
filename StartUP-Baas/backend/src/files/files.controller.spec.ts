import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { createMockRepository } from '../test/test-utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { File } from './entities/file.entity';

describe('FilesController', () => {
  let controller: FilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        FilesService,
        {
          provide: getRepositoryToken(File),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
