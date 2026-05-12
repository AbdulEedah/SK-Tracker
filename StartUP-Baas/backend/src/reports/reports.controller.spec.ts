import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { createMockRepository } from '../test/test-utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { User } from '../users/entities/user.entity';

describe('ReportsController', () => {
  let controller: ReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(Report),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
