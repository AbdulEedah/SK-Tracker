import { Test, TestingModule } from '@nestjs/testing';
import { MeetingsService } from './meetings.service';
import { createMockRepository } from '../test/test-utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Meeting } from './entities/meeting.entity';
import { MeetingRegistration } from './entities/meeting-registration.entity';

describe('MeetingsService', () => {
  let service: MeetingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingsService,
        {
          provide: getRepositoryToken(Meeting),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(MeetingRegistration),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<MeetingsService>(MeetingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
