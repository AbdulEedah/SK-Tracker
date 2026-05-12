import { Test, TestingModule } from '@nestjs/testing';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meetings.service';
import { createMockRepository } from '../test/test-utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Meeting } from './entities/meeting.entity';
import { MeetingRegistration } from './entities/meeting-registration.entity';

describe('MeetingsController', () => {
  let controller: MeetingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetingsController],
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

    controller = module.get<MeetingsController>(MeetingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
