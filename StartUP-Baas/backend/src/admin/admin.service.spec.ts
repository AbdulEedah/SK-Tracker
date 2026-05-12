import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { createMockRepository } from '../test/test-utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { Report } from '../reports/entities/report.entity';
import { Meeting } from '../meetings/entities/meeting.entity';
import { Event } from '../events/entities/event.entity';

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Task),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Report),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Meeting),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Event),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
