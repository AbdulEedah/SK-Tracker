import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { createMockRepository } from '../test/test-utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../tasks/entities/task.entity';
import { Report } from '../reports/entities/report.entity';
import { Meeting } from '../meetings/entities/meeting.entity';
import { MeetingRegistration } from '../meetings/entities/meeting-registration.entity';
import { Event } from '../events/entities/event.entity';
import { EventRegistration } from '../events/entities/event-registration.entity';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
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
          provide: getRepositoryToken(MeetingRegistration),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Event),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(EventRegistration),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
