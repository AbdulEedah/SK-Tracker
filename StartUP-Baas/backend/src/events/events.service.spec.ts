import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { createMockRepository } from '../test/test-utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventRegistration } from './entities/event-registration.entity';
import { EventFeedback } from './entities/event-feedback.entity';

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(EventRegistration),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(EventFeedback),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
